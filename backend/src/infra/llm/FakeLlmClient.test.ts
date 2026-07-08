import { describe, expect, it } from "vitest";
import { FakeLlmClient } from "./FakeLlmClient";
import { summarizeNoteTemplate } from "./summarizeNote.template";

describe("FakeLlmClient", () => {
  it("returns the fixed success response it was constructed with", async () => {
    const client = new FakeLlmClient({ ok: true, data: { summary: "요약" } });

    const result = await client.complete(summarizeNoteTemplate, { noteContent: "내용" });

    expect(result).toEqual({ ok: true, data: { summary: "요약" } });
  });

  it("returns the fixed failure response it was constructed with", async () => {
    const client = new FakeLlmClient({
      ok: false,
      error: { type: "invalid_response", message: "schema mismatch" }
    });

    const result = await client.complete(summarizeNoteTemplate, { noteContent: "내용" });

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_response", message: "schema mismatch" }
    });
  });
});
