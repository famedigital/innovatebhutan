import { clientRepository } from "@/lib/repositories/clientRepository";

export class ClientService {
  private repository = clientRepository;

  listClients() {
    return this.repository.listClients();
  }

  getClient(id: number) {
    return this.repository.getById(id);
  }

  createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    country?: string;
    contactPerson?: string;
    notes?: string;
    active?: boolean;
  }) {
    return this.repository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      address: data.address,
      city: data.city,
      country: data.country || "Bhutan",
      contactPerson: data.contactPerson,
      notes: data.notes,
      active: data.active ?? true,
    });
  }

  updateClient(id: number, data: Record<string, unknown>) {
    return this.repository.update(id, data as any);
  }

  /** Soft-archive client (no hard delete — FK + product rules). */
  deleteClient(id: number) {
    return this.repository.delete(id);
  }
}

export const clientService = new ClientService();
