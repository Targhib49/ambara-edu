import { NotFoundState } from "@/components/ui/NotFoundState";

// Unmatched URLs, and notFound() from pages outside the role layouts.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 bg-zinc-50">
      <NotFoundState />
    </main>
  );
}
