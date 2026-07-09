import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnthropicLlmClient } from "./AnthropicLlmClient";
import { extractConceptsTemplate } from "./extractConcepts.template";

describe("AnthropicLlmClient", () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;
  const originalAuthToken = process.env.ANTHROPIC_AUTH_TOKEN;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    }
    if (originalAuthToken === undefined) {
      delete process.env.ANTHROPIC_AUTH_TOKEN;
    } else {
      process.env.ANTHROPIC_AUTH_TOKEN = originalAuthToken;
    }
  });

  it("resolves to a normal LlmResult failure instead of throwing when no API key is configured", async () => {
    const client = new AnthropicLlmClient();

    await expect(
      client.complete(extractConceptsTemplate, { noteContent: "테스트 노트" })
    ).resolves.toEqual({
      ok: false,
      error: { type: expect.any(String), message: expect.any(String) }
    });
  });
});
