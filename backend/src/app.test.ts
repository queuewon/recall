import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  it("responds 200 with status ok on GET /health", async () => {
    const res = await createApp().request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("responds 404 for an unknown route", async () => {
    const res = await createApp().request("/__not_exist__");

    expect(res.status).toBe(404);
  });
});
