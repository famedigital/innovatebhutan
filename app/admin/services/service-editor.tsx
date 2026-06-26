"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  LayoutGrid,
  X,
  Save
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function ServiceEditor() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    tagline: "",
    description: "",
    price: "",
    currency: "BTN",
    image_url: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error("Service Fetch Error:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "",
      tagline: "",
      description: "",
      price: "",
      currency: "BTN",
      image_url: "",
    });
    setShowModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      category: service.category || "",
      tagline: service.tagline || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      currency: service.currency || "BTN",
      image_url: service.image_url || "",
    });
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Generate public_id from name
      const publicId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            name: formData.name,
            category: formData.category,
            tagline: formData.tagline,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            currency: formData.currency,
            image_url: formData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert({
            public_id: publicId,
            name: formData.name,
            category: formData.category,
            tagline: formData.tagline,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            currency: formData.currency,
            image_url: formData.image_url,
          });

        if (error) throw error;
        toast.success("Service created successfully");
      }

      setShowModal(false);
      fetchServices();
    } catch (err) {
      console.error("Service Save Error:", err);
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (err) {
      console.error("Service Delete Error:", err);
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={fetchServices} className="border-[#E5E5E1] text-sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button onClick={handleAddService} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full h-48 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#3ECF8E] animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-[#E5E5E1] rounded-xl">
            <p className="text-sm text-[#717171]">No services found</p>
            <p className="text-xs text-[#717171] mt-1">Add your first service to get started</p>
          </div>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-[#F3F3F1] text-[#1A1A1A] border-[#E5E5E1] text-xs">
                    {service.category || 'Service'}
                  </Badge>
                </div>
                <h3 className="font-medium text-[#1A1A1A] mb-1">{service.name}</h3>
                <p className="text-xs text-[#717171] line-clamp-2">{service.description || 'No description'}</p>
                <div className="mt-3 pt-3 border-t border-[#E5E5E1] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Nu. {service.price || 0}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleEditService(service)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-red-500" onClick={() => handleDeleteService(service.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveService} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Service Name *</label>
                <Input
                  required
                  placeholder="e.g., Web Development"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Category</label>
                <Input
                  placeholder="e.g., Development"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Tagline</label>
                <Input
                  placeholder="Short tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Description</label>
                <Textarea
                  placeholder="Service description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1] min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#717171]">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#717171]">Currency</label>
                  <Input
                    placeholder="BTN"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Image URL</label>
                <Input
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b]">
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}