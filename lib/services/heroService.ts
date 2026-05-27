/**
 * 🎯 HERO CONTENT SERVICE
 * Business logic for hero content management
 */

import * as repo from "@/lib/repositories/heroRepository";

export type HeroContent = repo.HeroContent;
export type NewHeroContent = repo.NewHeroContent;

/**
 * Get active hero content for display
 * Returns the highest priority active hero content record
 */
export async function getActiveHeroContent(): Promise<HeroContent | null> {
  return await repo.getActiveHeroContent();
}

/**
 * Get all hero content for admin management
 */
export async function getAllHeroContent(): Promise<HeroContent[]> {
  return await repo.getAllHeroContent();
}

/**
 * Get hero content by ID for editing
 */
export async function getHeroContentById(id: number): Promise<HeroContent | null> {
  return await repo.getHeroContentById(id);
}

/**
 * Create new hero content with validation
 */
export async function createHeroContent(
  data: NewHeroContent,
  userId?: string
): Promise<{ success: boolean; data?: HeroContent; error?: string }> {
  try {
    // Validate required fields
    if (!data.headline || data.headline.trim() === "") {
      return { success: false, error: "Headline is required" };
    }

    // Validate CTA links
    if (data.primaryCtaLink && !isValidUrl(data.primaryCtaLink)) {
      return { success: false, error: "Primary CTA link must be a valid URL" };
    }

    if (data.secondaryCtaLink && !isValidUrl(data.secondaryCtaLink)) {
      return { success: false, error: "Secondary CTA link must be a valid URL" };
    }

    // Validate overlay opacity
    if (data.overlayOpacity !== undefined) {
      const opacity = parseFloat(String(data.overlayOpacity));
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        return { success: false, error: "Overlay opacity must be between 0 and 1" };
      }
    }

    // Validate featured products JSON
    if (data.featuredProducts) {
      try {
        JSON.parse(JSON.stringify(data.featuredProducts));
      } catch {
        return { success: false, error: "Featured products must be valid JSON" };
      }
    }

    const result = await repo.createHeroContent(data);

    if (!result) {
      return { success: false, error: "Failed to create hero content" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Service error creating hero content:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update hero content with validation
 */
export async function updateHeroContent(
  id: number,
  data: Partial<NewHeroContent>,
  userId?: string
): Promise<{ success: boolean; data?: HeroContent; error?: string }> {
  try {
    // Check if hero content exists
    const existing = await repo.getHeroContentById(id);
    if (!existing) {
      return { success: false, error: "Hero content not found" };
    }

    // Validate CTA links if provided
    if (data.primaryCtaLink && !isValidUrl(data.primaryCtaLink)) {
      return { success: false, error: "Primary CTA link must be a valid URL" };
    }

    if (data.secondaryCtaLink && !isValidUrl(data.secondaryCtaLink)) {
      return { success: false, error: "Secondary CTA link must be a valid URL" };
    }

    // Validate overlay opacity if provided
    if (data.overlayOpacity !== undefined) {
      const opacity = parseFloat(String(data.overlayOpacity));
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        return { success: false, error: "Overlay opacity must be between 0 and 1" };
      }
    }

    // Validate featured products JSON if provided
    if (data.featuredProducts) {
      try {
        JSON.parse(JSON.stringify(data.featuredProducts));
      } catch {
        return { success: false, error: "Featured products must be valid JSON" };
      }
    }

    const result = await repo.updateHeroContent(id, data);

    if (!result) {
      return { success: false, error: "Failed to update hero content" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Service error updating hero content:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete hero content
 */
export async function deleteHeroContent(
  id: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await repo.deleteHeroContent(id);

    if (!success) {
      return { success: false, error: "Failed to delete hero content" };
    }

    return { success: true };
  } catch (error) {
    console.error("Service error deleting hero content:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle hero content active status
 */
export async function toggleHeroContentActive(
  id: number,
  userId?: string
): Promise<{ success: boolean; data?: HeroContent; error?: string }> {
  try {
    const result = await repo.toggleHeroContentActive(id);

    if (!result) {
      return { success: false, error: "Failed to toggle hero content status" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Service error toggling hero content active:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Set hero content as the only active one
 */
export async function setActiveHeroContent(
  id: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await repo.setActiveHeroContent(id);

    if (!success) {
      return { success: false, error: "Failed to set active hero content" };
    }

    return { success: true };
  } catch (error) {
    console.error("Service error setting active hero content:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Helper function to validate URLs
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith("/") ? `https://example.com${url}` : url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format hero content for API response
 */
export function formatHeroContentForResponse(content: HeroContent) {
  return {
    id: content.id,
    headline: content.headline,
    subheadline: content.subheadline,
    description: content.description,
    primaryCtaText: content.primaryCtaText,
    primaryCtaLink: content.primaryCtaLink,
    secondaryCtaText: content.secondaryCtaText,
    secondaryCtaLink: content.secondaryCtaLink,
    videoCloudinaryId: content.videoCloudinaryId,
    videoPosterImageId: content.videoPosterImageId,
    enableVideoBackground: content.enableVideoBackground,
    gradientFrom: content.gradientFrom,
    gradientTo: content.gradientTo,
    overlayOpacity: content.overlayOpacity,
    showTrustIndicators: content.showTrustIndicators,
    clientCount: content.clientCount,
    yearsInBusiness: content.yearsInBusiness,
    featuredProducts: content.featuredProducts,
    isActive: content.isActive,
    displayOrder: content.displayOrder,
    updatedAt: content.updatedAt,
    createdAt: content.createdAt,
  };
}