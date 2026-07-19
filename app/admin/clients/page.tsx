import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { ClientManager } from "./client-manager";
import { NodeEnrollmentModal } from "./node-enrollment-modal";
import { BulkIngestionModal } from "./bulk-ingestion-modal";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Clients"
        description="Search, multi-select, and assign focal or backup staff across 200+ accounts"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clients" },
        ]}
        actions={
          <>
            <BulkIngestionModal
              trigger={<Button variant="outline">Bulk Import</Button>}
            />
            <NodeEnrollmentModal trigger={<Button>Add Client</Button>} />
          </>
        }
      />
      <ClientManager />
    </div>
  );
}
