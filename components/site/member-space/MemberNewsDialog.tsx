import { Mail, Sparkles, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * News & updates banner popup, opened from the envelope icon in MemberTopBar.
 *
 * Content is meant to be filled dynamically by an admin later; for now the
 * component ships with two default announcements (welcome + app updates).
 * Pass `items` to override them.
 */

export interface MemberNewsItem {
  id: string;
  title: string;
  body: string;
  tone?: "welcome" | "update";
}

export const DEFAULT_NEWS_ITEMS: MemberNewsItem[] = [
  {
    id: "welcome",
    title: "Welcome to HiTako! 🎉",
    body: "We are so happy to have you here. Take your time, learn a little every day, and enjoy each small win. Every lesson you finish brings you closer to speaking with confidence. You are not alone — our team is here to help you all the way.",
    tone: "welcome",
  },
  {
    id: "updates",
    title: "The app keeps getting better ✨",
    body: "We update HiTako every week to make it better for you. New lessons, faster pages, and small fixes arrive all the time, so your learning stays clear, fun, and effective. Thank you for learning with us — your feedback helps us improve week by week.",
    tone: "update",
  },
];

interface MemberNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: MemberNewsItem[];
}

export default function MemberNewsDialog({
  open,
  onOpenChange,
  items = DEFAULT_NEWS_ITEMS,
}: MemberNewsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative overflow-hidden bg-gradient-brand px-6 pb-6 pt-7 text-primary-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0 14px, rgba(255,255,255,0) 14px 34px)",
            }}
          />
          <DialogHeader className="relative space-y-1 text-left">
            <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary-foreground/30 bg-primary-foreground/15 backdrop-blur">
              <Mail className="h-5 w-5" />
            </span>
            <DialogTitle className="text-2xl font-extrabold text-primary-foreground">
              News &amp; Updates
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/85">
              A little word from the HiTako team.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 pb-6 pt-5">
          {items.map((item) => {
            const Icon = item.tone === "update" ? Rocket : Sparkles;
            return (
              <article
                key={item.id}
                className="rounded-2xl border-2 border-border bg-card p-4 shadow-sticker-soft"
              >
                <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
