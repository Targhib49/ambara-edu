import { notFound } from "next/navigation";
import { MentalMathGame } from "@/components/games/MentalMathGame";

/** Maps a live game's slug to its component. A new game adds a case here and an entry in the registry. */
export function GameView({ slug }: { slug: string }) {
  switch (slug) {
    case "mental-math":
      return <MentalMathGame />;
    default:
      notFound();
  }
}
