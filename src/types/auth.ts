/**
 * Centralized auth-related types
 * Replaces scattered `any` types in member-space components
 */

import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: string | null;
  created_at: string;
  updated_at: string;
  preferred_format: "daily" | "coach" | null;
}

export interface MemberSpaceUser extends User {
  // Extends the Supabase User type with any custom fields
  // Currently just the base Supabase User type
}

export type AuthUser = User | null;
export type AuthProfile = UserProfile | null;
