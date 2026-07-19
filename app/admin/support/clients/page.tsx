import { redirect } from "next/navigation";

/** Orphan support clients hub → canonical Clients */
export default function SupportClientsRedirect() {
  redirect("/admin/clients");
}
