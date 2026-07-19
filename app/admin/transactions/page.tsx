"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateTransactionModal } from "./create-transaction-modal";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: string;
  category: string;
  referenceId: string | null;
  notes: string | null;
  date: string;
}

interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`/api/transactions?${params}`);
      const data: TransactionsResponse = await response.json();

      if (data.success) {
        setTransactions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, typeFilter, categoryFilter]);

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchTransactions();
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction? This cannot be undone.")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
      } else {
        const result = await response.json();
        alert(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  const handleReconcileTransaction = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reconcile" }),
      });

      if (response.ok) {
        fetchTransactions();
      } else {
        const result = await response.json();
        alert(result.error || "Failed to reconcile transaction");
      }
    } catch (error) {
      console.error("Failed to reconcile transaction:", error);
      alert("Failed to reconcile transaction");
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedTransaction(null);
    setEditTransaction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        description="Financial transactions and reconciliation"
        actions={
          <Button
            onClick={() => {
              setEditTransaction(null);
              setShowCreateModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Transaction
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64"
                />
                <Button size="sm" variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="service_revenue">Service Revenue</SelectItem>
                  <SelectItem value="product_sales">Product Sales</SelectItem>
                  <SelectItem value="consulting_fees">Consulting Fees</SelectItem>
                  <SelectItem value="amc_payment">AMC Payment</SelectItem>
                  <SelectItem value="project_payment">Project Payment</SelectItem>
                  <SelectItem value="other_income">Other Income</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="other_expense">Other Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">#{transaction.id}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColors[transaction.type] || ""}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[transaction.category] || ""}>
                        {transaction.category.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.referenceId || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      Nu. {transaction.amount}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-500">
                      {transaction.notes || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReconcileTransaction(transaction.id)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Reconcile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateTransactionModal
          onClose={handleModalClose}
          onCreated={() => {
            handleModalClose();
            fetchTransactions();
          }}
          editTransaction={editTransaction}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={handleModalClose}
          onUpdated={fetchTransactions}
          onEdit={() => handleEditTransaction(selectedTransaction)}
          onReconcile={handleReconcileTransaction}
        />
      )}
    </div>
  );
}
