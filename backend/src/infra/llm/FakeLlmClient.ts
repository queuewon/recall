import type { LlmClient, LlmResult } from "./LlmClient";
import type { PromptTemplate } from "./PromptTemplate";

type FakeLlmResponder =
  LlmResult<unknown> | ((template: PromptTemplate<unknown>) => LlmResult<unknown>);

export class FakeLlmClient implements LlmClient {
  constructor(private readonly respond: FakeLlmResponder) {}

  async complete<T>(
    template: PromptTemplate<T>,
    _variables: Record<string, string>
  ): Promise<LlmResult<T>> {
    const response =
      typeof this.respond === "function"
        ? this.respond(template as PromptTemplate<unknown>)
        : this.respond;
    // 제네릭 메서드를 고정/템플릿 분기 응답으로 대체하는 테스트 더블의 근본적 한계 — 승인된 유일한 타입 우회 지점.
    return response as LlmResult<T>;
  }
}
