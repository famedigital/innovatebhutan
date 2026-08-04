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
    whatsappGroupLink?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    contactPerson?: string;
    businessName?: string;
    businessType?: string;
    notes?: string;
    active?: boolean;
  }) {
    return this.repository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      whatsappGroupLink: data.whatsappGroupLink,
      address: data.address,
      address2: data.address2,
      city: data.city,
      state: data.state,
      country: data.country || "Bhutan",
      contactPerson: data.contactPerson,
      businessName: data.businessName,
      businessType: data.businessType,
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
