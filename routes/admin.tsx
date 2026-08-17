import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  ImagePlus,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Quote,
  Search,
  Star,
  TrendingUp,
  Unlock,
  UserPlus,
  Users,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHero } from "@/components/site/shared";
import { MemberAvatar } from "@/components/MemberAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  approveRegistrationRequest,
  bootstrapAdmin,
  createMember,
  listAllLessonProgress,
  listMembers,
  listRegistrationRequests,
  updateMember,
  updateRegistrationRequestStatus,
} from "@/lib/admin.functions";
import { getSiteSettings, setDailyPhrase, setFreeRegistrationOpen } from "@/lib/settings.functions";
import { listAllLessonRatings, type LessonRatingRow } from "@/lib/lesson-ratings.functions";
import { ONLINE_THRESHOLD_MINUTES, isWithinOnlineWindow } from "@/lib/presence.functions";
import { getFreeHomeHref, type PreferredFormat } from "@/lib/free-tier";

export const Route = createFileRoute("/admin")({
  // Login-gated and already noindex/nofollow — no SEO or social-preview
  // reason to server-render it. Turning SSR off means the initial HTML is
  // just the shared app shell; the admin UI only exists once the client JS
  // mounts it, so "view source" no longer shows any of this page's markup
  // or data. See src/routes/mon-espace.tsx for the same treatment.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administration | HiTako Academy" },
      {
        name: "description",
        content: "Espace d'administration HiTako Academy — gestion des membres.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const LEVELS = ["HiT START", "HiT FLOW", "HiT PRO"] as const;
type Level = (typeof LEVELS)[number];

const MEMBER_ROLES = ["member", "free"] as const;
type MemberRole = (typeof MEMBER_ROLES)[number];

// 80 lessons total in the HiT START → HiT FLOW → HiT PRO curriculum (kept in
// sync with the same constant on /mon-espace).
const TOTAL_CURRICULUM_LESSONS = 80;

// A confirmed member with no completed lesson in this many days shows up as
// "inactive" on the progress dashboard, so the team can reach out.
const INACTIVITY_THRESHOLD_DAYS = 14;

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  level: Level;
  role: MemberRole;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  birthdate: string | null;
  bio: string | null;
  // Real, automatically-tracked stats — written by completeLesson whenever a
  // member actually finishes a lesson. Read-only here by design; see the
  // Progression tab for the full per-lesson detail behind these numbers.
  streak_days: number;
  lessons_completed: number;
  study_minutes: number;
  progress_percent: number;
  status: string;
  created_at: string;
  // Written by the member's own browser heartbeat (see
  // src/hooks/use-presence-heartbeat.ts), null until they've ever signed
  // in with the feature live. Never edited by hand — see
  // isWithinOnlineWindow in presence.functions.ts for how this becomes the
  // "online now" stat below.
  last_seen_at: string | null;
  // Which HiT START track a "free"-role member picked at registration —
  // 'coach' (live coaching, 150 000 Ar/2mo) or 'daily' (self-paced app,
  // 49 000 Ar / jusqu'à 6 mois). Only meaningful while role === "free"; lets staff know
  // which payment amount to expect on the admin panel. See src/lib/free-tier.ts.
  preferred_format: PreferredFormat;
};

type RegistrationStatus = "pending" | "approved" | "rejected";

type RegistrationRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  status: RegistrationStatus;
  notes: string | null;
  created_user_id: string | null;
  created_at: string;
};

// One row per completed lesson, per student — the ground truth behind the
// aggregate numbers on `Member`. Comes straight from public.lesson_progress.
type LessonProgressRow = {
  id: string;
  user_id: string;
  lesson_slug: string;
  lesson_number: number;
  xp_earned: number;
  best_score: number;
  attempts: number;
  completed_at: string;
};

type ProfileFormState = {
  full_name: string;
  email: string;
  level: Level;
  role: MemberRole;
  phone: string;
  city: string;
  country: string;
  birthdate: string;
  bio: string;
  status: string;
};

const EMPTY_PROFILE: ProfileFormState = {
  full_name: "",
  email: "",
  level: LEVELS[0],
  role: "member",
  phone: "",
  city: "",
  country: "",
  birthdate: "",
  bio: "",
  status: "active",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  paused: "En pause",
  archived: "Archivé",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  paused: "bg-amber-500/10 text-amber-600",
  archived: "bg-muted text-muted-foreground",
};

// One color per curriculum tier so the Membres table reads at a glance
// instead of every level pill looking identical.
const LEVEL_BADGE_CLASS: Record<Level, string> = {
  "HiT START": "bg-sky-500/10 text-sky-600",
  "HiT FLOW": "bg-amber-500/10 text-amber-600",
  "HiT PRO": "bg-violet-500/10 text-violet-600",
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 500 * 1024;

function validateAvatar(file: File | null): string | null {
  if (!file) return null;
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return "Format non supporté (JPG, JPEG, PNG ou WEBP uniquement).";
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return "L'image dépasse 500 Ko.";
  }
  return null;
}

async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return path;
}

function formatStudyMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "Aucune activité";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return "—";
  }
}

function AdminPage() {
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapAdmin);
  const createMemberFn = useServerFn(createMember);
  const updateMemberFn = useServerFn(updateMember);
  const listMembersFn = useServerFn(listMembers);
  const listRegistrationRequestsFn = useServerFn(listRegistrationRequests);
  const updateRegistrationRequestStatusFn = useServerFn(updateRegistrationRequestStatus);
  const approveRegistrationRequestFn = useServerFn(approveRegistrationRequest);
  const listAllLessonProgressFn = useServerFn(listAllLessonProgress);
  const listAllLessonRatingsFn = useServerFn(listAllLessonRatings);
  const getSiteSettingsFn = useServerFn(getSiteSettings);
  const setFreeRegistrationOpenFn = useServerFn(setFreeRegistrationOpen);
  const setDailyPhraseFn = useServerFn(setDailyPhrase);

  const [checking, setChecking] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [editing, setEditing] = useState<Member | null>(null);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[]>([]);
  const [progressError, setProgressError] = useState<string | null>(null);
  // End-of-lesson 1–5 star feedback (lesson_ratings) — read-only here.
  const [lessonRatings, setLessonRatings] = useState<LessonRatingRow[]>([]);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  // Whether /free-registration currently accepts new sign-ups — a site-wide
  // flag stored in site_settings, not tied to any one member.
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [registrationToggling, setRegistrationToggling] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  // The phrase shown on the /mon-espace member home header — draft state
  // for the input, plus the last-saved value so we know if there are
  // unsaved changes.
  const [dailyPhraseDraft, setDailyPhraseDraft] = useState("");
  const [dailyPhraseSaved, setDailyPhraseSaved] = useState<string | null>(null);
  const [dailyPhraseSaving, setDailyPhraseSaving] = useState(false);
  // Ticks forward on its own (see the interval below) purely to force
  // isWithinOnlineWindow to re-evaluate as time passes — otherwise a
  // member who goes quiet would stay "online" in the UI until the next
  // members refetch instead of aging out smoothly in between.
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    bootstrap().catch(() => {});
  }, [bootstrap]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (!cancelled) navigate({ to: "/connexion" });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const roles = (roleRows ?? []).map((r) => r.role);
      if (!roles.includes("admin")) {
        if (!cancelled) {
          if (roles.includes("free")) {
            const { data: profileRow } = await supabase
              .from("profiles")
              .select("preferred_format")
              .eq("id", data.user.id)
              .maybeSingle();
            navigate({ to: getFreeHomeHref(profileRow?.preferred_format) });
          } else {
            navigate({ to: "/mon-espace" });
          }
        }
        return;
      }
      if (!cancelled) {
        setChecking(false);
        refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // last_seen_at only moves because of *other* members' own heartbeats
  // (see usePresenceHeartbeat), so this admin view has to poll for it —
  // nothing pushes the change to us. Kept separate from the one-shot
  // `refresh()` above so this doesn't also re-fetch requests/progress/
  // settings every 30s.
  useEffect(() => {
    if (checking) return;
    const id = window.setInterval(() => {
      refreshMembers();
    }, 30_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  // Forces isWithinOnlineWindow to re-evaluate between member refetches so
  // someone who's gone quiet fades to "offline" smoothly instead of only
  // updating on the next 30s poll.
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const onlineMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of members) {
      if (isWithinOnlineWindow(m.last_seen_at, nowTick)) ids.add(m.id);
    }
    return ids;
  }, [members, nowTick]);

  async function refreshMembers() {
    try {
      const rows = await listMembersFn();
      setMembers(rows as Member[]);
    } catch (err) {
      console.error(err);
      setRequestError(
        "Impossible de charger la liste des membres. " + (err instanceof Error ? err.message : ""),
      );
    }
  }

  async function refresh() {
    await refreshMembers();
    try {
      const rows = await listRegistrationRequestsFn();
      setRegistrationRequests(rows as RegistrationRequest[]);
    } catch (err) {
      console.error(err);
      setRequestError(
        "Impossible de charger les demandes d'inscription. " +
          (err instanceof Error ? err.message : ""),
      );
    }
    try {
      const rows = await listAllLessonProgressFn();
      setLessonProgress(rows as LessonProgressRow[]);
      setProgressError(null);
    } catch (err) {
      console.error(err);
      setProgressError(
        "Impossible de charger le suivi de progression. " +
          (err instanceof Error ? err.message : ""),
      );
    }
    try {
      const rows = await listAllLessonRatingsFn();
      setLessonRatings(rows as LessonRatingRow[]);
      setRatingsError(null);
    } catch (err) {
      console.error(err);
      setRatingsError(
        "Impossible de charger les avis des leçons. " + (err instanceof Error ? err.message : ""),
      );
    }
    try {
      const settings = await getSiteSettingsFn();
      setRegistrationOpen(settings.free_registration_open);
      setDailyPhraseDraft(settings.daily_phrase ?? "");
      setDailyPhraseSaved(settings.daily_phrase);
      setSettingsError(null);
    } catch (err) {
      console.error(err);
      setSettingsError("Impossible de charger l'état des inscriptions gratuites.");
    }
  }

  async function toggleRegistrationOpen(nextOpen: boolean) {
    setRegistrationToggling(true);
    setSettingsError(null);
    try {
      const result = await setFreeRegistrationOpenFn({ data: { open: nextOpen } });
      setRegistrationOpen(result.free_registration_open);
    } catch (err) {
      console.error(err);
      setSettingsError("Impossible de mettre à jour l'état des inscriptions gratuites.");
    } finally {
      setRegistrationToggling(false);
    }
  }

  async function saveDailyPhrase() {
    setDailyPhraseSaving(true);
    setSettingsError(null);
    try {
      const trimmed = dailyPhraseDraft.trim();
      const result = await setDailyPhraseFn({ data: { phrase: trimmed || null } });
      setDailyPhraseDraft(result.daily_phrase ?? "");
      setDailyPhraseSaved(result.daily_phrase);
    } catch (err) {
      console.error(err);
      setSettingsError("Impossible d'enregistrer la phrase du jour.");
    } finally {
      setDailyPhraseSaving(false);
    }
  }

  async function setRequestStatus(id: string, status: "pending" | "rejected") {
    setRequestActionId(id);
    setRequestError(null);
    try {
      await updateRegistrationRequestStatusFn({ data: { id, status } });
      setRegistrationRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
      setRequestError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setRequestActionId(null);
    }
  }

  async function approveRequest(id: string, password: string) {
    setRequestActionId(id);
    setRequestError(null);
    try {
      await approveRegistrationRequestFn({ data: { id, password } });
      // Approved requests drop out of this inbox (they now show up as
      // members below), so just remove the row instead of updating its status.
      setRegistrationRequests((prev) => prev.filter((r) => r.id !== id));
      await refresh();
    } catch (err) {
      console.error(err);
      setRequestError(err instanceof Error ? err.message : "Impossible de créer le compte.");
    } finally {
      setRequestActionId(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/connexion" });
  }

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = registrationRequests.filter((r) => r.status === "pending").length;

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title={
          <>
            Gestion des <span className="text-gradient-brand">membres</span>
          </>
        }
        subtitle="Créez ou modifiez un compte membre, traitez les inscriptions et suivez la progression réelle de chaque étudiant en un coup d'œil."
      />

      <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <div className="mb-6 flex justify-end">
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                registrationOpen
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {registrationOpen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Inscriptions gratuites : {registrationOpen ? "ouvertes" : "fermées"}
              </p>
              <p className="text-xs text-muted-foreground">
                {registrationOpen
                  ? "La page /free-registration accepte de nouvelles inscriptions."
                  : "La page /free-registration affiche un message « bientôt de retour » à la place du formulaire."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleRegistrationOpen(!registrationOpen)}
            disabled={registrationToggling}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
              registrationOpen
                ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
            }`}
          >
            {registrationToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : registrationOpen ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            {registrationToggling
              ? "Mise à jour..."
              : registrationOpen
                ? "Fermer les inscriptions"
                : "Rouvrir les inscriptions"}
          </button>
        </div>

        {settingsError && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-border bg-card/70 p-4 shadow-card backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Quote className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Phrase du jour</p>
              <p className="text-xs text-muted-foreground">
                Affichée en haut de l'espace membre (/mon-espace) et dans le badge d'accroche de la
                page d'accueil publique. Laissez vide pour revenir à la phrase par défaut.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={dailyPhraseDraft}
                  onChange={(e) => setDailyPhraseDraft(e.target.value)}
                  maxLength={240}
                  placeholder="Your only limit is your mind"
                  className="w-full flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveDailyPhrase}
                  disabled={
                    dailyPhraseSaving || dailyPhraseDraft.trim() === (dailyPhraseSaved ?? "")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 disabled:opacity-50"
                >
                  {dailyPhraseSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  {dailyPhraseSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-card/70 p-1.5 backdrop-blur">
            <TabsTrigger value="requests" className="gap-1.5">
              <Inbox className="h-4 w-4" />
              Demandes
              {pendingCount > 0 && (
                <span className="ml-0.5 inline-flex rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="h-4 w-4" />
              Membres
              <span className="ml-0.5 inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {members.length}
              </span>
              {onlineMemberIds.size > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600"
                  title={`${onlineMemberIds.size} membre(s) en ligne`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {onlineMemberIds.size}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Progression
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-1.5">
              <Star className="h-4 w-4" />
              Avis
              {lessonRatings.length > 0 && (
                <span className="ml-0.5 inline-flex rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                  {lessonRatings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <RegistrationRequestsCard
              requests={registrationRequests}
              pendingActionId={requestActionId}
              errorMessage={requestError}
              onSetStatus={setRequestStatus}
              onApprove={approveRequest}
            />
          </TabsContent>

          <TabsContent value="members">
            <div className="flex flex-col gap-8">
              <CreateMemberCard
                onCreate={async (form, password, avatar) => {
                  const created = await createMemberFn({ data: { ...form, password } });
                  if (avatar) {
                    const path = await uploadAvatar(created.id, avatar);
                    await updateMemberFn({ data: { id: created.id, ...form, avatar_url: path } });
                  }
                  await refresh();
                  return created;
                }}
              />

              <div className="grid max-w-md grid-cols-2 gap-3 sm:gap-4">
                <KpiCard icon={Users} label="Total membres" value={String(members.length)} />
                <KpiCard
                  icon={Wifi}
                  label="En ligne maintenant"
                  value={`${onlineMemberIds.size} / ${members.length}`}
                />
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Membres ({members.length})
                  </h2>
                  <span
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"
                    title={`Actif au cours des ${ONLINE_THRESHOLD_MINUTES} dernières minutes`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {onlineMemberIds.size} en ligne
                  </span>
                </div>
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun membre pour l'instant.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-4">Membre</th>
                          <th className="py-2 pr-4">E-mail</th>
                          <th className="py-2 pr-4">Niveau</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Ville</th>
                          <th className="py-2 pr-4">Statut</th>
                          <th className="py-2 pr-4">Dernière activité</th>
                          <th className="py-2 pr-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m.id} className="border-b border-border/60">
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <MemberAvatar
                                    name={m.full_name}
                                    avatarPath={m.avatar_url}
                                    className="h-9 w-9"
                                  />
                                  {onlineMemberIds.has(m.id) && (
                                    <span
                                      className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3"
                                      title="En ligne maintenant"
                                    >
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium text-foreground">
                                  {m.full_name || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">{m.email ?? "—"}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_BADGE_CLASS[m.level]}`}
                              >
                                {m.level}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              {m.role === "free" ? (
                                <span className="inline-flex flex-col gap-1">
                                  <span className="inline-flex w-fit rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                                    Free
                                  </span>
                                  <span
                                    className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                      m.preferred_format === "coach"
                                        ? "bg-violet-500/10 text-violet-600"
                                        : "bg-sky-500/10 text-sky-600"
                                    }`}
                                    title={
                                      m.preferred_format === "coach"
                                        ? "A choisi HiT START Coach (150 000 Ar/2mo)"
                                        : "A choisi HiT START (49 000 Ar / jusqu'à 6 mois)"
                                    }
                                  >
                                    {m.preferred_format === "coach" ? "Coach" : "Daily"}
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                  Membre
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">{m.city || "—"}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  STATUS_BADGE_CLASS[m.status] ?? "bg-muted text-muted-foreground"
                                }`}
                              >
                                {STATUS_LABEL[m.status] ?? m.status}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              {onlineMemberIds.has(m.id) ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  En ligne
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {formatRelative(m.last_seen_at)}
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              <button
                                onClick={() => setEditing(m)}
                                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium transition hover:bg-accent"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Modifier
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <StudentProgressDashboard
              members={members}
              lessonProgress={lessonProgress}
              errorMessage={progressError}
            />
          </TabsContent>

          <TabsContent value="ratings">
            <LessonRatingsDashboard
              members={members}
              ratings={lessonRatings}
              errorMessage={ratingsError}
            />
          </TabsContent>
        </Tabs>
      </section>

      {editing && (
        <EditMemberDialog
          member={editing}
          onClose={() => setEditing(null)}
          onSave={async (form, avatar) => {
            let avatar_url: string | undefined = undefined;
            if (avatar) {
              avatar_url = await uploadAvatar(editing.id, avatar);
            }
            await updateMemberFn({
              data: {
                id: editing.id,
                ...form,
                ...(avatar_url ? { avatar_url } : {}),
              },
            });
            await refresh();
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

/* ---------- Registration requests inbox ---------- */

const REQUEST_STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};

const REQUEST_STATUS_BADGE_CLASS: Record<RegistrationStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
};

function RegistrationRequestsCard({
  requests,
  pendingActionId,
  errorMessage,
  onSetStatus,
  onApprove,
}: {
  requests: RegistrationRequest[];
  pendingActionId: string | null;
  errorMessage: string | null;
  onSetStatus: (id: string, status: "pending" | "rejected") => Promise<void>;
  onApprove: (id: string, password: string) => Promise<void>;
}) {
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const [approvingId, setApprovingId] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
      <div className="mb-5 flex items-center gap-2">
        <Inbox className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Demandes d'inscription gratuite ({requests.length})
        </h2>
        {pendingCount > 0 && (
          <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            {pendingCount} en attente
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune demande d'inscription pour l'instant.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Téléphone</th>
                <th className="py-2 pr-4">Naissance</th>
                <th className="py-2 pr-4">Reçue le</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium text-foreground">{r.full_name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.email}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.phone}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {r.birthdate ? new Date(r.birthdate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${REQUEST_STATUS_BADGE_CLASS[r.status]}`}
                    >
                      {REQUEST_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {r.status === "pending" ? (
                      approvingId === r.id ? (
                        <ApprovePasswordForm
                          disabled={pendingActionId === r.id}
                          onCancel={() => setApprovingId(null)}
                          onConfirm={async (password) => {
                            await onApprove(r.id, password);
                            setApprovingId(null);
                          }}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={pendingActionId === r.id}
                            onClick={() => setApprovingId(r.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approuver
                          </button>
                          <button
                            type="button"
                            disabled={pendingActionId === r.id}
                            onClick={() => onSetStatus(r.id, "rejected")}
                            className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Refuser
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={pendingActionId === r.id}
                        onClick={() => onSetStatus(r.id, "pending")}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
                      >
                        Remettre en attente
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Approuver une demande crée automatiquement le compte « free » du membre — il vous suffit de
        définir son mot de passe. Le code d'entrée à lui transmettre est l'adresse e-mail de la
        demande + ce mot de passe.
      </p>
    </div>
  );
}

function ApprovePasswordForm({
  disabled,
  onCancel,
  onConfirm,
}: {
  disabled: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="flex min-w-[220px] flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          autoFocus
          placeholder="Mot de passe (6 car. min.)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLocalError(null);
          }}
          className="w-full rounded-full border border-input bg-background px-3 py-1 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {localError && <span className="text-xs text-destructive">{localError}</span>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (password.trim().length < 6) {
              setLocalError("6 caractères minimum.");
              return;
            }
            onConfirm(password.trim());
          }}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 disabled:opacity-60"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {disabled ? "Création..." : "Créer le compte"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

/* ---------- Create form ---------- */

function CreateMemberCard({
  onCreate,
}: {
  onCreate: (
    form: ProfileFormState,
    password: string,
    avatar: File | null,
  ) => Promise<{ full_name: string; email: string; level: Level }>;
}) {
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    setError(null);
    const err = validateAvatar(f);
    if (err) {
      setError(err);
      setAvatar(null);
      setAvatarPreview(null);
      return;
    }
    setAvatar(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const created = await onCreate(form, password, avatar);
      setSuccess(`Membre créé : ${created.full_name} (${created.email}) — ${created.level}.`);
      setForm(EMPTY_PROFILE);
      setPassword("");
      setAvatar(null);
      setAvatarPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
      <div className="mb-5 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Ajouter un membre</h2>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <AvatarPicker
          previewUrl={avatarPreview}
          fallbackName={form.full_name}
          onSelect={handleFile}
          inputRef={fileRef}
        />

        <ProfileFieldsGrid
          form={form}
          setForm={setForm}
          extra={
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Mot de passe</span>
              <input
                type="text"
                required
                minLength={6}
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          }
        />

        {error && (
          <div className="md:col-span-2 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="md:col-span-2 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? "Création..." : "Ajouter le membre"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Edit dialog ---------- */

function EditMemberDialog({
  member,
  onClose,
  onSave,
}: {
  member: Member;
  onClose: () => void;
  onSave: (form: ProfileFormState, avatar: File | null) => Promise<void>;
}) {
  const [form, setForm] = useState<ProfileFormState>({
    full_name: member.full_name ?? "",
    email: member.email ?? "",
    level: member.level,
    role: member.role,
    phone: member.phone ?? "",
    city: member.city ?? "",
    country: member.country ?? "",
    birthdate: member.birthdate ?? "",
    bio: member.bio ?? "",
    status: member.status ?? "active",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    setError(null);
    const err = validateAvatar(f);
    if (err) {
      setError(err);
      setAvatar(null);
      setAvatarPreview(null);
      return;
    }
    setAvatar(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(form, avatar);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-1 font-display text-xl font-bold">Modifier le membre</h2>
        <p className="mb-5 text-sm text-muted-foreground">{member.email}</p>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <AvatarPicker
            previewUrl={avatarPreview}
            fallbackName={form.full_name}
            existingPath={member.avatar_url}
            onSelect={handleFile}
            inputRef={fileRef}
          />
          <ProfileFieldsGrid form={form} setForm={setForm} />

          <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-background/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Progression réelle (lecture seule)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReadOnlyStat label="Leçons faites" value={String(member.lessons_completed)} />
              <ReadOnlyStat
                label="Temps d'étude"
                value={formatStudyMinutes(member.study_minutes)}
              />
              <ReadOnlyStat label="Série" value={`${member.streak_days} j`} />
              <ReadOnlyStat label="Progression" value={`${member.progress_percent}%`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Ces chiffres sont calculés automatiquement à partir des leçons réellement terminées
              par le membre — consultez l'onglet « Progression » pour le détail leçon par leçon.
            </p>
          </div>

          {error && (
            <div className="md:col-span-2 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

/* ---------- Shared bits ---------- */

function AvatarPicker({
  previewUrl,
  existingPath,
  fallbackName,
  onSelect,
  inputRef,
}: {
  previewUrl: string | null;
  existingPath?: string | null;
  fallbackName: string;
  onSelect: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-border bg-background/60 p-4">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Aperçu"
          className="h-16 w-16 rounded-2xl object-cover shadow-elegant"
        />
      ) : (
        <MemberAvatar
          name={fallbackName || "M"}
          avatarPath={existingPath}
          className="h-16 w-16 rounded-2xl shadow-elegant"
          fallbackClassName="rounded-2xl text-xl"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Photo de profil</p>
        <p className="text-xs text-muted-foreground">JPG, JPEG, PNG ou WEBP — 500 Ko max.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        Choisir une image
      </button>
    </div>
  );
}

function ProfileFieldsGrid({
  form,
  setForm,
  extra,
}: {
  form: ProfileFormState;
  setForm: (f: ProfileFormState) => void;
  extra?: React.ReactNode;
}) {
  const set = <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) =>
    setForm({ ...form, [k]: v });

  const input =
    "rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="text-sm font-medium">Nom complet</span>
        <input
          required
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Adresse e-mail</span>
        <input
          type="email"
          required
          autoComplete="off"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={input}
        />
      </label>

      {extra}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Niveau</span>
        <select
          value={form.level}
          onChange={(e) => set("level", e.target.value as Level)}
          className={input}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Type de compte</span>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value as MemberRole)}
          className={input}
        >
          <option value="member">Membre (accès complet)</option>
          <option value="free">Free (accès gratuit limité)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Statut</span>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className={input}
        >
          <option value="active">Actif</option>
          <option value="paused">En pause</option>
          <option value="archived">Archivé</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Téléphone</span>
        <input
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Date de naissance</span>
        <input
          type="date"
          value={form.birthdate}
          onChange={(e) => set("birthdate", e.target.value)}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Ville</span>
        <input value={form.city} onChange={(e) => set("city", e.target.value)} className={input} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Pays</span>
        <input
          value={form.country}
          onChange={(e) => set("country", e.target.value)}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          className={input}
        />
      </label>
    </>
  );
}

/* ---------- Smart student progress dashboard ---------- */

type StudentAgg = {
  member: Member;
  lessons: LessonProgressRow[];
  lastActivity: string | null;
  avgScore: number | null;
  totalXp: number;
  totalAttempts: number;
  isInactive: boolean;
};

function buildStudentAggregates(
  members: Member[],
  lessonProgress: LessonProgressRow[],
): StudentAgg[] {
  const byUser = new Map<string, LessonProgressRow[]>();
  for (const row of lessonProgress) {
    const arr = byUser.get(row.user_id) ?? [];
    arr.push(row);
    byUser.set(row.user_id, arr);
  }

  const now = Date.now();
  return members.map((member) => {
    const lessons = (byUser.get(member.id) ?? [])
      .slice()
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    const lastActivity = lessons[0]?.completed_at ?? null;
    const avgScore =
      lessons.length > 0
        ? Math.round(lessons.reduce((sum, l) => sum + l.best_score, 0) / lessons.length)
        : null;
    const totalXp = lessons.reduce((sum, l) => sum + l.xp_earned, 0);
    const totalAttempts = lessons.reduce((sum, l) => sum + l.attempts, 0);
    const daysSinceActivity = lastActivity
      ? (now - new Date(lastActivity).getTime()) / 86_400_000
      : null;
    // Free accounts can't complete lessons at all (see requireConfirmedMember
    // in lessons.functions.ts), so flagging them as "inactive" would just be
    // noise — only confirmed members are eligible for the flag.
    const isInactive =
      member.role === "member" &&
      (daysSinceActivity === null || daysSinceActivity > INACTIVITY_THRESHOLD_DAYS);

    return { member, lessons, lastActivity, avgScore, totalXp, totalAttempts, isInactive };
  });
}

type SortKey = "progress" | "activity" | "name";

function StudentProgressDashboard({
  members,
  lessonProgress,
  errorMessage,
}: {
  members: Member[];
  lessonProgress: LessonProgressRow[];
  errorMessage: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const aggregates = useMemo(
    () => buildStudentAggregates(members, lessonProgress),
    [members, lessonProgress],
  );

  const kpis = useMemo(() => {
    const confirmedMembers = members.filter((m) => m.role === "member");
    const avgProgress = confirmedMembers.length
      ? Math.round(
          confirmedMembers.reduce((sum, m) => sum + m.progress_percent, 0) /
            confirmedMembers.length,
        )
      : 0;
    const sevenDaysAgo = Date.now() - 7 * 86_400_000;
    const completedThisWeek = lessonProgress.filter(
      (l) => new Date(l.completed_at).getTime() >= sevenDaysAgo,
    ).length;
    const avgScore = lessonProgress.length
      ? Math.round(lessonProgress.reduce((sum, l) => sum + l.best_score, 0) / lessonProgress.length)
      : null;
    return {
      studentCount: confirmedMembers.length,
      avgProgress,
      completedThisWeek,
      avgScore,
    };
  }, [members, lessonProgress]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = aggregates;
    if (q) {
      rows = rows.filter(
        (a) =>
          a.member.full_name.toLowerCase().includes(q) ||
          (a.member.email ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = rows.slice().sort((a, b) => {
      if (sortKey === "name") return a.member.full_name.localeCompare(b.member.full_name);
      if (sortKey === "activity") {
        const at = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bt = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bt - at;
      }
      return b.member.progress_percent - a.member.progress_percent;
    });
    return sorted;
  }, [aggregates, query, sortKey]);

  return (
    <div className="flex flex-col gap-6">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard icon={Users} label="Étudiants suivis" value={String(kpis.studentCount)} />
        <KpiCard icon={TrendingUp} label="Progression moyenne" value={`${kpis.avgProgress}%`} />
        <KpiCard
          icon={CheckCircle2}
          label="Leçons (7 derniers jours)"
          value={String(kpis.completedThisWeek)}
        />
        <KpiCard
          icon={BarChart3}
          label="Score moyen"
          value={kpis.avgScore === null ? "—" : `${kpis.avgScore}%`}
        />
      </div>

      <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Suivi de progression ({filtered.length})
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un étudiant..."
                className="w-full rounded-full border border-input bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-full border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="progress">Trier : Progression</option>
              <option value="activity">Trier : Dernière activité</option>
              <option value="name">Trier : Nom</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun étudiant ne correspond à cette recherche.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((agg) => (
              <StudentProgressRow
                key={agg.member.id}
                agg={agg}
                expanded={expandedId === agg.member.id}
                onToggle={() =>
                  setExpandedId((cur) => (cur === agg.member.id ? null : agg.member.id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card/70 p-4 shadow-card backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-primary" />
      </div>
      <p className="mt-2 truncate font-display text-xl font-bold text-foreground sm:mt-3 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function StudentProgressRow({
  agg,
  expanded,
  onToggle,
}: {
  agg: StudentAgg;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { member, lessons, lastActivity, avgScore, totalXp, isInactive } = agg;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MemberAvatar
            name={member.full_name}
            avatarPath={member.avatar_url}
            className="h-10 w-10 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate font-medium text-foreground">
                {member.full_name || "—"}
              </span>
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${LEVEL_BADGE_CLASS[member.level]}`}
              >
                {member.level}
              </span>
              {member.role === "free" && (
                <span className="inline-flex shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  Free
                </span>
              )}
              {isInactive && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Inactif
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{member.email ?? "—"}</p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6">
          <div className="min-w-[120px]">
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Progression</span>
              <span className="font-semibold text-foreground">{member.progress_percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-brand"
                style={{ width: `${member.progress_percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {member.lessons_completed}/{TOTAL_CURRICULUM_LESSONS} leçons
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {member.streak_days} j
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatStudyMinutes(member.study_minutes)}
          </div>

          <div
            className={`text-xs ${isInactive ? "font-medium text-destructive" : "text-muted-foreground"}`}
          >
            {formatRelative(lastActivity)}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 bg-card/40 p-4">
          {lessons.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucune leçon terminée pour l'instant
              {member.role === "free" ? " (compte free — accès limité)" : ""}.
            </p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  Score moyen : <span className="font-semibold text-foreground">{avgScore}%</span>
                </span>
                <span>
                  XP cumulé : <span className="font-semibold text-foreground">{totalXp}</span>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 uppercase tracking-wide text-muted-foreground">
                      <th className="py-1.5 pr-4">Leçon</th>
                      <th className="py-1.5 pr-4">Meilleur score</th>
                      <th className="py-1.5 pr-4">Tentatives</th>
                      <th className="py-1.5 pr-4">XP</th>
                      <th className="py-1.5 pr-4">Terminée le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((l) => (
                      <tr key={l.id} className="border-b border-border/40 last:border-0">
                        <td className="py-1.5 pr-4 font-medium text-foreground">
                          Leçon {String(l.lesson_number).padStart(2, "0")}
                        </td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{l.best_score}%</td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{l.attempts}</td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{l.xp_earned}</td>
                        <td className="py-1.5 pr-4 text-muted-foreground">
                          {new Date(l.completed_at).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Lesson ratings (read-only)
   ================================================================ */

// Every 1–5 star rating submitted from the end-of-lesson popup
// (src/components/site/LessonRatingDialog.tsx), grouped per lesson with the
// individual reviews underneath. Pure feedback data — it has no effect on
// progress, XP or streaks.
function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= Math.round(value)
              ? `${className} fill-amber-400 text-amber-400`
              : `${className} text-muted-foreground/30`
          }
        />
      ))}
    </span>
  );
}

function LessonRatingsDashboard({
  members,
  ratings,
  errorMessage,
}: {
  members: Member[];
  ratings: LessonRatingRow[];
  errorMessage: string | null;
}) {
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.id, m.full_name || m.email || "Membre");
    return map;
  }, [members]);

  const byLesson = useMemo(() => {
    const map = new Map<string, LessonRatingRow[]>();
    for (const r of ratings) {
      const arr = map.get(r.lesson_slug) ?? [];
      arr.push(r);
      map.set(r.lesson_slug, arr);
    }
    return Array.from(map.entries())
      .map(([slug, rows]) => ({
        slug,
        lessonNumber: rows[0]?.lesson_number ?? 0,
        rows: rows.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
        average: rows.reduce((sum, r) => sum + r.rating, 0) / rows.length,
      }))
      .sort((a, b) => a.lessonNumber - b.lessonNumber);
  }, [ratings]);

  const globalAverage =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null;

  return (
    <div className="rounded-3xl border border-border bg-card/70 p-5 backdrop-blur md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Star className="h-4 w-4 text-amber-500" /> Avis des leçons
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Notes 1 à 5 étoiles laissées par les apprenants à la fin de chaque leçon.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-extrabold text-foreground">
              {globalAverage ? globalAverage.toFixed(1) : "—"}
            </span>
            {globalAverage && <Stars value={globalAverage} />}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {ratings.length} avis au total
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {!errorMessage && ratings.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Aucun avis pour le moment. Les notes apparaîtront ici dès qu'un apprenant terminera une
          leçon.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {byLesson.map((lesson) => (
          <div key={lesson.slug} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-foreground">
                Leçon {String(lesson.lessonNumber).padStart(2, "0")}{" "}
                <span className="text-xs font-normal text-muted-foreground">({lesson.slug})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stars value={lesson.average} />
                <span className="font-bold text-foreground">{lesson.average.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">· {lesson.rows.length} avis</span>
              </div>
            </div>

            <ul className="mt-3 divide-y divide-border">
              {lesson.rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2 text-sm"
                >
                  <Stars value={row.rating} />
                  <span className="font-medium text-foreground">
                    {nameById.get(row.user_id) ?? "Apprenant"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(row.updated_at)}
                  </span>
                  {row.comment && (
                    <p className="w-full text-xs italic text-muted-foreground">“{row.comment}”</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
