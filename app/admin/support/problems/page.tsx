import { redirect } from "next/navigation";

/** Problems fold into Tickets queue */
export default function SupportProblemsRedirect() {
  redirect("/admin/tickets");
}
