import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Boundary inside the course's content-sidebar shell — without this,
// lesson-to-lesson navigation within a course shows no indicator (the group
// -level loading.tsx sits above the persistent course layout).
export default function StudentTrackLoading() {
  return <LoadingSpinner />;
}
