import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TicketHub } from "./ticket-hub";

export default function TicketsPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Tickets"
        description="Support tickets and client requests"
      />
      <TicketHub />
    </div>
  );
}
