import type { Metadata } from "next";
import { PublicQuoteClient } from "./public-quote-client";

export const metadata: Metadata = {
  title: "Quotation | Innovates Bhutan",
  description: "View your Innovates Bhutan quotation and pay advance via mBoB.",
  robots: { index: false, follow: false },
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return <PublicQuoteClient publicId={publicId} />;
}
