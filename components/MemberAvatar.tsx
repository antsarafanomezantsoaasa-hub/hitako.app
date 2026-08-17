import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getSessionCached } from "@/lib/session-cache";

function computeInitials(name: string | null | undefined, fallback = "M"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((s) => s[0]?.toUpperCase() ?? "").join("");
  return initials || fallback;
}

export function MemberAvatar({
  name,
  avatarPath,
  className,
  fallbackClassName,
}: {
  name?: string | null;
  avatarPath?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!avatarPath) {
      setUrl(null);
      return;
    }
    // Absolute URL (already public) — use as-is
    if (/^https?:\/\//i.test(avatarPath)) {
      setUrl(avatarPath);
      return;
    }
    // Signed URLs are valid for an hour and the underlying file rarely
    // changes, so cache per path for the session instead of re-signing on
    // every mount (see src/lib/session-cache.ts) — otherwise the avatar
    // re-fetches, and visibly flashes, every time the /mon-espace or /zero
    // shell remounts (e.g. tapping between footer tabs).
    getSessionCached(`avatar-url:${avatarPath}`, async () => {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(avatarPath, 3600);
      return data?.signedUrl ?? null;
    }).then(
      (signedUrl) => {
        if (!cancelled) setUrl(signedUrl);
      },
      () => {
        if (!cancelled) setUrl(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [avatarPath]);

  const initials = computeInitials(name);
  return (
    <Avatar className={className}>
      {url && <AvatarImage src={url} alt={name ?? "Avatar"} />}
      <AvatarFallback
        className={cn("bg-gradient-brand font-bold text-primary-foreground", fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { computeInitials };
