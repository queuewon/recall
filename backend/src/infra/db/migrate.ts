import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { DbClient } from "./client";

const migrationsFolder = fileURLToPath(new URL("../../../drizzle", import.meta.url));

export function runMigrations(db: DbClient): void {
  migrate(db, { migrationsFolder });
}
