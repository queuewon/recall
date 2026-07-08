import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createDbClient } from "./client";

describe("createDbClient", () => {
  it("connects to an in-memory SQLite database and executes a query", () => {
    const db = createDbClient(":memory:");

    const row = db.get<{ ok: number }>(sql`select 1 as ok`);

    expect(row).toEqual({ ok: 1 });
  });
});
