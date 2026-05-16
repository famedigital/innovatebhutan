"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: (transaction: any) => void;
  onReconcile: (id: number) => void;
}

const typeColors: Record<string, string> = {
  INCOME: "bg-green-100 text-green-800 border-green-200",
  EXPENSE: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors: Record<string, string> = {
  service_revenue: "bg-emerald-50 text-emerald-700",
  product_sales: "bg-teal-50 text-teal-700",
  consulting_fees: "bg-cyan-50 text-cyan-700",
  amc_payment: "bg-blue-50 text-blue-700",
  project_payment: "bg-indigo-50 text-indigo-700",
  other_income: "bg-green-50 text-green-700",
  salary: "bg-orange-50 text-orange-700",
  rent: "bg-purple-50 text-purple-700",
  utilities: "bg-yellow-50 text-yellow-700",
  supplies: "bg-pink-50 text-pink-700",
  equipment: "bg-rose-50 text-rose-700",
  travel: "bg-amber-50 text-amber-700",
  marketing: "bg-red-50 text-red-700",
  software: "bg-slate-50 text-slate-700",
  insurance: "bg-gray-50 text-gray-700",
  taxes: "bg-stone-50 text-stone-700",
  other_expense: "bg-zinc-50 text-zinc-700",
};

const categoryLabels: Record<string, string> = {
  service_revenue: "Service Revenue",
  product_sales: "Product Sales",
  consulting_fees: "Consulting Fees",
  amc_payment: "AMC Payment",
  project_payment: "Project Payment",
  other_income: "Other Income",
  salary: "Salary",
  rent: "Rent",
  utilities: "Utilities",
  supplies: "Supplies",
  equipment: "Equipment",
  travel: "Travel",
  marketing: "Marketing",
  software: "Software",
  insurance: "Insurance",
  taxes: "Taxes",
  other_expense: "Other Expense",
};

export function TransactionDetailModal({
  transaction,
  onClose,
  onUpdated,
  onEdit,
  onReconcile,
}: TransactionDetailModalProps) {
  const handleReconcile = async () => {
    await onReconcile(transaction.id);
    onUpdated();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transaction Details #{transaction.id}</DialogTitle>
            <Badge className={typeColors[transaction.type] || ""}>
              {transaction.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <div className="mt-1">
                <Badge className={categoryColors[transaction.category] || ""}>
                  {categoryLabels[transaction.category] || transaction.category}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Amount</label>
            <p className={`text-2xl font-bold ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "INCOME" ? "+" : "-"} Nu. {transaction.amount}
            </p>
          </div>

          {transaction.referenceId && (
            <div>
              <label className="text-sm font-medium text-gray-500">Reference ID</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {transaction.referenceId}
              </p>
            </div>
          )}

          {transaction.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-700 whitespace-pre-wrap">{transaction.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => onEdit(transaction)} variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleReconcile} variant="outline" className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Reconcile
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
