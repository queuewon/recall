import type { LlmClient, LlmRequest, LlmResult } from "./LlmClient";

// 실구현은 스텁 — @anthropic-ai/sdk 의존성은 실제 연동 시점에 승인받아 추가한다.
export class AnthropicLlmClient implements LlmClient {
  async complete(_request: LlmRequest): Promise<LlmResult> {
    throw new Error("AnthropicLlmClient is not implemented yet");
  }
}
