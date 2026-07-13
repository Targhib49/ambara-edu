import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Renders inside the student shell while a page's data loads — the sidebar
// and top bar stay interactive, only the content area shows the spinner.
export default function StudentLoading() {
  return <LoadingSpinner />;
}
