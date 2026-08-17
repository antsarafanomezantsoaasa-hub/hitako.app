import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useDailyPhrase } from "@/hooks/use-daily-phrase";

interface MemberHomeHeaderProps {
  displayName: string;
  // Note: streak intentionally isn't shown in this header — it's already
  // surfaced right below in the stats grid (see the "Streak" StatCard in
  // mon-espace/index.tsx). Showing it twice on the same screen, once as a
  // "X-day streak" pill here and once as a stat card, was a duplication bug.
}

// Refresh often enough that the pill flips over to the next day on its own
// if someone leaves the tab open past midnight, without needing a reload.
const LIVE_DATE_REFRESH_MS = 60_000;

function useLiveFormattedDate() {
  const [label, setLabel] = useState(() => formatToday());

  useEffect(() => {
    const id = setInterval(() => setLabel(formatToday()), LIVE_DATE_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return label;
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function MemberHomeHeader({ displayName }: MemberHomeHeaderProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;
  const dailyPhrase = useDailyPhrase();
  const todayLabel = useLiveFormattedDate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Welcome {firstName}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">Ready for today?</p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm shadow-card backdrop-blur sm:flex-1">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span className="shrink-0 font-semibold text-foreground/80">Daily phrase:</span>
          <span className="truncate italic text-muted-foreground">&ldquo;{dailyPhrase}&rdquo;</span>
        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card backdrop-blur sm:ml-auto sm:self-auto">
          <Calendar className="h-3.5 w-3.5" />
          {todayLabel}
        </span>
      </div>
    </div>
  );
}

export default MemberHomeHeader;
