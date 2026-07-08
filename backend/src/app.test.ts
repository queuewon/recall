import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import type { NoteService } from "./service/noteService";

function makeApp() {
  const noteService: NoteService = {
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  };
  return createApp({ noteService });
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
});
