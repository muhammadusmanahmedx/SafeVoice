import pg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const enc = encodeURIComponent("SuperVoice@hoor");
const ref = "inuuiabblxnrsdpummrw";

const urls = [
  `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres:${enc}@db.${ref}.supabase.co:6543/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${enc}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${enc}@${ref}.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@${ref}.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
];

for (const u of urls) {
  const client = new pg.Client({ connectionString: u, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const r = await client.query("select 1 as ok");
    console.log("SUCCESS:", u.replace(enc, "***"), r.rows);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log("FAIL", u.match(/@([^/]+)/)?.[1], "->", e.message?.slice(0, 90));
    await client.end().catch(() => {});
  }
}
process.exit(1);
