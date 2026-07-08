import type { LlmClient, LlmRequest, LlmResult } from "./LlmClient";

export class FakeLlmClient implements LlmClient {
  constructor(private readonly response: LlmResult) {}

  async complete(_request: LlmRequest): Promise<LlmResult> {
    return this.response;
  }
}
