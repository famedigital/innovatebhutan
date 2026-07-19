import { invoiceTemplateRepository } from "@/lib/repositories/invoiceTemplateRepository";
import type { CreateInvoiceTemplateInput } from "@/lib/validations/invoiceTemplate";
import {
  defaultDesignForProduct,
  formatInvoiceNumber,
  type InvoiceTemplateDesign,
  type ProductKey,
} from "@/lib/invoices/templateDefaults";

export class InvoiceTemplateService {
  private repo = invoiceTemplateRepository;

  async list(productKey: ProductKey) {
    return this.repo.listByProduct(productKey);
  }

  async getActiveOrSeed(productKey: ProductKey, createdBy?: string) {
    const active = await this.repo.getActive(productKey);
    if (active) return active;
    return this.createVersion({
      productKey,
      design: defaultDesignForProduct(productKey),
      name: `${productKey} default`,
      activate: true,
      createdBy,
    });
  }

  async createVersion(params: CreateInvoiceTemplateInput & { createdBy?: string }) {
    const version = await this.repo.nextVersion(params.productKey);
    const design = {
      ...params.design,
      logoUrl: params.design.logoUrl || null,
    };
    if (params.activate) {
      await this.repo.deactivateAll(params.productKey);
    }
    return this.repo.create({
      productKey: params.productKey,
      name: params.name || `${params.productKey} v${version}`,
      version,
      isActive: params.activate !== false,
      design,
      createdBy: params.createdBy || null,
    });
  }

  async activate(id: number) {
    const tpl = await this.repo.getById(id);
    if (!tpl) throw new Error("Template not found");
    return this.repo.setActive(id, tpl.productKey as ProductKey);
  }

  getDesign(tpl: { design: unknown }): InvoiceTemplateDesign {
    return tpl.design as InvoiceTemplateDesign;
  }

  async nextInvoiceNumber(productKey: ProductKey, seqHint?: number) {
    const active = await this.getActiveOrSeed(productKey);
    const design = this.getDesign(active);
    const seq = seqHint ?? active.version * 1000 + Date.now() % 1000;
    const number = formatInvoiceNumber({
      pattern: design.numberPattern,
      prefix: design.numberPrefix,
      seq,
    });
    return { invoiceNumber: number, template: active, design };
  }
}

export const invoiceTemplateService = new InvoiceTemplateService();
