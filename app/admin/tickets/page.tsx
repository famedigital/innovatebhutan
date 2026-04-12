import { TicketHub } from "./ticket-hub";
import { Button } from "@/components/ui/button";

export default function TicketsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Tickets</h1>
          <p className="text-sm text-[#717171]">Support tickets</p>
        </div>
      </div>

      <TicketHub />
    </div>
  );
}