import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    // Not using env() here: it throws when DATABASE_URL is unset, which would break
    // `prisma generate` during `npm install` before .env is configured.
    url: process.env.DATABASE_URL ?? "",
  },
});
