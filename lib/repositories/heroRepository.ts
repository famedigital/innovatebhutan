/**
 * 🎯 HERO CONTENT REPOSITORY
 * Database operations for hero content management
 */

import { db } from "@/db";
import { heroContent } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type HeroContent = typeof heroContent.$inferSelect;
export type NewHeroContent = typeof heroContent.$inferInsert;

/**
 * Get active hero content (highest priority active record)
 */
export async function getActiveHeroContent(): Promise<HeroContent | null> {
  try {
    const result = await db
      .select()
      .from(heroContent)
      .where(eq(heroContent.isActive, true))
      .orderBy(desc(heroContent.displayOrder))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching active hero content:", error);
    return null;
  }
}

/**
 * Get all hero content records (including inactive)
 */
export async function getAllHeroContent(): Promise<HeroContent[]> {
  try {
    return await db
      .select()
      .from(heroContent)
      .orderBy(desc(heroContent.displayOrder));
  } catch (error) {
    console.error("Error fetching all hero content:", error);
    return [];
  }
}

/**
 * Get hero content by ID
 */
export async function getHeroContentById(id: number): Promise<HeroContent | null> {
  try {
    const result = await db
      .select()
      .from(heroContent)
      .where(eq(heroContent.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching hero content by ID:", error);
    return null;
  }
}

/**
 * Create new hero content
 */
export async function createHeroContent(data: NewHeroContent): Promise<HeroContent | null> {
  try {
    const result = await db.insert(heroContent).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error creating hero content:", error);
    return null;
  }
}

/**
 * Update hero content
 */
export async function updateHeroContent(
  id: number,
  data: Partial<NewHeroContent>
): Promise<HeroContent | null> {
  try {
    const result = await db
      .update(heroContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(heroContent.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating hero content:", error);
    return null;
  }
}

/**
 * Delete hero content
 */
export async function deleteHeroContent(id: number): Promise<boolean> {
  try {
    await db.delete(heroContent).where(eq(heroContent.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting hero content:", error);
    return false;
  }
}

/**
 * Toggle active status
 */
export async function toggleHeroContentActive(id: number): Promise<HeroContent | null> {
  try {
    const current = await getHeroContentById(id);
    if (!current) return null;

    return await updateHeroContent(id, { isActive: !current.isActive });
  } catch (error) {
    console.error("Error toggling hero content active status:", error);
    return null;
  }
}

/**
 * Set hero content as the only active one (deactivate others)
 */
export async function setActiveHeroContent(id: number): Promise<boolean> {
  try {
    // Deactivate all hero content first
    await db.update(heroContent).set({ isActive: false });

    // Activate the specified one
    await db
      .update(heroContent)
      .set({ isActive: true })
      .where(eq(heroContent.id, id));

    return true;
  } catch (error) {
    console.error("Error setting active hero content:", error);
    return false;
  }
}