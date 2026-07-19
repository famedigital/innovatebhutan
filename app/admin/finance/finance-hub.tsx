import { redirect } from "next/navigation";

/** Retire legacy OCR finance hub file surface — ledger is Transactions */
export default function FinanceHubRedirect() {
  redirect("/admin/transactions");
}
