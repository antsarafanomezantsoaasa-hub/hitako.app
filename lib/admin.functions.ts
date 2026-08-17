import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "x7m9.admin@hitako.academy";
const ADMIN_PASSWORD = "hitako123";

const memberLevels = ["HiT START", "HiT FLOW", "HiT PRO"] as const;
// "admin" is granted separately (bootstrapAdmin) and is never assignable from this form.
const memberRoles = ["member", "free"] as const;

// Fields an admin can actually set by hand: identity, contact info, tier
// and account status. Progress stats (streak_days, lessons_completed,
// study_minutes, progress_percent) are intentionally NOT here — they're
// tracked automatically per-lesson by completeLesson (see
// lessons.functions.ts + the lesson_progress table) whenever a member
// actually completes a lesson, so a manual override here would only ever
// let the admin panel drift out of sync with what a student really did.
// See listStudentProgress below for the read-only, real view of that data.
const profileFields = {
  full_name: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  level: z.enum(memberLevels),
  phone: z.string().trim().max(40).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  birthdate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  bio: z.string().trim().max(1000).optional().nullable(),
  status: z.string().trim().max(40).optional(),
  avatar_url: z.string().trim().max(500).optional().nullable(),
};

const createMemberSchema = z.object({
  ...profileFields,
  role: z.enum(memberRoles).default("member"),
  password: z.string().min(6, "Mot de passe : 6 caractères minimum").max(128),
});

const updateMemberSchema = z.object({
  id: z.string().uuid(),
  ...profileFields,
  role: z.enum(memberRoles).default("member"),
});

export async function requireAdmin(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Vérification du rôle impossible.");
  if (!data) throw new Error("Accès refusé : administrateur uniquement.");
}

async function setMemberTierRole(
  supabaseAdmin: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  role: (typeof memberRoles)[number],
) {
  // Only ever replaces "member"/"free" rows for this user — "admin" is untouched.
  const { error: deleteError } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .in("role", memberRoles);
  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role });
  if (insertError) throw new Error(insertError.message);
}

function sanitizeProfilePayload<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === "" || v === undefined) continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { count, error: countError } = await supabaseAdmin
    .from("user_roles")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "admin");
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return { created: false as const };

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Administrateur HiTako", level: "HiT PRO" },
  });
  if (createError || !created?.user) {
    throw new Error(createError?.message ?? "Impossible de créer l'administrateur.");
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: created.user.id, role: "admin" });
  if (roleError) throw new Error(roleError.message);

  return { created: true as const };
});

export const createMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { password, role, ...profile } = data;
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: profile.full_name, level: profile.level },
    });
    if (error || !created?.user) {
      throw new Error(error?.message ?? "Impossible de créer le membre.");
    }

    const payload = sanitizeProfilePayload({ ...profile, email: profile.email });
    await supabaseAdmin.from("profiles").update(payload).eq("id", created.user.id);
    // handle_new_user already inserted a "member" role — swap it for "free" if requested.
    await setMemberTierRole(supabaseAdmin, created.user.id, role);

    return {
      id: created.user.id,
      email: profile.email,
      full_name: profile.full_name,
      level: profile.level,
    };
  });

export const updateMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateMemberSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, role, ...profile } = data;
    const payload = sanitizeProfilePayload(profile);
    if (profile.email) {
      await supabaseAdmin.auth.admin.updateUserById(id, { email: profile.email });
    }
    const { error } = await supabaseAdmin.from("profiles").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await setMemberTierRole(supabaseAdmin, id, role);
    return { id };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, full_name, email, level, avatar_url, phone, city, country, birthdate, bio, streak_days, lessons_completed, study_minutes, progress_percent, status, created_at, last_seen_at, preferred_format",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: freeRows, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "free");
    if (rolesError) throw new Error(rolesError.message);
    const freeIds = new Set((freeRows ?? []).map((r) => r.user_id));

    return (data ?? []).map((m) => ({
      ...m,
      role: freeIds.has(m.id) ? ("free" as const) : ("member" as const),
    }));
  });

const registrationStatuses = ["pending", "approved", "rejected"] as const;

