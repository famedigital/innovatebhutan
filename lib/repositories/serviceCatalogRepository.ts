import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export class ServiceCatalogRepository {
  async list() {
    return await db
      .select({
        id: services.id,
        publicId: services.publicId,
        name: services.name,
        category: services.category,
        tagline: services.tagline,
        description: services.description,
        price: services.price,
        currency: services.currency,
        imageUrl: services.imageUrl,
      })
      .from(services)
      .orderBy(services.name);
  }

  async create(data: typeof services.$inferInsert) {
    const [row] = await db.insert(services).values(data).returning();
    return row;
  }

  async update(id: number, data: Partial<typeof services.$inferInsert>) {
    const [row] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return row;
  }

  async delete(id: number) {
    await db.delete(services).where(eq(services.id, id));
  }
}

export const serviceCatalogRepository = new ServiceCatalogRepository();
