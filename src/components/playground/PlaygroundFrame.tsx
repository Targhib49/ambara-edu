import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Crumb } from "@/components/ui/Breadcrumbs";

/** The page around one game, animation or tool: header, then the thing itself in a card. */
export function PlaygroundFrame({
  crumbs,
  title,
  meta,
  actions,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <PageHeader crumbs={crumbs} title={title} meta={meta} actions={actions} />
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">{children}</div>
    </div>
  );
}
