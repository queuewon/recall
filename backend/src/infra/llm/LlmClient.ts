export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  maxTokens?: number;
}

export type LlmError =
  | { type: "network"; message: string }
  | { type: "rate_limit"; message: string }
  | { type: "invalid_response"; message: string };

export type LlmResult = { ok: true; text: string } | { ok: false; error: LlmError };

export interface LlmClient {
  complete(request: LlmRequest): Promise<LlmResult>;
}
