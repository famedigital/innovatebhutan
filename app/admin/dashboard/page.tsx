import { redirect } from "next/navigation";

/** Single dashboard lives at /admin */
export default function DashboardRedirectPage() {
  redirect("/admin");
}
