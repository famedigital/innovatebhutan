"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Download, RotateCcw, RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import type { InvoiceTemplateDesign, ProductKey } from "@/lib/invoices/templateDefaults";
import { defaultDesignForProduct } from "@/lib/invoices/templateDefaults";
import { renderInvoicePdf } from "@/lib/invoices/renderInvoicePdf";

type TemplateRow = {
  id: number;
  productKey: string;
  name: string;
  version: number;
  isActive: boolean | null;
  design: InvoiceTemplateDesign;
};

export function InvoiceDesignEditor({
  productKey,
  title,
  description,
}: {
  productKey: ProductKey;
  title: string;
  description: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<TemplateRow | null>(null);
  const [design, setDesign] = useState<InvoiceTemplateDesign>(
    defaultDesignForProduct(productKey)
  );
  const [termsText, setTermsText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/invoice-templates?product=${productKey}&active=true`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load");
      const tpl = data.data as TemplateRow;
      setActive(tpl);
      const d = { ...defaultDesignForProduct(productKey), ...(tpl.design || {}) };
      setDesign(d);
      setTermsText((d.termsAndConditions || []).join("\n"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [productKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = <K extends keyof InvoiceTemplateDesign>(
    key: K,
    value: InvoiceTemplateDesign[K]
  ) => setDesign((prev) => ({ ...prev, [key]: value }));

  const uploadLogo = async (file: File) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("Sign in again");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `innovates/invoice-templates/${productKey}`);
    const up = await fetch("/api/media/upload/", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: fd,
    });
    const upData = await up.json();
    if (!up.ok || !upData.url) {
      toast.error(upData.error || "Logo upload failed");
      return;
    }
    setField("logoUrl", upData.url);
    toast.success("Logo uploaded");
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        productKey,
        activate: true,
        design: {
          ...design,
          termsAndConditions: termsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        },
      };
      const res = await fetch("/api/invoice-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      toast.success(`Saved ${data.data.name} (v${data.data.version}) — now active`);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const previewPdf = async () => {
    try {
      const blob = await renderInvoicePdf({
        design: {
          ...design,
          termsAndConditions: termsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        },
        clientName: "Sample Client",
        clientAddress: "Thimphu",
        invoiceNumber: `${design.numberPrefix}-PREVIEW`,
        lines: [
          {
            description: "Sample line item\nPeriod sample",
            quantity: 1,
            rate: 10000,
          },
        ],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productKey}-preview.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Preview failed");
    }
  };

  const regenerate = async () => {
    if (!active?.id) return;
    if (
      !confirm(
        "Stamp invoices/AMCs to regenerate PDFs with the active design? Staff must re-download/upload to replace Cloudinary files."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/invoice-templates/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate-pdfs", limit: 20 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      toast.success(
        `Updated ${data.data.invoicesUpdated} invoices, flagged ${data.data.amcFlagged} AMCs`
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Regenerate failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const gstPct = ((design.gstRate || 0) * 100).toFixed(0);
  const sampleTotal = 10000 * (1 + (design.gstRate || 0));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const d = defaultDesignForProduct(productKey);
              setDesign(d);
              setTermsText(d.termsAndConditions.join("\n"));
            }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Defaults
            </Button>
            <Button variant="outline" size="sm" onClick={previewPdf}>
              <Download className="mr-2 h-4 w-4" />
              Preview PDF
            </Button>
            <Button variant="outline" size="sm" onClick={regenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate PDFs
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save as active
            </Button>
          </div>
        }
      />

      {active ? (
        <p className="text-xs text-muted-foreground">
          Active: <Badge variant="secondary">v{active.version}</Badge> {active.name}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLogo(f);
                  }}
                />
                {design.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.logoUrl}
                    alt="Logo"
                    className="mt-2 h-12 object-contain"
                  />
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Company name</Label>
                <Input
                  value={design.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Textarea
                  value={design.companyAddress}
                  onChange={(e) => setField("companyAddress", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={design.companyPhone || ""}
                    onChange={(e) => setField("companyPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GST / TIN</Label>
                  <Input
                    value={design.gstTin || ""}
                    onChange={(e) => setField("gstTin", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Document & numbering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={design.documentTitle}
                    onChange={(e) => setField("documentTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Accent color</Label>
                  <Input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) => setField("accentColor", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number prefix</Label>
                  <Input
                    value={design.numberPrefix}
                    onChange={(e) => setField("numberPrefix", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GST rate (0–1)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={design.gstRate}
                    onChange={(e) =>
                      setField("gstRate", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Number pattern ({`{PREFIX} {YYYY} {MM} {SEQ} {SHORT}`})
                </Label>
                <Input
                  value={design.numberPattern}
                  onChange={(e) => setField("numberPattern", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Dealer / notice</Label>
                <Textarea
                  value={design.dealerNotice}
                  onChange={(e) => setField("dealerNotice", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Payment terms</Label>
                <Textarea
                  value={design.paymentTerms}
                  onChange={(e) => setField("paymentTerms", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Terms (one per line)</Label>
                <Textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Footer note</Label>
                <Input
                  value={design.footerNote || ""}
                  onChange={(e) => setField("footerNote", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live A4-ish preview */}
        <Card className="shadow-none lg:sticky lg:top-20 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="mx-auto aspect-[210/297] w-full max-w-md overflow-hidden rounded border bg-white p-6 text-[10px] text-black shadow-sm"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <div className="flex justify-between gap-4">
                <div>
                  {design.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.logoUrl}
                      alt=""
                      className="mb-2 h-8 object-contain"
                    />
                  ) : null}
                  <p
                    className="text-sm font-bold"
                    style={{ color: design.accentColor }}
                  >
                    {design.companyName}
                  </p>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {design.companyAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold">{design.documentTitle}</p>
                  <p>
                    No: {design.numberPrefix}-…
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold">Sample Client</p>
                <p className="text-muted-foreground">Thimphu</p>
              </div>
              <div className="mt-4 rounded bg-muted/50 p-2 text-[9px]">
                {design.dealerNotice}
              </div>
              <div className="mt-4 border-b pb-1 font-semibold">
                Description · Qty · Rate · Amount
              </div>
              <div className="mt-2 flex justify-between">
                <span>Sample line item</span>
                <span>10,000.00</span>
              </div>
              <div className="mt-4 space-y-1 text-right font-semibold">
                <p>GST {gstPct}%: {(10000 * (design.gstRate || 0)).toFixed(2)}</p>
                <p>Total: {sampleTotal.toFixed(2)}</p>
              </div>
              <p className="mt-4 text-[9px]">{design.paymentTerms}</p>
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[9px] text-muted-foreground">
                {termsText
                  .split("\n")
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((t) => (
                    <li key={t}>{t}</li>
                  ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
