import pg from "pg";
import dotenv from "dotenv";
import { resolve } from "path";
import dns from "dns";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const p = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);

// Force IPv4 first for direct connection
dns.setDefaultResultOrder("ipv4first");

const urls = [
  `postgresql://postgres:${p}@db.inuuiabblxnrsdpummrw.supabase.co:5432/postgres`,
  `postgresql://postgres:${p}@db.inuuiabblxnrsdpummrw.supabase.co:6543/postgres`,
];

for (const u of urls) {
  const client = new pg.Client({
    connectionString: u,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query("select version()");
    console.log("SUCCESS direct:", u.replace(/:([^:@]+)@/, ":***@"));
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log("FAIL:", e.message);
    await client.end().catch(() => {});
  }
}

process.exit(1);
