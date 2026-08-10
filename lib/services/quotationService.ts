import { randomUUID } from "crypto";
import { quotationRepository } from "@/lib/repositories/quotationRepository";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { notificationService } from "@/lib/services/notificationService";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildInitialMoneyMeta } from "@/lib/projects/moneyMeta";
import type {
  CreateQuotationInput,
  QuotationStatus,
} from "@/lib/validations/quotation";
import type { QuotationFilters } from "@/lib/repositories/quotationRepository";

export const DEFAULT_TRAINING_PLAN = [
  { day: 1, title: "Training on Product Master", status: "pending" },
  { day: 2, title: "Training on Purchase/Sales", status: "pending" },
  { day: 3, title: "Training on Warehouse/Finance", status: "pending" },
  { day: 4, title: "Implementation", status: "pending" },
  { day: 5, title: "Project completed", status: "pending" },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class QuotationService {
  private repository = quotationRepository;

  async generateQuotationNumber(): Promise<string> {
    const yy = String(new Date().getFullYear()).slice(-2);
    const prefix = `QT-${yy}/`;
    const count = await this.repository.countByYearPrefix(prefix);
    const seq = String(count + 1).padStart(3, "0");
    return `${prefix}${seq}`;
  }

  list(filters: QuotationFilters = {}) {
    return this.repository.list(filters);
  }

  getById(id: number) {
    return this.repository.getById(id);
  }

  async create(data: CreateQuotationInput, createdBy?: string) {
    const lineItems = data.items.map((item, index) => {
      const amount = round2(item.quantity * item.unitPrice);
      return {
        productMasterId: item.productMasterId ?? null,
        name: item.name,
        brand: item.brand ?? null,
        description: item.description ?? null,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        amount: String(amount),
        sortOrder: index,
      };
    });

    const subtotal = round2(
      lineItems.reduce((sum, item) => sum + Number(item.amount), 0)
    );
    const taxAmount = 0;
    const totalAmount = round2(subtotal + taxAmount);
    const advancePercent = data.advancePercent ?? 50;
    const advanceAmount = round2(totalAmount * (advancePercent / 100));

    const quotationNumber = await this.generateQuotationNumber();
    const publicId = `qt-${randomUUID().slice(0, 8)}`;
    const businessName = data.businessName || data.customerName || "Customer";
    const depositQrPayload = `Innovates deposit ${quotationNumber} Nu.${advanceAmount} for ${businessName}`;

    return this.repository.createWithItems(
      {
        publicId,
        quotationNumber,
        category: data.category,
        clientId: data.clientId ?? null,
        customerName: data.customerName ?? null,
        businessName: data.businessName ?? null,
        phone: data.phone ?? null,
        email: data.email || null,
        address: data.address ?? null,
        address2: data.address2 ?? null,
        state: data.state ?? null,
        country: data.country ?? "Bhutan",
        quotationFor: data.quotationFor ?? null,
        validityDays: data.validityDays ?? 15,
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        totalAmount: String(totalAmount),
        advancePercent: String(advancePercent),
        advanceAmount: String(advanceAmount),
        status: "draft",
        depositQrPayload,
        notes: data.notes ?? null,
        createdBy: createdBy ?? null,
      },
      lineItems
    );
  }

  async updateStatus(id: number, status: QuotationStatus) {
    const existing = await this.repository.getById(id);
    if (!existing) return null;
    return this.repository.updateStatus(id, status);
  }

  async markAdvancePaid(id: number, proofUrl?: string | null) {
    const existing = await this.repository.getById(id);
    if (!existing) return null;

    await this.repository.markAdvancePaid(id, {
      depositProofUrl: proofUrl ?? null,
      advancePaidAt: new Date(),
    });

    try {
      const admins = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.role, "ADMIN"));

      for (const admin of admins) {
        await notificationService.createNotification({
          profileId: admin.id,
          title: "Advance deposited",
          message: `Advance deposited for ${existing.quotationNumber} (${existing.businessName || existing.customerName || "customer"}) — Nu. ${existing.advanceAmount}`,
          type: "success",
          category: "advance_deposited",
          entityType: "quotation",
          entityId: existing.id,
          link: `/admin/quotations?id=${existing.id}`,
        });
      }
    } catch (err) {
      console.error("[QuotationService.markAdvancePaid] notification failed:", err);
    }

    // Return full quotation (with items) for UI selection panel
    return this.repository.getById(id);
  }

  async convertToProject(id: number, createdBy?: string) {
    const quotation = await this.repository.getById(id);
    if (!quotation) return null;
    if (quotation.projectId) {
      const existing = await projectRepository.getProjectById(quotation.projectId);
      return { quotation, project: existing };
    }

    let clientId = quotation.clientId;
    if (!clientId) {
      const name =
        quotation.businessName ||
        quotation.customerName ||
        `Client from ${quotation.quotationNumber}`;
      const client = await clientRepository.create({
        name,
        businessName: quotation.businessName ?? name,
        phone: quotation.phone ?? undefined,
        email: quotation.email ?? undefined,
        address: quotation.address ?? undefined,
        address2: quotation.address2 ?? undefined,
        state: quotation.state ?? undefined,
        country: quotation.country ?? "Bhutan",
        contactPerson: quotation.customerName ?? undefined,
        active: true,
        isActive: true,
      });
      clientId = client.id;
    }

    const quotedAmount = Number(quotation.totalAmount || 0);
    const advancePercent = Number(quotation.advancePercent || 50);
    const moneyMeta = buildInitialMoneyMeta({
      quotedAmount,
      advancePercent,
    });

    if (quotation.status === "advance_paid" && quotation.advancePaidAt) {
      moneyMeta.advance = {
        amount: Number(quotation.advanceAmount || 0),
        paidAt: quotation.advancePaidAt.toISOString(),
        method: "other",
        proofUrl: quotation.depositProofUrl || null,
        recordedBy: createdBy || null,
      };
    }

    const projectName =
      quotation.quotationFor ||
      quotation.businessName ||
      quotation.customerName ||
      quotation.quotationNumber;

    const trainingPlan =
      quotation.category === "software" ? DEFAULT_TRAINING_PLAN : [];

    const status =
      quotation.status === "advance_paid" ? "advance_paid" : "quoted";

    const project = await projectRepository.createProject({
      publicId: `proj-${randomUUID().slice(0, 8)}`,
      clientId,
      name: projectName,
      description: quotation.notes ?? undefined,
      status,
      budget: String(quotedAmount),
      moneyMeta,
      categoryType: quotation.category,
      quotationId: quotation.id,
      productMasterStatus: "pending",
      trainingPlan,
      progress: 0,
    });

    const updatedQuotation = await this.repository.update(id, {
      status: "converted",
      projectId: project.id,
      clientId,
    });

    return { quotation: updatedQuotation, project };
  }
}

export const quotationService = new QuotationService();
