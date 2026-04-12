import { FinanceHub } from "./finance-hub";
import { Button } from "@/components/ui/button";

export default function FinancePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Finance</h1>
          <p className="text-sm text-[#717171]">Financial overview</p>
        </div>
      </div>

      <FinanceHub />
    </div>
  );
}