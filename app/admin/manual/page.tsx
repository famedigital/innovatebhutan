import { redirect } from "next/navigation";
import { MANUAL_DEFAULT_SLUG } from "@/lib/manual/catalog";

export default function ManualIndexPage() {
  redirect(`/admin/manual/${MANUAL_DEFAULT_SLUG}`);
}
