import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { usePresenceHeartbeat } from "./use-presence-heartbeat";

export type MemberLevel = "HiT START" | "HiT FLOW" | "HiT PRO";
export type AppRole = "admin" | "member" | "free";
export type PreferredFormat = "daily" | "coach";

export type MemberProfile = {
  id: string;
  full_name: string;
  email: string | null;
  level: MemberLevel;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  birthdate: string | null;
  bio: string | null;
  streak_days: number;
  lessons_completed: number;
  study_minutes: number;
  progress_percent: number;
  status: string;
  created_at: string;
  // Which "free" tier track this account picked on /free-registration —
  // 'coach' (live coaching) or 'daily' (self-paced app). Only meaningful
  // while role === "free"; see src/lib/free-tier.ts for how it's used to
  // route between /zero and /bienvenue-coach.
  preferred_format: PreferredFormat;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: MemberProfile | null;
  role: AppRole;
  isAdmin: boolean;
  isFree: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(userId: string, fallbackEmail: string | null): Promise<MemberProfile> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return {
    id: userId,
    full_name: data?.full_name ?? "",
    email: data?.email ?? fallbackEmail,
    level: (data?.level as MemberLevel) ?? "HiT START",
    avatar_url: data?.avatar_url ?? null,
    phone: data?.phone ?? null,
    city: data?.city ?? null,
    country: data?.country ?? null,
    birthdate: data?.birthdate ?? null,
    bio: data?.bio ?? null,
    streak_days: data?.streak_days ?? 0,
    lessons_completed: data?.lessons_completed ?? 0,
    study_minutes: data?.study_minutes ?? 0,
    progress_percent: data?.progress_percent ?? 0,
    status: data?.status ?? "active",
    created_at: data?.created_at ?? new Date().toISOString(),
    preferred_format: (data?.preferred_format as PreferredFormat) ?? "daily",
  };
}

async function loadRole(userId: string): Promise<AppRole> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as AppRole);
  // A user can only meaningfully have one "tier" — admin outranks free, which
  // outranks the member default assigned by the handle_new_user trigger.
  if (roles.includes("admin")) return "admin";
  if (roles.includes("free")) return "free";
  return "member";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [role, setRole] = useState<AppRole>("member");

  async function hydrate(nextSession: Session | null) {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    if (!nextSession?.user) {
      setProfile(null);
      setRole("member");
      setLoading(false);
      return;
    }
    const [p, r] = await Promise.all([
      loadProfile(nextSession.user.id, nextSession.user.email ?? null),
      loadRole(nextSession.user.id),
    ]);
    setProfile(p);
    setRole(r);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      void hydrate(s);
    });
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await hydrate(data.session);
    })();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Mounted once for the whole app (AuthProvider wraps every route — see
  // SiteLayout) so a member's presence stays fresh no matter which page
  // they're actually on, not just /mon-espace or /admin.
  usePresenceHeartbeat(user?.id ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      session,
      profile,
      role,
      isAdmin: role === "admin",
      isFree: role === "free",
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refresh: async () => {
        const { data } = await supabase.auth.getSession();
        await hydrate(data.session);
      },
    }),
    [loading, user, session, profile, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
