/**
 * Creates a student account that signs in with a placeholder email address —
 * for a student who has no address to give yet, or doesn't want to use one.
 *
 *   npx tsx scripts/add-student.ts plan  --name "Valen" --email valen@ambaraedu.example
 *   npx tsx scripts/add-student.ts apply --name "Valen" --email valen@ambaraedu.example [--group UNDERGRAD]
 *
 * This runs against whatever `.env` points at — the local stack. For the live
 * site:  npm run prod -- npx tsx scripts/add-student.ts apply ...
 *
 * The account gets a long random password that is never printed or stored
 * anywhere: the tutor sets the real one from the student's page in the app
 * (Siswa → the student → reset password), which shows it once to pass on.
 *
 * No verification email is sent, and the address is recorded as verified —
 * a placeholder can't receive mail, and the student shouldn't be nagged to
 * confirm an address that doesn't exist. They can change it from their profile.
 */
import "dotenv/config";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { StudentGroup } from "../src/generated/prisma/enums";

const [mode = "plan", ...flags] = process.argv.slice(2);
const flag = (name: string) => {
  const i = flags.indexOf(`--${name}`);
  return i >= 0 ? flags[i + 1] : undefined;
};
const name = flag("name")?.trim();
const email = flag("email")?.trim().toLowerCase();
const groupRaw = flag("group");

if ((mode !== "plan" && mode !== "apply") || !name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('usage: npx tsx scripts/add-student.ts <plan|apply> --name "<name>" --email <address> [--group JUNIOR_HIGH|UNDERGRAD|GRAD]');
  process.exit(1);
}
if (groupRaw && !(Object.values(StudentGroup) as string[]).includes(groupRaw)) {
  console.error(`unknown group "${groupRaw}" — use one of ${Object.values(StudentGroup).join(", ")}`);
  process.exit(1);
}
const studentGroup = (groupRaw as StudentGroup | undefined) ?? null;

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    console.log(`database: ${new URL(process.env.DATABASE_URL!).host}`);
    const existing = await db.user.findUnique({ where: { email: email! } });
    if (existing) {
      console.log(`"${existing.name}" <${existing.email}> already exists (${existing.role}) — nothing to do`);
      return;
    }
    console.log(`student "${name}" <${email}>${studentGroup ? `, group ${studentGroup}` : ""} — will be created`);
    if (mode === "plan") {
      console.log("\nplan only — nothing changed. Run with `apply` to execute.");
      return;
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase.auth.admin.createUser({
      email: email!,
      password: randomBytes(32).toString("base64url"), // thrown away — see the note at the top
      email_confirm: true,
    });
    if (error) throw new Error(`could not create the login: ${error.message}`);

    try {
      await db.user.create({
        data: { id: data.user.id, email: email!, name: name!, role: "STUDENT", studentGroup, emailVerifiedAt: new Date() },
      });
    } catch (e) {
      // Don't leave a login behind with no account row: it could never be used, and would hold the address.
      await supabase.auth.admin.deleteUser(data.user.id);
      throw e;
    }
    console.log(`✓ created. Set the password in the app: Siswa → ${name} → reset password.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
