import { ClientManager } from "./client-manager";
import { Button } from "@/components/ui/button";
import { NodeEnrollmentModal } from "./node-enrollment-modal";
import { BulkIngestionModal } from "./bulk-ingestion-modal";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Clients</h1>
          <p className="text-sm text-gray-500">Manage enterprise client nodes</p>
        </div>
        <div className="flex gap-3">
          <NodeEnrollmentModal 
            trigger={
              <Button className="bg-black hover:bg-gray-800 text-white">
                Add Client
              </Button>
            } 
          />
          <BulkIngestionModal 
            trigger={
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Bulk Import
              </Button>
            } 
          />
        </div>
      </div>

      <ClientManager />
    </div>
  );
}