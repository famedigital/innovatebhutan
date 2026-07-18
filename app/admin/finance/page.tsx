import { redirect } from "next/navigation";

/** Legacy finance hub — redirect to Transactions (API-backed financials). */
export default function FinancePage() {
  redirect("/admin/transactions");
}
