"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Something went wrong</h2>
      <button
        onClick={reset}
        style={{ marginTop: 16, padding: "8px 24px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
