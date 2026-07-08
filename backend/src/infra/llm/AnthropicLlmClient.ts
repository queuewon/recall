import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient, LlmResult } from "./LlmClient";
import type { PromptTemplate } from "./PromptTemplate";

const MODEL_BY_TIER = {
  fast: "claude-haiku-4-5",
  quality: "claude-sonnet-5"
} as const;

const RESULT_TOOL_NAME = "submit_result";

export class AnthropicLlmClient implements LlmClient {
  private readonly client = new Anthropic();

  async complete<T>(
    template: PromptTemplate<T>,
    variables: Record<string, string>
  ): Promise<LlmResult<T>> {
    const { user } = template.render(variables);

    try {
      const response = await this.client.messages.create({
        model: MODEL_BY_TIER[template.modelTier],
        max_tokens: 4096,
        messages: [{ role: "user", content: user }],
        tools: [
          {
            name: RESULT_TOOL_NAME,
            description: "Submit the structured result.",
            input_schema: template.toolInputSchema,
            strict: true
          }
        ],
        tool_choice: { type: "tool", name: RESULT_TOOL_NAME }
      });

      if (response.stop_reason === "refusal") {
        return { ok: false, error: { type: "refusal", message: "model declined to respond" } };
      }

      const toolUse = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );
      if (!toolUse) {
        return {
          ok: false,
          error: { type: "invalid_response", message: "no tool_use block in response" }
        };
      }

      const parsed = template.responseSchema.safeParse(toolUse.input);
      if (!parsed.success) {
        return { ok: false, error: { type: "invalid_response", message: parsed.error.message } };
      }
      return { ok: true, data: parsed.data };
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        return { ok: false, error: { type: "rate_limit", message: err.message } };
      }
      if (err instanceof Anthropic.APIError) {
        return { ok: false, error: { type: "network", message: err.message } };
      }
      throw err;
    }
  }
}
