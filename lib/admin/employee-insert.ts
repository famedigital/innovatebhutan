import { db } from "@/db";
import { sql } from "drizzle-orm";

type SqlRow = Record<string, unknown>;

async function rawQuery<T extends SqlRow>(query: ReturnType<typeof sql>) {
  const result = await db.execute(query);
  if (Array.isArray(result)) return result as unknown as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: T[] }).rows;
  }
  return [] as T[];
}

export type MinimalEmployeeInsert = {
  profileId: number;
  designation: string;
  status?: string;
  email?: string | null;
  department?: string | null;
  phone?: string | null;
};

/**
 * Insert an employee using only columns that exist on older prod schemas.
 * Drizzle `insert(employees)` emits every schema column (skills, auth_id, …)
 * and fails when those migrations were never applied.
 */
export async function insertEmployeeMinimal(
  input: MinimalEmployeeInsert
): Promise<number> {
  const designation = input.designation || "Staff";
  const status = input.status || "active";

  // Richer insert when payroll columns exist
  if (input.email || input.department || input.phone) {
    try {
      const rows = await rawQuery<{ id: number }>(sql`
        INSERT INTO employees (profile_id, designation, status, email, department, phone)
        VALUES (
          ${input.profileId},
          ${designation},
          ${status},
          ${input.email ?? null},
          ${input.department ?? null},
          ${input.phone ?? null}
        )
        RETURNING id
      `);
      const id = Number(rows[0]?.id);
      if (Number.isFinite(id) && id > 0) return id;
    } catch {
      // fall through
    }
  }

  try {
    const rows = await rawQuery<{ id: number }>(sql`
      INSERT INTO employees (profile_id, designation, status)
      VALUES (${input.profileId}, ${designation}, ${status})
      RETURNING id
    `);
    const id = Number(rows[0]?.id);
    if (Number.isFinite(id) && id > 0) return id;
  } catch {
    // Original table: id, profile_id, designation, base_salary, join_date
  }

  const rows = await rawQuery<{ id: number }>(sql`
    INSERT INTO employees (profile_id, designation)
    VALUES (${input.profileId}, ${designation})
    RETURNING id
  `);
  const id = Number(rows[0]?.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Employee insert returned no id");
  }
  return id;
}
