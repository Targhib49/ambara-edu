import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Migrations use the direct (non-pooled) connection; the app itself connects
  // through the pooled DATABASE_URL via the pg adapter in src/lib/db.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
