"use client";

import { HRDashboard } from "./hr-dashboard";
import { Button } from "@/components/ui/button";
import { OperatorOnboardingModal } from "./operator-onboarding-modal";
import { PayslipListModal } from "./payslip-list";
import { BatchPayrollModal } from "./batch-payroll-modal";
import { useState } from "react";
import { Users, FileText, Sparkles } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function HRPage() {
  const [showPayslips, setShowPayslips] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payroll"
        description="Team payroll, payslips, and onboarding"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "People" },
          { label: "Payroll" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowPayslips(true)}>
              <FileText className="w-4 h-4 mr-2" />
              View Payslips
            </Button>
            <Button variant="outline" onClick={() => setShowBatch(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Payroll
            </Button>
            <OperatorOnboardingModal
              onCreated={() => setRefreshKey((k) => k + 1)}
              trigger={
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              }
            />
          </>
        }
      />
      <HRDashboard key={refreshKey} />
      <PayslipListModal open={showPayslips} onOpenChange={setShowPayslips} />
      <BatchPayrollModal open={showBatch} onOpenChange={setShowBatch} />
    </div>
  );
}
