import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createDbClient } from "./client";

describe("createDbClient", () => {
  it("connects to an in-memory SQLite database and executes a query", () => {
    const db = createDbClient(":memory:");

    const row = db.get<{ ok: number }>(sql`select 1 as ok`);

    expect(row).toEqual({ ok: 1 });
  });

  describe("when the parent directory does not exist yet", () => {
    const testRootDir = join(tmpdir(), `recall-lab-client-test-${randomUUID()}`);
    const dbDir = join(testRootDir, "nested", "subdir");
    const dbPath = join(dbDir, "test.db");

    afterEach(() => {
      rmSync(testRootDir, { recursive: true, force: true });
    });

    it("creates the missing directory instead of throwing", () => {
      expect(existsSync(dbDir)).toBe(false);

      const db = createDbClient(dbPath);
      const row = db.get<{ ok: number }>(sql`select 1 as ok`);

      expect(row).toEqual({ ok: 1 });
      expect(existsSync(dbPath)).toBe(true);
    });
  });
});
