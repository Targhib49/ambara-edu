import type { HTMLAttributes } from "react";
import { cardCls } from "./styles";

const PADDING = { none: "", sm: "p-4", md: "p-5", lg: "p-6 sm:p-8" } as const;

/** A white panel on the page background. Renders a <section> unless told otherwise. */
export function Card({
  padding = "md",
  as: Tag = "section",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { padding?: keyof typeof PADDING; as?: "section" | "div" | "article" | "li" }) {
  return <Tag className={[cardCls, PADDING[padding], className].filter(Boolean).join(" ")} {...props} />;
}
