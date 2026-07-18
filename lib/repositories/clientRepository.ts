import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export class ClientRepository {
  async listClients() {
    return await db
      .select({
        id: clients.id,
        name: clients.name,
        active: clients.active,
        contactPerson: clients.contactPerson,
        email: clients.email,
        phone: clients.phone,
        whatsapp: clients.whatsapp,
        whatsappGroupId: clients.whatsappGroupId,
        whatsappGroupLink: clients.whatsappGroupLink,
        logoUrl: clients.logoUrl,
        address: clients.address,
        city: clients.city,
        country: clients.country,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .orderBy(clients.name);
  }

  async getById(id: number) {
    const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return row || null;
  }

  async create(data: NewClient) {
    const [row] = await db.insert(clients).values(data).returning();
    return row;
  }

  async update(id: number, data: Partial<NewClient>) {
    const [row] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return row;
  }

  async delete(id: number) {
    await db.delete(clients).where(eq(clients.id, id));
  }
}

export const clientRepository = new ClientRepository();
