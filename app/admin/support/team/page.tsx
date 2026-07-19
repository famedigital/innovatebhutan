import { redirect } from "next/navigation";

/** Support team ownership lives on Clients */
export default function SupportTeamRedirect() {
  redirect("/admin/clients");
}
