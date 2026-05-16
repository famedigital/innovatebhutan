import { ProjectHubWithErrorBoundary } from "./project-hub-with-boundary";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Projects</h1>
          <p className="text-sm text-[#717171]">Project management</p>
        </div>
      </div>

      <ProjectHubWithErrorBoundary />
    </div>
  );
}