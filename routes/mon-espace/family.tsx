import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Megaphone, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceholderCard } from "@/components/site/member-space/shared";

export const Route = createFileRoute("/mon-espace/family")({
  head: () => ({
    meta: [{ title: "HiTako Family | HiTako Academy" }],
  }),
  component: HiTakoFamilyPage,
});

function HiTakoFamilyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-card backdrop-blur sm:p-6 md:p-8">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            HiTako Family
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A space to share wins, ask questions and grow together with the rest of the HiTako
          community.
        </p>
      </div>

      <Tabs defaultValue="community">
        <TabsList>
          <TabsTrigger value="community" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Community
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" /> Official Updates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="community">
          <PlaceholderCard
            icon={Users}
            title="Community"
            description="Share your progress and connect with other members."
          />
        </TabsContent>
        <TabsContent value="updates">
          <PlaceholderCard
            icon={Megaphone}
            title="Official Updates"
            description="News and announcements straight from the HiTako team."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
