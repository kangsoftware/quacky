import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Prisma runs this file directly, so load .env files before reading process.env.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
