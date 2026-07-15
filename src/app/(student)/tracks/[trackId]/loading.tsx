import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Boundary inside the track's content-sidebar shell — without this,
// lesson-to-lesson navigation within a track shows no indicator (the group
// -level loading.tsx sits above the persistent track layout).
export default function StudentTrackLoading() {
  return <LoadingSpinner />;
}
