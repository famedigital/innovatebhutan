import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { sql } from "drizzle-orm";

// GET /api/profiles - List profiles (optional role filter)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    const roles = roleFilter ? roleFilter.split(",") : null;
    let allProfiles: Array<{
      id: number;
      userId: string;
      fullName?: string | null;
      role: string;
    }> = [];

    try {
      let query = db
        .select({
          id: profiles.id,
          userId: profiles.userId,
          fullName: profiles.fullName,
          role: profiles.role,
        })
        .from(profiles);

      if (roles) {
        query = query.where(sql`${profiles.role} = ANY(${roles})`);
      }

      allProfiles = await query.orderBy(profiles.fullName);
    } catch (queryError) {
      // Backward compatibility for older schemas missing full_name.
      const message = queryError instanceof Error ? queryError.message : "";
      if (!message.includes('column "full_name" does not exist')) {
        throw queryError;
      }

      let fallbackQuery = db
        .select({
          id: profiles.id,
          userId: profiles.userId,
          role: profiles.role,
        })
        .from(profiles);

      if (roles) {
        fallbackQuery = fallbackQuery.where(sql`${profiles.role} = ANY(${roles})`);
      }

      allProfiles = await fallbackQuery.orderBy(profiles.userId);
    }

    return NextResponse.json({
      success: true,
      data: allProfiles,
    });
  } catch (error) {
    console.error("Profiles fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
