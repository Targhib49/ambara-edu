import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n/server";
import { requireStudent } from "@/lib/auth";
import { findLiveGame } from "@/lib/games/registry";
import { GameView } from "@/components/games/GameView";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";

export default async function StudentGamePage({ params }: { params: Promise<{ game: string }> }) {
  await requireStudent();
  const t = await getT();
  const { game: slug } = await params;
  const game = findLiveGame(slug);
  if (!game) notFound();

  return (
    <PlaygroundFrame
      crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("playground.title"), href: "/playground" }, { label: game.title }]}
      title={game.title}
      meta={game.tags.join(" · ")}
    >
      <GameView slug={game.slug} />
    </PlaygroundFrame>
  );
}
