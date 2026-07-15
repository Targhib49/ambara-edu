import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Boundary inside the tutor track shell — covers lesson-editor navigations
// that never reach the tutor group's own loading.tsx.
export default function TutorTrackLoading() {
  return <LoadingSpinner />;
}
