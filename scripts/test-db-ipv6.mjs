import pg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const enc = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);

const urls = [
  `postgresql://postgres:${enc}@[2406:da14:1d62:b400:c285:6909:f3c4:b7e7]:5432/postgres`,
  `postgresql://postgres:${enc}@db.inuuiabblxnrsdpummrw.supabase.co:5432/postgres?sslmode=require`,
];

for (const u of urls) {
  const client = new pg.Client({ connectionString: u, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("SUCCESS");
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log("FAIL:", e.message);
    await client.end().catch(() => {});
  }
}
