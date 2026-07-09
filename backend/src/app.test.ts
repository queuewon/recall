import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import type { NoteService } from "./service/noteService";
import type { QuestionGenerationService } from "./service/questionGenerationService";
import type { AnswerService } from "./service/answerService";

function makeApp() {
  const noteService: NoteService = {
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  };
  const questionGenerationService: QuestionGenerationService = {
    generateForNote: vi.fn(),
    listForNote: vi.fn(),
    get: vi.fn()
  };
  const answerService: AnswerService = {
    submit: vi.fn()
  };
  return createApp({ noteService, questionGenerationService, answerService });
}

describe("createApp", () => {
  it("responds 200 with status ok on GET /health", async () => {
    const res = await makeApp().request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("responds 404 for an unknown route", async () => {
    const res = await makeApp().request("/__not_exist__");

    expect(res.status).toBe(404);
  });

  it("responds with an Access-Control-Allow-Origin header for cross-origin requests", async () => {
    const res = await makeApp().request("/health", {
      headers: { Origin: "http://192.168.1.5:5173" }
    });

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
