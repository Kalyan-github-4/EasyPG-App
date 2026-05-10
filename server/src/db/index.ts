import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
export type Database = typeof db;
