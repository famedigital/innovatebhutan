"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, FileSpreadsheet, X, Loader2, CheckCircle2, AlertCircle, RefreshCw, Wifi, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface BulkImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

interface ImportError {
  row: number;
  client: string;
  error: string;
}

interface ParsedRow {
  clientName: string;
  contractNumber?: string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  whatsappGroupLink?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  yearsWithUs?: string;
  totalPaid?: string;
}

export function BulkImportModal({ onClose, onImported }: BulkImportModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: ImportError[];
    createdClients: number;
  }>({ success: 0, failed: 0, errors: [], createdClients: 0 });
  const [importing, setImporting] = useState(false);
  const [autoCreateClients, setAutoCreateClients] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const response = await fetch("/api/clients");
      const result = await response.json();
      if (result.success) {
        setClients(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const getClientId = (clientName: string) => {
    const client = clients.find(
      c => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
    );
    return { id: client?.id, exists: !!client };
  };

  const createClient = async (clientName: string, rowData: ParsedRow) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName.trim(),
          whatsappGroupLink: rowData.whatsappGroupLink || null,
          contactPerson: rowData.contactPerson || null,
          phone: rowData.phone || null,
          email: rowData.email || null,
          // Store custom metadata
          meta: {
            yearsWithUs: rowData.yearsWithUs || null,
            totalPaid: rowData.totalPaid || null,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || "Failed to create client");
    } catch (error) {
      console.error("Failed to create client:", error);
      throw error;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel or CSV file");
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setStep("preview");

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());

      if (lines.length < 2) {
        toast.error("File appears to be empty or has no data rows");
        setStep("upload");
        return;
      }

      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes(",") ? "," : "\t";

      // Parse headers and data
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ""));
      const data: ParsedRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ""));
        if (values.length < headers.length || values.every(v => !v)) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        // Map common column names (flexible matching)
        const clientName =
          row["Client"] || row["Client Name"] || row["client"] || row["client_name"] ||
          row["Company"] || row["Company Name"] || row["company"] || "";

        const contractNumber =
          row["Contract Number"] || row["Contract"] || row["contract_number"] ||
          row["AMC Number"] || row["AMC"] || row["Contract #"] || "";

        const amount =
          row["Amount"] || row["Value"] || row["amount"] || row["contract_value"] ||
          row["Annual Amount"] || row["annual_amount"] || "";

        const startDate =
          row["Start Date"] || row["Start"] || row["start_date"] ||
          row["Contract Start"] || row["contract_start"] || "";

        const endDate =
          row["End Date"] || row["End"] || row["Expiry"] || row["end_date"] ||
          row["expiry_date"] || row["Contract End"] || row["contract_end"] || "";

        const whatsappGroupLink =
          row["WhatsApp Group"] || row["WhatsApp Link"] || row["whatsapp_group_link"] ||
          row["Group Link"] || row["Support Group"] || row["whatsapp"] || "";

        const contactPerson =
          row["Contact Person"] || row["Contact"] || row["contact_person"] ||
          row["Person"] || row["primary_contact"] || "";

        const phone =
          row["Phone"] || row["Mobile"] || row["phone"] ||
          row["Contact Number"] || row["contact_number"] || "";

        const email =
          row["Email"] || row["email"] || row["email_address"] || "";

        const yearsWithUs =
          row["Years With Us"] || row["Years"] || row["years_with_us"] ||
          row["Tenure"] || row["Client Since"] || row["customer_years"] || "";

        const totalPaid =
          row["Total Paid"] || row["Total Payments"] || row["total_paid"] ||
          row["Lifetime Value"] || row["ltv"] || row["total_revenue"] || "";

        const notes =
          row["Notes"] || row["Note"] || row["notes"] || row["remarks"] || row["comments"] || "";

        if (clientName) {
          data.push({
            clientName,
            contractNumber: contractNumber || undefined,
            amount: amount || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            whatsappGroupLink: whatsappGroupLink || undefined,
            contactPerson: contactPerson || undefined,
            phone: phone || undefined,
            email: email || undefined,
            yearsWithUs: yearsWithUs || undefined,
            totalPaid: totalPaid || undefined,
            notes: notes || undefined,
          });
        }
      }

      if (data.length === 0) {
        toast.error("No valid data rows found. Please check your file format.");
        setStep("upload");
        return;
      }

      setParsedData(data);
      toast.success(`Parsed ${data.length} contracts from file`);
    } catch (error) {
      console.error("Failed to parse file:", error);
      toast.error("Failed to parse file. Please check the format.");
      setStep("upload");
    }
  };

  const startImport = async () => {
    setStep("importing");
    setImporting(true);
    setImportResults({ success: 0, failed: 0, errors: [], createdClients: 0 });

    const batchSize = 5;
    const errors: ImportError[] = [];
    let successCount = 0;
    let failedCount = 0;
    let createdClientsCount = 0;

    for (let i = 0; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize);

      const batchPromises = batch.map(async (row, index) => {
        try {
          let clientId = getClientId(row.clientName).id;

          // Auto-create client if enabled and client doesn't exist
          if (!clientId && autoCreateClients) {
            try {
              const newClient = await createClient(row.clientName, row);
              clientId = newClient.id;
              createdClientsCount++;

              // Add to local clients list for subsequent rows
              clients.push(newClient);
            } catch (createError) {
              throw new Error("Failed to create client: " + (createError as any).message);
            }
          }

          if (!clientId) {
            throw new Error("Client not found (enable auto-create to add new clients)");
          }

          // Generate default dates if not provided
          const today = new Date();
          const nextYear = new Date(today);
          nextYear.setFullYear(nextYear.getFullYear() + 1);

          const payload: any = {
            clientId,
            contractNumber: row.contractNumber || `AMC-${Date.now()}-${i + index}`,
            startDate: row.startDate || today.toISOString().split("T")[0],
            endDate: row.endDate || nextYear.toISOString().split("T")[0],
          };

          if (row.amount) {
            payload.amount = row.amount.toString();
          }

          if (row.notes) {
            payload.notes = row.notes;
          }

          const response = await fetch("/api/amc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to create");
          }

          return { success: true, row: i + index + 1 };
        } catch (error: any) {
          return {
            success: false,
            row: i + index + 1,
            client: row.clientName,
            error: error.message || "Unknown error",
          };
        }
      });

      const results = await Promise.all(batchPromises);

      results.forEach((result: any) => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push({
            row: result.row,
            client: result.client,
            error: result.error,
          });
        }
      });

      // Update progress
      setImportResults({
        success: successCount,
        failed: failedCount,
        errors,
        createdClients: createdClientsCount
      });
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} contracts`);
    }

    if (createdClientsCount > 0) {
      toast.info(`Created ${createdClientsCount} new clients`);
    }

    if (failedCount > 0) {
      toast.warning(`${failedCount} contracts failed to import`);
    }

    setStep("complete");
  };

  const downloadTemplate = () => {
    const csvContent = [
      "Client,Contact Person,Phone,Email,WhatsApp Group,Contract Number,Amount,Start Date,End Date,Years With Us,Total Paid,Notes",
      "Example Client Inc,John Doe,+975-17-123456,john@example.com,https://chat.whatsapp.com/abc123,AMC-2026-001,50000,2026-01-01,2026-12-31,3,150000,Annual maintenance contract",
      "Another Company Ltd,Jane Smith,+975-17-789012,jane@example.com,https://chat.whatsapp.com/def456,AMC-2026-002,75000,2026-02-01,2027-01-31,5,375000,Premium support package",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amc_bulk_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Template downloaded");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Import AMC Contracts</h2>
              <p className="text-sm text-gray-500">Import clients & contracts from Excel/CSV</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions & Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ <strong>Auto-create clients:</strong> New clients will be created automatically if they don't exist</li>
                  <li>✓ <strong>WhatsApp Integration:</strong> Import WhatsApp group links for each client</li>
                  <li>✓ <strong>Contact Details:</strong> Include contact person, phone, and email</li>
                  <li>✓ <strong>Tenure Tracking:</strong> Track years with us and total payments</li>
                  <li>✓ <strong>Contract Auto-generation:</strong> Missing dates/values will be auto-generated</li>
                </ul>
              </div>

              {/* Download Template */}
              <div className="flex justify-center">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-emerald-500', 'bg-emerald-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-50');
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    if (droppedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
                      setFile(droppedFile);
                      parseFile(droppedFile);
                    } else {
                      toast.error("Please upload an Excel or CSV file");
                    }
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload your file</p>
                <p className="text-sm text-gray-500 mb-4">Drag & drop or click to browse (.xlsx, .xls, .csv)</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>

              {/* Existing Clients Count */}
              {clients.length > 0 && (
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">{clients.length} existing clients found</span>
                  </div>
                  {autoCreateClients && (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Auto-create new clients enabled</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview ({parsedData.length} contracts)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setParsedData([]);
                  }}
                  disabled={importing}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  Change File
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoCreateClients}
                    onChange={(e) => setAutoCreateClients(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-create new clients</span>
                </label>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-sm text-emerald-800">
                  <strong>Ready to import:</strong> {parsedData.length} contracts will be processed. New clients will be created automatically if enabled.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-semibold text-gray-600 border-b">#</th>
                      <th className="text-left p-2 font-semibold text-gray-600 border-b">Client</th>
                      <th className="text-left p-2 font-semibold text-gray-600 border-b">Contact</th>
                      <th className="text-left p-2 font-semibold text-gray-600 border-b">Phone</th>
                      <th className="text-left p-2 font-semibold text-gray-600 border-b">WhatsApp</th>
                      <th className="text-right p-2 font-semibold text-gray-600 border-b">Amount</th>
                      <th className="text-center p-2 font-semibold text-gray-600 border-b">Years</th>
                      <th className="text-right p-2 font-semibold text-gray-600 border-b">Total Paid</th>
                      <th className="text-center p-2 font-semibold text-gray-600 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => {
                      const clientInfo = getClientId(row.clientName);
                      const exists = clientInfo.exists;

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2 font-medium">{row.clientName}</td>
                          <td className="p-2">{row.contactPerson || "—"}</td>
                          <td className="p-2">{row.phone || "—"}</td>
                          <td className="p-2">
                            {row.whatsappGroupLink ? (
                              <a
                                href={row.whatsappGroupLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <Wifi className="w-3 h-3" />
                                Link
                              </a>
                            ) : "—"}
                          </td>
                          <td className="p-2 text-right">{row.amount ? `Nu.${Number(row.amount).toLocaleString()}` : "—"}</td>
                          <td className="p-2 text-center">{row.yearsWithUs ? `${row.yearsWithUs}y` : "—"}</td>
                          <td className="p-2 text-right">{row.totalPaid ? `Nu.${Number(row.totalPaid).toLocaleString()}` : "—"}</td>
                          <td className="p-2 text-center">
                            {exists ? (
                              <span className="text-green-600">Existing</span>
                            ) : autoCreateClients ? (
                              <span className="text-blue-600">Will Create</span>
                            ) : (
                              <span className="text-red-600">Skipped</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep("upload")}
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startImport}
                  disabled={importing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing {parsedData.length} Contracts...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import All Contracts
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">Importing contracts...</p>
              <p className="text-sm text-gray-500 mt-2">
                Success: {importResults.success} | Failed: {importResults.failed} | Clients Created: {importResults.createdClients}
              </p>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Import Complete!</h3>
                <p className="text-gray-500 mt-2">
                  {importResults.success} contracts imported • {importResults.createdClients} new clients created
                  {importResults.failed > 0 && ` • ${importResults.failed} failed`}
                </p>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Failed Imports ({importResults.errors.length})</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {importResults.errors.slice(0, 20).map((error, index) => (
                      <div key={index} className="text-xs text-red-800 font-mono">
                        Row {error.row}: {error.client} - {error.error}
                      </div>
                    ))}
                    {importResults.errors.length > 20 && (
                      <p className="text-xs text-red-600 italic">
                        ...and {importResults.errors.length - 20} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your <strong>AMC Contracts</strong> page to see all imported contracts</li>
                  <li>• Use the WhatsApp group links to connect with client support groups</li>
                  <li>• Review client tenure and payment history in the Clients page</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setParsedData([]);
                    setImportResults({ success: 0, failed: 0, errors: [], createdClients: 0 });
                  }}
                >
                  Import More
                </Button>
                <Button
                  onClick={() => {
                    onImported();
                    onClose();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
