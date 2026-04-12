import { HRDashboard } from "./hr-dashboard";
import { Button } from "@/components/ui/button";
import { OperatorOnboardingModal } from "./operator-onboarding-modal";

export default function HRPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">HR & Payroll</h1>
          <p className="text-sm text-gray-500">Team management</p>
        </div>
        <div className="flex gap-3">
          <OperatorOnboardingModal 
            trigger={
              <Button className="bg-black hover:bg-gray-800 text-white">
                Add Employee
              </Button>
            } 
          />
        </div>
      </div>

      <HRDashboard />
    </div>
  );
}