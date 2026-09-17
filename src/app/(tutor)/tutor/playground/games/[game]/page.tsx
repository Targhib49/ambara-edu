import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n/server";
import { requireTutor } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { findLiveGame } from "@/lib/games/registry";
import { GameView } from "@/components/games/GameView";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";

export default async function TutorGamePage({ params }: { params: Promise<{ game: string }> }) {
  await requireTutor();
  const t = await getT();
  if (!(await isEnabled("playground"))) notFound();
  const { game: slug } = await params;
  const game = findLiveGame(slug);
  if (!game) notFound();

  return (
    <PlaygroundFrame
      crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("playground.title"), href: "/tutor/playground" }, { label: game.title }]}
      title={game.title}
      meta={game.tags.join(" · ")}
    >
      <GameView slug={game.slug} />
    </PlaygroundFrame>
  );
}
