"use client";

import { HRDashboard } from "./hr-dashboard";
import { Button } from "@/components/ui/button";
import { OperatorOnboardingModal } from "./operator-onboarding-modal";
import { PayslipListModal } from "./payslip-list";
import { BatchPayrollModal } from "./batch-payroll-modal";
import { useState } from "react";
import Link from "next/link";
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
        description="Team payroll, payslips, and employee onboarding"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/admin/hr/reports/">HR Reports</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPayslips(true)}
            >
              <FileText className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">View Payslips</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBatch(true)}
            >
              <Sparkles className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Run Payroll</span>
            </Button>
            <OperatorOnboardingModal
              onCreated={() => setRefreshKey((k) => k + 1)}
              trigger={
                <Button size="sm">
                  <Users className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Employee</span>
                  <span className="sm:hidden">Add</span>
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
