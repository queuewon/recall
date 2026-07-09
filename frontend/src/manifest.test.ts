import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(process.cwd(), "public");
const manifestPath = resolve(publicDir, "manifest.json");

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

  it("has an icons array whose every src points to a file that actually exists", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    for (const icon of manifest.icons) {
      const iconPath = resolve(publicDir, `.${icon.src}`);
      expect(existsSync(iconPath), `missing icon file for src "${icon.src}"`).toBe(true);
    }
  });
});
