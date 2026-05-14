// drizzle.config.ts
import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

// Load .env before reading DATABASE_URL
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in your .env file");
}


export default {
  // Where your Drizzle schema files are located
  schema: "./src/db/schema/index.ts",

  // Where drizzle-kit will write migration SQL files
  out: "./src/db/migrations",

  // Which database driver to use
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // When true, logs every SQL statement that drizzle-kit runs
  verbose: true,

  // When true, asks for confirmation before running destructive changes
  strict: true,
} satisfies Config;