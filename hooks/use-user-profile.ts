"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "ADMIN" | "STAFF" | "CLIENT";

interface UserProfile {
  id: number;
  userId: string;
  fullName: string | null;
  role: UserRole;
  capabilities?: string[];
}

interface UseUserProfileResult {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  canSeeMoney: boolean;
  error: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Custom hook to fetch and manage user profile data with retry logic.
 *
 * Features:
 * - Retry logic for failed profile fetches (up to 3 attempts)
 * - Comprehensive error handling and logging
 * - Role normalization (handles case/whitespace issues)
 * - Development mode fallback for testing
 * - Prevents premature "CLIENT" role defaults
 *
 * @returns UseUserProfileResult - User data, profile, loading state, and role flags
 */
export function useUserProfile(): UseUserProfileResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const normalizeRole = (rawRole: string | null | undefined): UserRole => {
    if (!rawRole) return "CLIENT";
    const normalized = rawRole.toString().toUpperCase().trim();
    if (normalized === "ADMIN" || normalized === "STAFF" || normalized === "CLIENT") {
      return normalized as UserRole;
    }
    return "CLIENT";
  };

  const fetchProfileWithRetry = useCallback(async (userId: string, attempt: number = 1): Promise<UserProfile | null> => {
    const supabase = createClient();
    const isDev = process.env.NODE_ENV === "development";

    console.log(`[useUserProfile] Fetching profile for user ${userId} (attempt ${attempt}/${MAX_RETRIES})`);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle() to handle "no rows returned" gracefully

      if (profileError) {
        const errorInfo = {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
        };

        // Check if error is empty (common with RLS/permission issues)
        const isEmptyError = Object.keys(profileError).length === 0 ||
          (!profileError.code && !profileError.message);

        if (isEmptyError) {
          console.warn(`[useUserProfile] Permission denied or no profile found (attempt ${attempt})`);
        } else {
          console.error(`[useUserProfile] Profile fetch error (attempt ${attempt}):`, errorInfo);
        }

        // Retry on network or transient errors (but not permission errors)
        if (attempt < MAX_RETRIES && !isEmptyError && (
          profileError.code === "PGRST116" || // Schema error (might be temporary)
          profileError.code === "503" || // Service unavailable
          profileError.code === "08001" || // Connection error
          profileError.message?.includes("timeout") ||
          profileError.message?.includes("network")
        )) {
          console.log(`[useUserProfile] Retrying in ${RETRY_DELAY_MS}ms...`);
          await sleep(RETRY_DELAY_MS);
          return fetchProfileWithRetry(userId, attempt + 1);
        }

        // For permission/no-profile errors, try dev fallback or return null
        if (isEmptyError || profileError.code === "PGRST116") {
          if (isDev) {
            console.warn(`[useUserProfile] DEV MODE: Using admin fallback due to missing profile`);
            return {
              id: 0,
              userId: userId,
              fullName: "Dev Admin User",
              role: "ADMIN",
            };
          }
          return null;
        }

        throw profileError;
      }

      if (!profileData) {
        console.warn(`[useUserProfile] No profile found for user ${userId}, attempting to create one...`);

        // Try to auto-create profile
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            full_name: null, // Will be updated by user
            role: "CLIENT", // Default role
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.error(`[useUserProfile] Failed to create profile:`, insertError);

          // Development mode fallback: create a mock admin profile for testing
          if (isDev) {
            console.warn(`[useUserProfile] DEV MODE: Using admin fallback for testing`);
            return {
              id: 0,
              userId: userId,
              fullName: "Dev Admin User",
              role: "ADMIN",
            };
          }

          return null;
        }

        if (newProfile) {
          console.log(`[useUserProfile] Auto-created profile for user ${userId}`);
          return {
            id: newProfile.id,
            userId: newProfile.user_id,
            fullName: newProfile.full_name,
            role: normalizeRole(newProfile.role),
          };
        }

        // Development mode fallback: create a mock admin profile for testing
        if (isDev) {
          console.warn(`[useUserProfile] DEV MODE: Using admin fallback for testing`);
          return {
            id: 0,
            userId: userId,
            fullName: "Dev Admin User",
            role: "ADMIN",
          };
        }

        return null;
      }

      const normalizedProfile: UserProfile = {
        id: profileData.id,
        userId: profileData.user_id,
        fullName: profileData.full_name,
        role: normalizeRole(profileData.role),
        capabilities: Array.isArray(profileData.capabilities)
          ? profileData.capabilities
          : [],
      };

      console.log(`[useUserProfile] Profile loaded successfully:`, {
        userId: normalizedProfile.userId,
        role: normalizedProfile.role,
        fullName: normalizedProfile.fullName,
      });

      return normalizedProfile;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[useUserProfile] Fatal error fetching profile (attempt ${attempt}):`, err);
      setError(errorMessage);

      // Final attempt failed in dev mode - provide fallback
      if (attempt === MAX_RETRIES && isDev) {
        console.warn(`[useUserProfile] DEV MODE: All retries failed, using admin fallback`);
        return {
          id: 0,
          userId: userId,
          fullName: "Dev Admin User",
          role: "ADMIN",
        };
      }

      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const supabase = createClient();
      const isDev = process.env.NODE_ENV === "development";

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!mounted) return;

        if (authError) {
          console.error("[useUserProfile] Auth error:", authError);
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (!user) {
          console.log("[useUserProfile] No authenticated user found");

          // Development mode: provide mock user for testing
          if (isDev) {
            console.warn("[useUserProfile] DEV MODE: Using mock user for testing");
            setUser({
              id: "dev-mock-user-id",
              email: "dev@example.com",
              aud: "authenticated",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User);
            setProfile({
              id: 0,
              userId: "dev-mock-user-id",
              fullName: "Dev Admin User",
              role: "ADMIN",
            });
            setLoading(false);
            return;
          }

          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log("[useUserProfile] Authenticated user found:", {
          id: user.id,
          email: user.email,
        });

        setUser(user);
        const profileData = await fetchProfileWithRetry(user.id);

        if (mounted) {
          setProfile(profileData);
          setLoading(false);
        }

      } catch (err) {
        if (mounted) {
          console.error("[useUserProfile] Unexpected error:", err);
          setError(err instanceof Error ? err.message : "Unexpected error");
          setLoading(false);

          // Dev fallback on unexpected error
          if (isDev) {
            setProfile({
              id: 0,
              userId: "dev-fallback-id",
              fullName: "Dev Admin User",
              role: "ADMIN",
            });
          }
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [fetchProfileWithRetry]);

  const canSeeMoney =
    profile?.role === "ADMIN" ||
    (Array.isArray(profile?.capabilities) &&
      profile!.capabilities!.includes("see_money"));

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "ADMIN",
    isStaff: profile?.role === "STAFF",
    isClient: profile?.role === "CLIENT",
    canSeeMoney,
    error,
  };
}
