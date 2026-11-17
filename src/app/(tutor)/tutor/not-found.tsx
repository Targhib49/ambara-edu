import { NotFoundState } from "@/components/ui/NotFoundState";

// notFound() from a page in this group lands here, inside the role layout, so
// the sidebar and top bar stay on screen.
export default function NotFound() {
  return <NotFoundState />;
}
