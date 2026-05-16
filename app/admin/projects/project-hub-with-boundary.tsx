"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectHub } from "./project-hub";

/**
 * ProjectHub wrapped with error boundary
 * Catches JavaScript errors and displays a fallback UI
 */
export function ProjectHubWithErrorBoundary() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("[ProjectHub] Error caught:", error, errorInfo);
      }}
    >
      <ProjectHub />
    </ErrorBoundary>
  );
}
