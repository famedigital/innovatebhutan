import { redirect } from "next/navigation";

/** Legacy stub → staff ERP Manual */
export default function DocsRedirectPage() {
  redirect("/admin/manual");
}
