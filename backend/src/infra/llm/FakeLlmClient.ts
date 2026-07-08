import type { LlmClient, LlmResult } from "./LlmClient";
import type { PromptTemplate } from "./PromptTemplate";

export class FakeLlmClient implements LlmClient {
  constructor(private readonly response: LlmResult<unknown>) {}

  async complete<T>(
    _template: PromptTemplate<T>,
    _variables: Record<string, string>
  ): Promise<LlmResult<T>> {
    // 제네릭 메서드를 고정 응답으로 대체하는 테스트 더블의 근본적 한계 — 승인된 유일한 타입 우회 지점.
    return this.response as LlmResult<T>;
  }
}
