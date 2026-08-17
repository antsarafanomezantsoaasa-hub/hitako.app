import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitFreeRegistrationSchema = z.object({
  full_name: z.string().trim().min(2, "Veuillez indiquer votre nom complet.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  phone: z.string().trim().min(6, "Veuillez indiquer un numéro de téléphone valide.").max(40),
  password: z.string().min(6, "Mot de passe : 6 caractères minimum.").max(128),
  // Which HiT START track the visitor picked in the new "Formule" step of
  // the wizard — drives which page they land on after sign-up (see
  // src/lib/free-tier.ts) and which payment amount HiTako staff should
  // expect on the admin panel. Defaults to "daily" for any caller that
  // doesn't send it (defense in depth — the client always sends it).
  preferred_format: z.enum(["daily", "coach"]).default("daily"),
});

export type SubmitFreeRegistrationResult =
  { ok: true } | { ok: false; reason: "duplicate" | "closed" | "error"; message: string };

const DUPLICATE_ACCOUNT_MESSAGE =
  "Un compte existe déjà avec cette adresse e-mail. Utilisez « Se connecter » pour accéder à votre espace, ou contactez-nous si vous avez oublié votre mot de passe.";

const GENERIC_ERROR_MESSAGE =
  "Impossible d'enregistrer votre inscription pour le moment. Veuillez réessayer.";

// Kept in sync in spirit with the closed-state message on the
// /free-registration page itself (see free-registration.tsx) — this one only
// surfaces if a request reaches the server despite that page saying
// registrations are closed (a stale tab, a direct API call, etc.).
const REGISTRATION_CLOSED_MESSAGE =
  "Les inscriptions gratuites sont temporairement fermées le temps de cette phase de démarrage. Revenez bientôt !";

// Public form endpoint — intentionally has no requireSupabaseAuth middleware,
// since visitors submitting /free-registration are not signed in yet.
//
// The account is now created immediately (service role), using the password
// the visitor chose in the form, with the "free" tier role — no more manual
// admin approval + "here is your entry code" e-mail in between. The visitor
// is signed in client-side right after this call succeeds (see
// free-registration.tsx) and lands straight on /zero (Daily track) or
// /bienvenue-coach (Coach track), depending on preferred_format. HiTako
// Academy staff still promote the account from "free" to "member" (via the
// admin panel) once payment is confirmed.
export const submitFreeRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitFreeRegistrationSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitFreeRegistrationResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    // Defense in depth: the /free-registration page already hides the form
    // and shows a "closed" message when this flag is off, but a request can
    // still reach here from a stale tab or a direct call — don't let it
    // create an account just because the client-side check was bypassed.
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("site_settings")
      .select("free_registration_open")
      .eq("id", 1)
      .maybeSingle();
    if (settingsError) {
      console.error("[submitFreeRegistration] site_settings lookup failed:", settingsError);
    } else if (settings?.free_registration_open === false) {
      return { ok: false, reason: "closed", message: REGISTRATION_CLOSED_MESSAGE };
    }

    // Blocked: this e-mail already belongs to an existing account (created
    // via the admin panel, or from a previous free registration).
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (profileError) {
      return { ok: false, reason: "error", message: GENERIC_ERROR_MESSAGE };
    }
    if (existingProfile) {
      return { ok: false, reason: "duplicate", message: DUPLICATE_ACCOUNT_MESSAGE };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name.trim(), level: "HiT START" },
    });
    if (createError || !created?.user) {
      // Safety net for a race between two simultaneous submissions of the
      // same e-mail — Supabase Auth is the last word on uniqueness.
      if (createError?.message?.toLowerCase().includes("already registered")) {
        return { ok: false, reason: "duplicate", message: DUPLICATE_ACCOUNT_MESSAGE };
      }
      console.error("[submitFreeRegistration] createUser failed:", createError);
      return { ok: false, reason: "error", message: GENERIC_ERROR_MESSAGE };
    }

    // handle_new_user already created the profile row (full_name/level/email
    // from the metadata above) and granted the default "member" role. Fill
    // in phone and downgrade the role to "free" until payment is confirmed
    // and an admin promotes the account back to "member". Birthdate is no
    // longer collected on the free-registration form, so it's left unset
    // here (profiles.birthdate is nullable) — it can still be filled in
    // later from the admin panel if needed.
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ phone: data.phone.trim(), preferred_format: data.preferred_format })
      .eq("id", created.user.id);
    if (updateError) {
      console.error("[submitFreeRegistration] profile update failed:", updateError);
    }

    const { error: roleDeleteError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", created.user.id)
      .in("role", ["member", "free"]);
    if (roleDeleteError) {
      console.error("[submitFreeRegistration] role reset failed:", roleDeleteError);
      return { ok: false, reason: "error", message: GENERIC_ERROR_MESSAGE };
    }
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "free" });
    if (roleInsertError) {
      console.error("[submitFreeRegistration] role assignment failed:", roleInsertError);
      return { ok: false, reason: "error", message: GENERIC_ERROR_MESSAGE };
    }

    return { ok: true };
  });
