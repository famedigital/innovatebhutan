"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Edit } from "lucide-react";

interface ExpenseDetailModalProps {
  expense: any;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: (expense: any) => void;
  onAction: (id: number, action: "approve" | "reject") => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors: Record<string, string> = {
  travel: "bg-blue-50 text-blue-700",
  accommodation: "bg-purple-50 text-purple-700",
  meals: "bg-orange-50 text-orange-700",
  supplies: "bg-cyan-50 text-cyan-700",
  equipment: "bg-indigo-50 text-indigo-700",
  transportation: "bg-pink-50 text-pink-700",
  utilities: "bg-gray-50 text-gray-700",
  communication: "bg-teal-50 text-teal-700",
  training: "bg-amber-50 text-amber-700",
  entertainment: "bg-rose-50 text-rose-700",
  medical: "bg-red-50 text-red-700",
  other: "bg-slate-50 text-slate-700",
};

export function ExpenseDetailModal({
  expense,
  onClose,
  onUpdated,
  onEdit,
  onAction,
}: ExpenseDetailModalProps) {
  const handleAction = async (action: "approve" | "reject") => {
    await onAction(expense.id, action);
    onUpdated();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Expense Details #{expense.id}</DialogTitle>
            <Badge className={statusColors[expense.status] || ""}>
              {expense.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Employee</label>
              <p className="text-lg">{expense.employeeName || "Unknown"}</p>
              <p className="text-sm text-gray-500">{expense.employeeEmail || ""}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <div className="mt-1">
                <Badge className={categoryColors[expense.category] || ""}>
                  {expense.category}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Amount</label>
            <p className="text-2xl font-bold">Nu. {expense.amount}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{expense.description}</p>
          </div>

          {expense.receiptUrl && (
            <div>
              <label className="text-sm font-medium text-gray-500">Receipt</label>
              <div>
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Receipt
                </a>
              </div>
            </div>
          )}

          {expense.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-700 whitespace-pre-wrap">{expense.notes}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Created on {new Date(expense.createdAt).toLocaleString()}
          </div>

          {expense.status === "pending" && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => handleAction("approve")}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => onEdit(expense)} variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
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
