import { serviceCatalogRepository } from "@/lib/repositories/serviceCatalogRepository";

export class ServiceCatalogService {
  private repository = serviceCatalogRepository;

  listServices() {
    return this.repository.list();
  }

  createService(data: {
    publicId: string;
    name: string;
    category: string;
    tagline?: string;
    description?: string;
    price?: string;
    currency?: string;
    imageUrl?: string;
  }) {
    return this.repository.create(data);
  }

  updateService(id: number, data: Record<string, unknown>) {
    return this.repository.update(id, data as any);
  }

  deleteService(id: number) {
    return this.repository.delete(id);
  }
}

export const serviceCatalogService = new ServiceCatalogService();
