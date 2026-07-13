import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Root loading boundary: covers the very first paint (before the role
// layouts and their auth/DB lookups resolve). The role groups have their own
// boundaries so the sidebar/topbar shell stays visible on later navigations.
export default function RootLoading() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50">
      <LoadingSpinner />
    </main>
  );
}
