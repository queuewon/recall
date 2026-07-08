import { describe, expect, it } from "vitest";
import { FakeLlmClient } from "./FakeLlmClient";
import type { LlmRequest } from "./LlmClient";

const request: LlmRequest = { messages: [{ role: "user", content: "hello" }] };

describe("FakeLlmClient", () => {
  it("returns the fixed success response it was constructed with", async () => {
    const client = new FakeLlmClient({ ok: true, text: "pong" });

    const result = await client.complete(request);

    expect(result).toEqual({ ok: true, text: "pong" });
  });

  it("returns the fixed failure response it was constructed with", async () => {
    const client = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "connection reset" }
    });

    const result = await client.complete(request);

    expect(result).toEqual({
      ok: false,
      error: { type: "network", message: "connection reset" }
    });
  });
});
