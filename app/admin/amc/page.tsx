import { redirect } from "next/navigation";

/** Legacy AMC URL → RanceLab product desk */
export default function AmcLegacyRedirect() {
  redirect("/admin/products/rancelab/amc");
}
