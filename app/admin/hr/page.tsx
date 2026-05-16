"use client";

import { HRDashboard } from "./hr-dashboard";
import { Button } from "@/components/ui/button";
import { OperatorOnboardingModal } from "./operator-onboarding-modal";
import { PayslipListModal } from "./payslip-list";
import { BatchPayrollModal } from "./batch-payroll-modal";
import { useState } from "react";
import { Users, FileText, Sparkles } from "lucide-react";

export default function HRPage() {
  const [showPayslips, setShowPayslips] = useState(false);
  const [showBatch, setShowBatch] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">HR & Payroll</h1>
          <p className="text-sm text-gray-500">Team management and payroll</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPayslips(true)}
            className="border-[#E5E5E1]"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Payslips
          </Button>
          <Button
            onClick={() => setShowBatch(true)}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
          <OperatorOnboardingModal
            trigger={
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Users className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            }
          />
        </div>
      </div>

      <HRDashboard />

      <PayslipListModal open={showPayslips} onOpenChange={setShowPayslips} />
      <BatchPayrollModal open={showBatch} onOpenChange={setShowBatch} />
    </div>
  );
}