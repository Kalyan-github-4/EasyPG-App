/**
 * run-migration.ts
 * Usage: tsx scripts/run-migration.ts migrations/0005_add_performance_indexes.sql
 *
 * Reads a SQL file, strips comments, and executes each statement individually
 * inside a transaction via the Neon serverless driver.
 */
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

dotenv.config();

async function main() {
  const [, , filePath] = process.argv;

  if (!filePath) {
    console.error("Usage: tsx scripts/run-migration.ts <path-to-sql-file>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const absolutePath = resolve(filePath);
  let rawSql: string;

  try {
    rawSql = readFileSync(absolutePath, "utf-8");
  } catch {
    console.error(`Could not read file: ${absolutePath}`);
    process.exit(1);
  }

  // Split on semicolons, strip blank lines and pure-comment lines,
  // and skip BEGIN / COMMIT (we handle the transaction ourselves)
  const statements = rawSql
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--") && line.trim() !== "")
        .join("\n")
        .trim()
    )
    .filter(
      (s) =>
        s.length > 0 &&
        s.toUpperCase() !== "BEGIN" &&
        s.toUpperCase() !== "COMMIT"
    );

  const db = neon(process.env.DATABASE_URL!);

  console.log(`\n🚀 Running migration: ${filePath}`);
  console.log(`   ${statements.length} statements to execute\n`);

  try {
    // Wrap all statements in an explicit transaction
    await db.query("BEGIN");
    for (const stmt of statements) {
      const preview = stmt.split("\n")[0].substring(0, 72);
      process.stdout.write(`  ↳ ${preview}… `);
      await db.query(stmt);
      process.stdout.write("✓\n");
    }
    await db.query("COMMIT");
    console.log("\n✅ Migration applied successfully.\n");
  } catch (err: any) {
    await db.query("ROLLBACK").catch(() => {});
    console.error("\n❌ Migration failed — rolled back.\n", err?.message ?? err);
    process.exit(1);
  }
}

main();
