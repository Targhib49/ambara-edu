import type { MessageKey } from "@/lib/i18n/messages";

/**
 * The playground's games. Games are general — open to anyone signed in, not
 * tied to a course — and, like visualizations, are built in code: adding one
 * means a component plus an entry here.
 */
export type Game = {
  slug: string;
  /** A name, so it isn't translated — like the visualization names. */
  title: string;
  blurbKey: MessageKey;
  /** Short tags shown on the card. */
  tagKeys: MessageKey[];
  status: "live" | "coming_soon";
  /** Tailwind gradient for the card's header band. */
  accent: string;
};

export const GAMES: Game[] = [
  {
    slug: "mental-math",
    title: "Mental Math Sprint",
    blurbKey: "game.mentalMath.blurb",
    tagKeys: ["game.tag.math", "game.tag.sixtySeconds"],
    status: "live",
    accent: "from-blue-600 to-indigo-600",
  },
  {
    slug: "python-wars",
    title: "Python Wars",
    blurbKey: "game.comingSoonBlurb",
    tagKeys: ["game.tag.python"],
    status: "coming_soon",
    accent: "from-emerald-600 to-teal-600",
  },
  {
    slug: "data-sleuth",
    title: "Data Sleuth",
    blurbKey: "game.comingSoonBlurb",
    tagKeys: ["game.tag.data"],
    status: "coming_soon",
    accent: "from-amber-500 to-orange-600",
  },
];

export function findLiveGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug && g.status === "live");
}
