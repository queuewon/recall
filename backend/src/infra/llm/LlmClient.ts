import type { PromptTemplate } from "./PromptTemplate";

export type LlmError =
  | { type: "network"; message: string }
  | { type: "rate_limit"; message: string }
  | { type: "invalid_response"; message: string }
  | { type: "refusal"; message: string };

export type LlmResult<T> = { ok: true; data: T } | { ok: false; error: LlmError };

export interface LlmClient {
  complete<T>(
    template: PromptTemplate<T>,
    variables: Record<string, string>
  ): Promise<LlmResult<T>>;
}
