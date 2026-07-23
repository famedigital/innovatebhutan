"use client";

import * as React from "react";
import {
  FileUp,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type ParsedClient = {
  name: string;
  phone?: string;
  contactPerson?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
};

type ImportError = {
  row: number;
  name: string;
  error: string;
};

const SAMPLE_HEADERS = [
  "Name",
  "Phone",
  "Contact Person",
  "Email",
  "WhatsApp",
  "Address",
  "City",
  "Country",
  "Notes",
] as const;

function downloadSampleCsv() {
  const rows = [
    SAMPLE_HEADERS.join(","),
    [
      "Thimphu Traders",
      "17123456",
      "Karma Dorji",
      "karma@thimphutraders.bt",
      "17123456",
      "Norzin Lam",
      "Thimphu",
      "Bhutan",
      "Walk-in lead",
    ].join(","),
    [
      "Paro Hardware",
      "17789012",
      "Pema Lhamo",
      "pema@parohardware.bt",
      "17789012",
      "Main Street",
      "Paro",
      "Bhutan",
      "Existing RanceLab prospect",
    ].join(","),
  ];

  const blob = new Blob(["\uFEFF" + rows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "client_bulk_import_sample.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Sample CSV downloaded");
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  values.push(current.trim());
  return values.map((v) => v.replace(/^"|"$/g, "").trim());
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, "").trim();
  if (!cleaned || cleaned.replace(/\D/g, "").length < 6) return null;
  return cleaned;
}

function pickField(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = row[alias];
    if (value) return value;
  }
  // Case-insensitive fallback
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const key = keys.find((k) => k.toLowerCase() === alias.toLowerCase());
    if (key && row[key]) return row[key];
  }
  return "";
}

function parseClientsCsv(text: string): ParsedClient[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const data: ParsedClient[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.every((v) => !v)) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    const name = pickField(row, [
      "Name",
      "Client",
      "Client Name",
      "Company",
      "Company Name",
      "Business Name",
    ]);
    if (!name) continue;

    data.push({
      name,
      phone: pickField(row, ["Phone", "Mobile", "Contact Number"]) || undefined,
      contactPerson:
        pickField(row, ["Contact Person", "Contact", "Person"]) || undefined,
      email: pickField(row, ["Email", "Email Address"]) || undefined,
      whatsapp: pickField(row, ["WhatsApp", "Whatsapp", "WA"]) || undefined,
      address: pickField(row, ["Address", "Street"]) || undefined,
      city: pickField(row, ["City", "Dzongkhag", "Town"]) || undefined,
      country: pickField(row, ["Country"]) || undefined,
      notes: pickField(row, ["Notes", "Note", "Remarks"]) || undefined,
    });
  }

  return data;
}

