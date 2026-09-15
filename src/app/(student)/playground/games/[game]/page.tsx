import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { findLiveGame } from "@/lib/games/registry";
import { GameView } from "@/components/games/GameView";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";

export default async function StudentGamePage({ params }: { params: Promise<{ game: string }> }) {
  await requireStudent();
  if (!(await isEnabled("playground"))) notFound();
  const { game: slug } = await params;
  const game = findLiveGame(slug);
  if (!game) notFound();

  return (
    <PlaygroundFrame
      crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Playground", href: "/playground" }, { label: game.title }]}
      title={game.title}
      meta={game.tags.join(" · ")}
    >
      <GameView slug={game.slug} />
    </PlaygroundFrame>
  );
}
