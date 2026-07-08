import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const manifestPath = resolve(process.cwd(), "public/manifest.json");

describe("manifest.json", () => {
  it("is valid JSON with the required PWA fields", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    expect(manifest.name).toBeTypeOf("string");
    expect(manifest.short_name).toBeTypeOf("string");
    expect(manifest.start_url).toBeTypeOf("string");
    expect(manifest.display).toBeTypeOf("string");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
