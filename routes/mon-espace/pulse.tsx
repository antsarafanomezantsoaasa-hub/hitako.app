import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Megaphone, Newspaper, Radio, type LucideIcon } from "lucide-react";
import { PlaceholderCard } from "@/components/site/member-space/shared";

export const Route = createFileRoute("/mon-espace/pulse")({
  head: () => ({
    meta: [{ title: "HiTako Pulse | HiTako Academy" }],
  }),
  component: HiTakoPulsePage,
});

function HiTakoPulsePage() {
  const items: { icon: LucideIcon; title: string; description: string }[] = [
    { icon: Newspaper, title: "Latest News", description: "The latest from HiTako Academy." },
    { icon: Radio, title: "Upcoming Lives", description: "Your next live sessions to book." },
    { icon: BookOpen, title: "New Lessons", description: "Freshly published lessons and modules." },
    {
      icon: Megaphone,
      title: "Announcements",
      description: "Important updates from the team.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur sm:p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            HiTako Pulse
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything happening at HiTako Academy, in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <PlaceholderCard
            key={i.title}
            icon={i.icon}
            title={i.title}
            description={i.description}
          />
        ))}
      </div>
    </div>
  );
}
