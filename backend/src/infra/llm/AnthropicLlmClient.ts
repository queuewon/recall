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
      // SDK가 네트워크 요청 전에 로컬에서 던지는 에러(예: 인증 정보 미설정)는
      // APIError/RateLimitError가 아닌 일반 Error다 — 이것도 LlmResult 실패로
      // 변환해야 서버 프로세스까지 크래시하지 않는다.
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: { type: "network", message } };
    }
  }
}