export function BulkIngestionModal({
  trigger,
  onImported,
}: {
  trigger: React.ReactNode;
  onImported?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [ingesting, setIngesting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState<ParsedClient[]>([]);
  const [lastResult, setLastResult] = React.useState<{
    success: number;
    skipped: number;
    failed: number;
    errors: ImportError[];
  } | null>(null);

  const resetState = () => {
    setFile(null);
    setParsed([]);
    setProgress(0);
    setIngesting(false);
    setLastResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetState();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    if (selected.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please download the sample and upload a CSV file (.csv)");
      e.target.value = "";
      return;
    }

    try {
      const text = await selected.text();
      const rows = parseClientsCsv(text);
      if (rows.length === 0) {
        toast.error("No valid client rows found. Check the sample format.");
        e.target.value = "";
        return;
      }
      setFile(selected);
      setParsed(rows);
      setLastResult(null);
      toast.success(`Parsed ${rows.length} client(s)`);
    } catch (err) {
      console.error("Failed to parse client CSV:", err);
      toast.error("Failed to read file");
      e.target.value = "";
    }
  };

  const startIngestion = async () => {
    if (!file || parsed.length === 0) {
      toast.error("Please select a valid sample CSV first");
      return;
    }

    setIngesting(true);
    setProgress(0);
    setLastResult(null);

    try {
      const existingRes = await fetch("/api/clients");
      const existingJson = await existingRes.json();
      const existing: Array<{ name?: string; phone?: string | null }> =
        existingJson.success ? existingJson.data || [] : [];

      const existingPhones = new Set(
        existing
          .map((c) => normalizePhone(c.phone))
          .filter((p): p is string => !!p)
      );

      let success = 0;
      let skipped = 0;
      let failed = 0;
      const errors: ImportError[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const row = parsed[i];
        const phone = normalizePhone(row.phone);

        if (phone && existingPhones.has(phone)) {
          skipped++;
        } else {
          try {
            const response = await fetch("/api/clients", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: row.name,
                phone: phone || row.phone || undefined,
                contactPerson: row.contactPerson,
                email: row.email,
                whatsapp: row.whatsapp || phone || undefined,
                address: row.address,
                city: row.city,
                country: row.country || "Bhutan",
                notes: row.notes,
              }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
              throw new Error(result.error || "Failed to create client");
            }
            success++;
            if (phone) existingPhones.add(phone);
          } catch (err: any) {
            failed++;
            errors.push({
              row: i + 2,
              name: row.name,
              error: err?.message || "Unknown error",
            });
          }
        }

        setProgress(Math.round(((i + 1) / parsed.length) * 100));
      }

      setLastResult({ success, skipped, failed, errors });

      if (success > 0) {
        toast.success(`Imported ${success} client(s)`);
        onImported?.();
      }
      if (skipped > 0) {
        toast.message(`Skipped ${skipped} duplicate phone(s)`);
      }
      if (failed > 0) {
        toast.error(`${failed} row(s) failed to import`);
      }
      if (success === 0 && skipped === 0 && failed === 0) {
        toast.error("Nothing was imported");
      }
    } catch (err) {
      console.error("Bulk client import failed:", err);
      toast.error("Bulk import failed");
    } finally {
      setIngesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-md p-0 shadow-xl rounded-xl">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Bulk Import
              </DialogTitle>
              <DialogDescription className="text-xs text-[#717171]">
                Download the sample, fill it in, then upload the CSV
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={downloadSampleCsv}
            disabled={ingesting}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Sample CSV
          </Button>

          {!ingesting ? (
            <div
              className="border-2 border-dashed border-[#E5E5E1] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#3ECF8E] transition-colors bg-[#F9F9F7]"
              onClick={() => document.getElementById("bulk-file")?.click()}
            >
              <input
                type="file"
                id="bulk-file"
                className="hidden"
                accept=".csv,text/csv"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-lg bg-[#F3F3F1] flex items-center justify-center mb-3">
                <FileUp className="w-5 h-5 text-[#717171]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {file ? file.name : "Select CSV file"}
                </p>
                <p className="text-[10px] text-[#717171]">
                  {parsed.length > 0
                    ? `${parsed.length} client row(s) ready`
                    : "Use the sample CSV format (.csv)"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-orange-600 animate-pulse">
                    Importing...
                  </p>
                  <p className="text-xl font-bold">{Math.floor(progress)}%</p>
                </div>
                <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {lastResult && !ingesting && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p>
                Imported <strong>{lastResult.success}</strong> · Skipped{" "}
                <strong>{lastResult.skipped}</strong> · Failed{" "}
                <strong>{lastResult.failed}</strong>
              </p>
              {lastResult.errors.slice(0, 3).map((err) => (
                <p key={`${err.row}-${err.name}`} className="text-red-700">
                  Row {err.row}: {err.name} — {err.error}
                </p>
              ))}
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              Required columns: <strong>Name</strong>, <strong>Phone</strong>.
              Duplicate phones are skipped.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E5E1]">
          <Button
            disabled={!file || parsed.length === 0 || ingesting}
            onClick={startIngestion}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {ingesting ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {ingesting ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
