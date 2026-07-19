import { db } from "@/db";
import { invoiceTemplates } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import type { ProductKey } from "@/lib/invoices/templateDefaults";

export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type NewInvoiceTemplate = typeof invoiceTemplates.$inferInsert;

export class InvoiceTemplateRepository {
  private db = db;

  async listByProduct(productKey: ProductKey): Promise<InvoiceTemplate[]> {
    return this.db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.productKey, productKey))
      .orderBy(desc(invoiceTemplates.version));
  }

  async getById(id: number): Promise<InvoiceTemplate | null> {
    const [row] = await this.db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id))
      .limit(1);
    return row || null;
  }

  async getActive(productKey: ProductKey): Promise<InvoiceTemplate | null> {
    const [row] = await this.db
      .select()
      .from(invoiceTemplates)
      .where(
        and(
          eq(invoiceTemplates.productKey, productKey),
          eq(invoiceTemplates.isActive, true)
        )
      )
      .orderBy(desc(invoiceTemplates.version))
      .limit(1);
    return row || null;
  }

  async nextVersion(productKey: ProductKey): Promise<number> {
    const [row] = await this.db
      .select({
        maxVersion: sql<number>`COALESCE(MAX(${invoiceTemplates.version}), 0)`,
      })
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.productKey, productKey));
    return Number(row?.maxVersion || 0) + 1;
  }

  async create(data: NewInvoiceTemplate): Promise<InvoiceTemplate> {
    const [row] = await this.db.insert(invoiceTemplates).values(data).returning();
    return row;
  }

  async deactivateAll(productKey: ProductKey): Promise<void> {
    await this.db
      .update(invoiceTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(invoiceTemplates.productKey, productKey));
  }

  async setActive(id: number, productKey: ProductKey): Promise<InvoiceTemplate> {
    await this.deactivateAll(productKey);
    const [row] = await this.db
      .update(invoiceTemplates)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(invoiceTemplates.id, id))
      .returning();
    return row;
  }
}

export const invoiceTemplateRepository = new InvoiceTemplateRepository();
