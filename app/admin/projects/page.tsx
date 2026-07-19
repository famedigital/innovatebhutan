import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectHubWithErrorBoundary } from "./project-hub-with-boundary";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Projects"
        description="Project delivery and tracking"
      />
      <ProjectHubWithErrorBoundary />
    </div>
  );
}
