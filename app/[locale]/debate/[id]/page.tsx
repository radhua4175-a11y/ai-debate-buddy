import type { Metadata } from "next";
import { Suspense } from "react";
import { DebateRoom } from "@/components/debate-room";

export const metadata: Metadata = { robots: { index: false } };

// The id is read on the client (useParams); the layout already validated the locale.
export default function DebatePage() {
  return (
    <Suspense fallback={null}>
      <DebateRoom />
    </Suspense>
  );
}
