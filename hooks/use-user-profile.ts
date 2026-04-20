"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "ADMIN" | "STAFF" | "CLIENT";

interface UserProfile {
  id: number;
  userId: string;
  fullName: string | null;
  role: UserRole;
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Fetch profile with role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          userId: profileData.user_id,
          fullName: profileData.full_name,
          role: profileData.role as UserRole,
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { user, profile, loading, isAdmin: profile?.role === "ADMIN" };
}
