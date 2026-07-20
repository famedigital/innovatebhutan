/**
 * Field work-order PDF — no prices (ERP bible Wave B).
 * Browser-only jsPDF.
 */

export type WorkOrderPdfInput = {
  projectName: string;
  projectId: number;
  clientName?: string;
  clientPhone?: string;
  productKey?: string;
  status?: string;
  description?: string;
  address?: string;
  tasks?: Array<{ title: string; status?: string }>;
};

export async function renderWorkOrderPdf(input: WorkOrderPdfInput): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in the browser");
  }

  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 95, 78);
  doc.text("Innovate Bhutan", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 18;
  doc.setFontSize(18);
  doc.text("Work Order", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines: string[] = [
    `Job: ${input.projectName}`,
    `Job ID: ${input.projectId}`,
    input.productKey ? `Product: ${input.productKey}` : "",
    input.status ? `Status: ${input.status.replace(/_/g, " ")}` : "",
    input.clientName ? `Client: ${input.clientName}` : "",
    input.clientPhone ? `Phone: ${input.clientPhone}` : "",
    input.address ? `Site: ${input.address}` : "",
  ].filter(Boolean);

  for (const line of lines) {
    doc.text(line, margin, y);
    y += 14;
  }

  if (input.description) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Scope / notes", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(input.description, 500);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 12 + 8;
  }

  if (input.tasks && input.tasks.length > 0) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Tasks", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    for (const t of input.tasks.slice(0, 20)) {
      const row = `• ${t.title}${t.status ? ` [${t.status}]` : ""}`;
      const wrapped = doc.splitTextToSize(row, 500);
      if (y > 750) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrapped, margin, y);
      y += wrapped.length * 12;
    }
  }

  y = Math.max(y + 24, 720);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Internal work order — no pricing. Sign: ________________  Date: ________",
    margin,
    y
  );

  return doc.output("blob");
}
