import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import type { NoteService } from "../service/noteService";
import { parseNoteId, type Note } from "../domain";

const sampleNote: Note = {
  id: parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
  source: { type: "InAppMemo" },
  title: "제목",
  contentMarkdown: "내용",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z")
};

function makeApp(overrides: Partial<NoteService> = {}) {
  const noteService: NoteService = {
    create: vi.fn(async () => sampleNote),
    list: vi.fn(async () => [sampleNote]),
    get: vi.fn(async () => sampleNote),
    update: vi.fn(async () => sampleNote),
    remove: vi.fn(async () => true),
    ...overrides
  };
  return createApp({ noteService });
}

function jsonRequest(method: string, body: unknown) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

describe("notes routes", () => {
  it("POST /notes with a valid body returns 201 and the created note", async () => {
    const app = makeApp();

    const res = await app.request(
      "/notes",
      jsonRequest("POST", { title: "제목", contentMarkdown: "내용" })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { title: string };
    expect(body.title).toBe("제목");
  });

  it("POST /notes without a title returns 400", async () => {
    const app = makeApp();

    const res = await app.request("/notes", jsonRequest("POST", { contentMarkdown: "내용" }));

    expect(res.status).toBe(400);
  });

  it("POST /notes with an empty title returns 400", async () => {
    const app = makeApp();

    const res = await app.request(
      "/notes",
      jsonRequest("POST", { title: "", contentMarkdown: "내용" })
    );

    expect(res.status).toBe(400);
  });

  it("GET /notes returns 200 and an array", async () => {
    const app = makeApp();

    const res = await app.request("/notes");

    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("GET /notes/:id with an existing id returns 200", async () => {
    const app = makeApp();

    const res = await app.request(`/notes/${sampleNote.id}`);

    expect(res.status).toBe(200);
  });

  it("GET /notes/:id with a malformed id returns 400", async () => {
    const app = makeApp();

    const res = await app.request("/notes/not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("GET /notes/:id with a well-formed but missing id returns 404", async () => {
    const app = makeApp({ get: vi.fn(async () => null) });

    const res = await app.request("/notes/00000000-0000-4000-8000-000000000000");

    expect(res.status).toBe(404);
  });

  it("PATCH /notes/:id with an empty body returns 400", async () => {
    const app = makeApp();

    const res = await app.request(`/notes/${sampleNote.id}`, jsonRequest("PATCH", {}));

    expect(res.status).toBe(400);
  });

  it("PATCH /notes/:id returns 404 when the service reports not found", async () => {
    const app = makeApp({ update: vi.fn(async () => null) });

    const res = await app.request(
      `/notes/${sampleNote.id}`,
      jsonRequest("PATCH", { title: "새 제목" })
    );

    expect(res.status).toBe(404);
  });

  it("DELETE /notes/:id returns 204 when deleted", async () => {
    const app = makeApp();

    const res = await app.request(`/notes/${sampleNote.id}`, { method: "DELETE" });

    expect(res.status).toBe(204);
  });

  it("DELETE /notes/:id returns 404 when not found", async () => {
    const app = makeApp({ remove: vi.fn(async () => false) });

    const res = await app.request(`/notes/${sampleNote.id}`, { method: "DELETE" });

    expect(res.status).toBe(404);
  });
});
