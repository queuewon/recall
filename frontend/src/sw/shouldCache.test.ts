import { describe, expect, it } from "vitest";
import { shouldCache } from "./shouldCache";

describe("shouldCache", () => {
  it("returns false for API paths under /notes", () => {
    expect(shouldCache("/notes")).toBe(false);
    expect(shouldCache("/notes/3fa85f64-5717-4562-b3fc-2c963f66afa6/questions")).toBe(false);
  });

  it("returns false for API paths under /questions", () => {
    expect(shouldCache("/questions")).toBe(false);
    expect(shouldCache("/questions/3fa85f64-5717-4562-b3fc-2c963f66afa6")).toBe(false);
    expect(shouldCache("/questions/3fa85f64-5717-4562-b3fc-2c963f66afa6/answers")).toBe(false);
  });

  it("returns false for /health", () => {
    expect(shouldCache("/health")).toBe(false);
  });

  it("does not false-positive on paths that merely start with an API prefix string", () => {
    expect(shouldCache("/notesomething")).toBe(true);
    expect(shouldCache("/questionsnaire")).toBe(true);
    expect(shouldCache("/healthcheck")).toBe(true);
  });

  it("returns true for shell/static asset paths", () => {
    expect(shouldCache("/")).toBe(true);
    expect(shouldCache("/manifest.json")).toBe(true);
    expect(shouldCache("/icons/icon.svg")).toBe(true);
    expect(shouldCache("/assets/index-abc123.js")).toBe(true);
  });
});
