import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export function createDbClient(path: string) {
  const sqlite = new Database(path);
  return drizzle(sqlite);
}

export type DbClient = ReturnType<typeof createDbClient>;

export function createDefaultDbClient(): DbClient {
  return createDbClient(process.env.DATABASE_PATH ?? "./data/recall.db");
}