export const listRegistrationRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    // Approved requests already show up as members below — once approved,
    // a request drops out of this inbox.
    const { data, error } = await context.supabase
      .from("registration_requests")
      .select("id, full_name, email, phone, birthdate, status, notes, created_user_id, created_at")
      .neq("status", "approved")
      .order("created_at", { ascending: false });
    if (!error) return data ?? [];

    // Fallback for a database that hasn't picked up the created_user_id
    // migration yet — don't let the whole inbox disappear over one column.
    if (error.message.includes("created_user_id")) {
      const { data: legacyData, error: legacyError } = await context.supabase
        .from("registration_requests")
        .select("id, full_name, email, phone, birthdate, status, notes, created_at")
        .neq("status", "approved")
        .order("created_at", { ascending: false });
      if (legacyError) throw new Error(legacyError.message);
      return (legacyData ?? []).map((r) => ({ ...r, created_user_id: null as string | null }));
    }

    throw new Error(error.message);
  });

const updateRegistrationRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(registrationStatuses),
});

// Only used to reject a request, or to move it back to "pending". Approving
// now goes through approveRegistrationRequest below, since that path also
// creates the account — keeping this one from ever setting "approved"
// avoids ending up with an "approved" request that has no account behind it.
export const updateRegistrationRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    updateRegistrationRequestSchema.extend({ status: z.enum(["pending", "rejected"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("registration_requests")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id, status: data.status };
  });

const approveRegistrationRequestSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(6, "Mot de passe : 6 caractères minimum").max(128),
});

// Approves a free-registration request AND creates the member account for it
// in one step — the admin only ever has to supply the password.
export const approveRegistrationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => approveRegistrationRequestSchema.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let request: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      birthdate: string;
      status: string;
      created_user_id: string | null;
    } | null = null;
    let hasCreatedUserIdColumn = true;

    const { data: fetched, error: fetchError } = await supabaseAdmin
      .from("registration_requests")
      .select("id, full_name, email, phone, birthdate, status, created_user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchError && fetchError.message.includes("created_user_id")) {
      hasCreatedUserIdColumn = false;
      const { data: legacyFetched, error: legacyFetchError } = await supabaseAdmin
        .from("registration_requests")
        .select("id, full_name, email, phone, birthdate, status")
        .eq("id", data.id)
        .maybeSingle();
      if (legacyFetchError) throw new Error(legacyFetchError.message);
      request = legacyFetched ? { ...legacyFetched, created_user_id: null } : null;
    } else if (fetchError) {
      throw new Error(fetchError.message);
    } else {
      request = fetched;
    }
    if (!request) throw new Error("Demande introuvable.");

    // Already approved with an account behind it — nothing left to create.
    if (request.created_user_id) {
      return {
        id: request.id,
        status: "approved" as const,
        userId: request.created_user_id,
        created: false,
      };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: request.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: request.full_name, level: "HiT START" },
    });
    if (createError || !created?.user) {
      throw new Error(
        createError?.message ?? "Impossible de créer le compte pour cette demande d'inscription.",
      );
    }

    // handle_new_user already created the profile row + a "member" role;
    // fill in the request's details and downgrade the role to "free".
    await supabaseAdmin
      .from("profiles")
      .update({ phone: request.phone, birthdate: request.birthdate, email: request.email })
      .eq("id", created.user.id);
    await setMemberTierRole(supabaseAdmin, created.user.id, "free");

    const { error: updateError } = await supabaseAdmin
      .from("registration_requests")
      .update(
        hasCreatedUserIdColumn
          ? { status: "approved", created_user_id: created.user.id }
          : { status: "approved" },
      )
      .eq("id", request.id);
    if (updateError) throw new Error(updateError.message);

    return { id: request.id, status: "approved" as const, userId: created.user.id, created: true };
  });

/* ---------- Student progress tracking (read-only) ---------- */

// Powers the admin "Progression" dashboard: every real, per-lesson
// completion event, for every student, in one call. This is the actual
// ground truth (written by completeLesson in lessons.functions.ts) — unlike
// the old admin-editable profile counters, nobody can type a fake number in
// here. RLS already lets an admin read every row (see
// lesson_progress_select_own_or_admin in the lesson_progress migration), so
// this reads through the caller's own session — no service role needed.
export const listAllLessonProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("lesson_progress")
      .select(
        "id, user_id, lesson_slug, lesson_number, xp_earned, best_score, attempts, completed_at",
      )
      .order("completed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
