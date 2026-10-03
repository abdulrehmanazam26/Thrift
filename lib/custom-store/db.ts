import "server-only";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("The custom store database is not configured.");
  client ??= postgres(url, {
    ssl: "require",
    prepare: false, // Supabase transaction pooler does not support prepared statements.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return client;
}
