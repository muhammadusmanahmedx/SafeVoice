import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const file = process.argv[2] ?? "008_ensure_counselor_weekly_availability.sql";
const sql = readFileSync(resolve(process.cwd(), "supabase/migrations", file), "utf8");

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log(`Running ${file}...`);
await client.query(sql);
await client.end();
console.log("Done.");
