import { redirect } from "next/navigation";

/** Communications fold into client hub / WhatsApp */
export default function SupportCommunicationsRedirect() {
  redirect("/admin/whatsapp");
}
