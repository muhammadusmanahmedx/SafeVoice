import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const RIVERSIDE_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_PASSWORD = "Demo@SafeVoice1";

const USERS = [
  {
    email: "student@riverside.demo",
    password: DEMO_PASSWORD,
    role: "student",
    display_name: "Demo Student",
    institution_id: RIVERSIDE_ID,
  },
  {
    email: "faculty@riverside.demo",
    password: DEMO_PASSWORD,
    role: "faculty",
    display_name: "Demo Faculty",
    institution_id: RIVERSIDE_ID,
  },
  {
    email: "admin@riverside.demo",
    password: DEMO_PASSWORD,
    role: "admin",
    display_name: "Demo Admin",
    institution_id: RIVERSIDE_ID,
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing Supabase URL or service role key in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Creating demo users...\n");

  for (const user of USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === user.email);

    let userId = found?.id;

    if (found) {
      console.log(`Auth user exists: ${user.email}`);
      await supabase.auth.admin.updateUserById(found.id, {
        password: user.password,
        email_confirm: true,
      });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { display_name: user.display_name },
      });

      if (error) {
        console.error(`Failed to create ${user.email}:`, error.message);
        continue;
      }
      userId = data.user.id;
      console.log(`Created auth user: ${user.email}`);
    }

    if (!userId) continue;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        institution_id: user.institution_id,
        role: user.role,
        display_name: user.display_name,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error(`Failed profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`Profile ready: ${user.email} (${user.role})\n`);
    }
  }

  console.log("=".repeat(50));
  console.log("Demo accounts (Riverside Academy):");
  console.log("=".repeat(50));
  for (const u of USERS) {
    console.log(`${u.role.padEnd(8)} ${u.email}  /  ${u.password}`);
  }
  console.log("\nFaculty registration code (new faculty): FAC-DEMO-RV001");
  console.log("Login: http://localhost:3000/login");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
