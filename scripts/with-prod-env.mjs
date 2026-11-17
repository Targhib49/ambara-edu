// Runs one command against PRODUCTION instead of the local stack.
//
//   npm run prod -- npx tsx scripts/setup-olim-levels.ts
//   npm run prod -- npx prisma migrate deploy
//
// `.env` holds the local Supabase stack, so everything — `next dev`, the
// scripts, Prisma — is local unless it goes through here. The production
// values live in `.env.prod`, a name nothing loads by itself. They are put
// into the environment before the command starts, and `dotenv/config` inside
// the command never overwrites a variable that is already set.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { config } from "dotenv";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: npm run prod -- <command> [args...]");
  process.exit(1);
}
if (!existsSync(".env.prod")) {
  console.error("No .env.prod here — run this from the project root, with the production values in .env.prod.");
  process.exit(1);
}

config({ path: ".env.prod", override: true, quiet: true });

let host = "(unknown host)";
try {
  host = new URL(process.env.DATABASE_URL ?? "").hostname;
} catch {}
console.error(`\n⚠  PRODUCTION — database ${host}\n   ${command} ${args.join(" ")}\n`);

const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
