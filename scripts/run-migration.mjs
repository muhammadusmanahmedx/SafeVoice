import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const { Client } = pg;

async function connect() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error("Set SUPABASE_DB_URL in .env.local");
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase Postgres");
  return client;
}

async function run() {
  const client = await connect();

  const migrationsDir = resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), "utf8");
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`Done: ${file}`);
  }

  const seedPath = resolve(process.cwd(), "supabase/seed.sql");
  const seed = readFileSync(seedPath, "utf8");
  console.log("Running seed.sql...");
  await client.query(seed);
  console.log("Done: seed.sql");

  await client.end();
  console.log("Migration complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
