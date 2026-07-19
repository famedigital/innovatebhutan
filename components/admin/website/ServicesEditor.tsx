"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreVertical,
  Loader2,
  X,
  ImageIcon,
  Upload,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Common Lucide icons for services
const ICON_OPTIONS = [
  { value: "Code", label: "Code" },
  { value: "Database", label: "Database" },
  { value: "Cloud", label: "Cloud" },
  { value: "Shield", label: "Shield" },
  { value: "Smartphone", label: "Smartphone" },
  { value: "Globe", label: "Globe" },
  { value: "Server", label: "Server" },
  { value: "Zap", label: "Zap" },
  { value: "Cpu", label: "CPU" },
  { value: "HardDrive", label: "Hard Drive" },
  { value: "Wifi", label: "WiFi" },
  { value: "Settings", label: "Settings" },
  { value: "Layers", label: "Layers" },
  { value: "Box", label: "Box" },
  { value: "Package", label: "Package" },
  { value: "ShoppingCart", label: "Shopping Cart" },
  { value: "BarChart", label: "Bar Chart" },
  { value: "LineChart", label: "Line Chart" },
  { value: "PieChart", label: "Pie Chart" },
  { value: "TrendingUp", label: "Trending Up" },
  { value: "Users", label: "Users" },
  { value: "UserCheck", label: "User Check" },
  { value: "Lock", label: "Lock" },
  { value: "Key", label: "Key" },
  { value: "FileText", label: "File Text" },
  { value: "ClipboardList", label: "Clipboard List" },
  { value: "Calendar", label: "Calendar" },
  { value: "Clock", label: "Clock" },
  { value: "MessageSquare", label: "Message Square" },
  { value: "Mail", label: "Mail" },
];

// Common gradient presets
const GRADIENT_PRESETS = [
  { from: "#3ECF8E", to: "#2FB86B", label: "Green" },
  { from: "#3B82F6", to: "#2563EB", label: "Blue" },
  { from: "#8B5CF6", to: "#7C3AED", label: "Purple" },
  { from: "#EC4899", to: "#DB2777", label: "Pink" },
  { from: "#F59E0B", to: "#D97706", label: "Orange" },
  { from: "#EF4444", to: "#DC2626", label: "Red" },
  { from: "#14B8A6", to: "#0D9488", label: "Teal" },
  { from: "#6366F1", to: "#4F46E5", label: "Indigo" },
];

type Service = {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  iconName?: string;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  features?: string[];
  pricingDetails?: any;
  galleryImages?: any;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ServiceFormData = Omit<Service, "id" | "createdAt" | "updatedAt">;

const defaultFormData: ServiceFormData = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  iconName: "Code",
  iconColor: "#3ECF8E",
  gradientFrom: "#3ECF8E",
  gradientTo: "#2FB86B",
  features: [],
  pricingDetails: null,
  galleryImages: null,
  videoUrl: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
  isFeatured: false,
  displayOrder: 0,
  category: "",
};

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="border-[#E5E5E1]">
          <TableCell>
            <div className="h-5 w-32 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-24 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-16 bg-[#F3F3F1] animate-pulse rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-16 bg-[#F3F3F1] animate-pulse rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-12 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <div className="h-8 w-8 bg-[#F3F3F1] animate-pulse rounded" />
              <div className="h-8 w-8 bg-[#F3F3F1] animate-pulse rounded" />
              <div className="h-8 w-8 bg-[#F3F3F1] animate-pulse rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ServicesEditor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/website/services?all=true");

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content type to ensure we're getting JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Expected JSON response, got HTML");
      }

      const result = await response.json();

      if (result.success) {
        setServices(result.data || []);
      } else {
        toast.error(result.error || "Failed to fetch services");
      }
    } catch (err) {
      console.error("[ServicesEditor] Fetch error:", err);
      toast.error(`Failed to fetch services: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreate = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription || "",
      description: service.description || "",
      iconName: service.iconName || "Code",
      iconColor: service.iconColor || "#3ECF8E",
      gradientFrom: service.gradientFrom || "#3ECF8E",
      gradientTo: service.gradientTo || "#2FB86B",
      features: service.features || [],
      pricingDetails: service.pricingDetails,
      galleryImages: service.galleryImages,
      videoUrl: service.videoUrl || "",
      ctaText: service.ctaText || "",
      ctaLink: service.ctaLink || "",
      isActive: service.isActive,
      isFeatured: service.isFeatured,
      displayOrder: service.displayOrder,
      category: service.category || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this service? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/website/services?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Service deleted successfully");
        fetchServices();
      } else {
        toast.error(result.error || "Failed to delete service");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete service");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Generate slug from title if empty
    const slug = formData.slug.trim() ||
      formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    try {
      setSaving(true);

      const payload = {
        ...formData,
        slug,
        features: formData.features?.filter(f => f.trim()) || [],
      };

      const url = editingService
        ? "/api/website/services"
        : "/api/website/services";

      const response = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingService ? { ...payload, id: editingService.id } : payload
        ),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingService
            ? "Service updated successfully"
            : "Service created successfully"
        );
        setShowModal(false);
        fetchServices();
      } else {
        toast.error(result.error || "Failed to save service");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const response = await fetch("/api/website/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          isActive: !service.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Service ${!service.isActive ? "activated" : "deactivated"}`);
        fetchServices();
      } else {
        toast.error(result.error || "Failed to update service");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update service");
    }
  };

  const toggleFeatured = async (service: Service) => {
    try {
      const response = await fetch("/api/website/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          isFeatured: !service.isFeatured,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Service ${!service.isFeatured ? "featured" : "unfeatured"}`);
        fetchServices();
      } else {
        toast.error(result.error || "Failed to update service");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update service");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const currentGallery = formData.galleryImages || [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "services");

        const response = await fetch("/api/media/upload/", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.data?.url) {
          currentGallery.push(result.data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setFormData({ ...formData, galleryImages: currentGallery });
      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    const currentGallery = formData.galleryImages || [];
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setFormData({ ...formData, galleryImages: newGallery });
  };

  // Filter services based on search
  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
            <Input
              placeholder="Search services..."
              className="pl-9 w-64 bg-[#F3F3F1] border-[#E5E5E1] h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-[#717171]">
            {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchServices}
            variant="outline"
            className="border-[#E5E5E1]"
            size="sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">Title</TableHead>
                <TableHead className="text-xs text-[#717171]">Slug</TableHead>
                <TableHead className="text-xs text-[#717171]">Category</TableHead>
                <TableHead className="text-xs text-[#717171]">Active</TableHead>
                <TableHead className="text-xs text-[#717171]">Featured</TableHead>
                <TableHead className="text-xs text-[#717171]">Order</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="border-[#E5E5E1] hover:bg-[#F3F3F1]"
                  >
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${service.gradientFrom || "#3ECF8E"}, ${service.gradientTo || "#2FB86B"})`,
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{service.title}</div>
                          {service.shortDescription && (
                            <div className="text-xs text-[#717171] truncate max-w-[200px]">
                              {service.shortDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#717171] font-mono text-xs">
                      {service.slug}
                    </TableCell>
                    <TableCell>
                      {service.category ? (
                        <Badge variant="outline" className="text-[10px]">
                          {service.category}
                        </Badge>
                      ) : (
                        <span className="text-sm text-[#717171]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleActive(service)}
                      >
                        {service.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleFeatured(service)}
                      >
                        {service.isFeatured ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-[#717171]">
                      {service.displayOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-[#717171]">
                      {searchTerm ? "No services found matching your search" : "No services yet. Create your first service!"}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below."
                : "Fill in the details to create a new service."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    // Auto-generate slug if editing new
                    if (!editingService && !formData.slug) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                      setFormData((prev) => ({ ...prev, slug }));
                    }
                  }}
                  placeholder="Web Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="web-development"
                />
              </div>
            </div>

            {/* Category & Display Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Brief summary for cards..."
                maxLength={200}
              />
              <p className="text-xs text-[#717171]">
                {(formData.shortDescription || "").length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed service description..."
                rows={4}
              />
            </div>

            {/* Icon & Colors */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iconName">Icon</Label>
                <Select
                  value={formData.iconName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, iconName: value })
                  }
                >
                  <SelectTrigger id="iconName">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iconColor">Icon Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="iconColor"
                    type="color"
                    value={formData.iconColor}
                    onChange={(e) =>
                      setFormData({ ...formData, iconColor: e.target.value })
                    }
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    value={formData.iconColor}
                    onChange={(e) =>
                      setFormData({ ...formData, iconColor: e.target.value })
                    }
                    placeholder="#3ECF8E"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gradient Preset</Label>
                <Select
                  onValueChange={(value) => {
                    const preset = GRADIENT_PRESETS.find((p) => p.label === value);
                    if (preset) {
                      setFormData({
                        ...formData,
                        gradientFrom: preset.from,
                        gradientTo: preset.to,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_PRESETS.map((preset) => (
                      <SelectItem key={preset.label} value={preset.label}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                            }}
                          />
                          {preset.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Gradient */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradientFrom">Gradient From</Label>
                <div className="flex gap-2">
                  <Input
                    id="gradientFrom"
                    type="color"
                    value={formData.gradientFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, gradientFrom: e.target.value })
                    }
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    value={formData.gradientFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, gradientFrom: e.target.value })
                    }
                    placeholder="#3ECF8E"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradientTo">Gradient To</Label>
                <div className="flex gap-2">
                  <Input
                    id="gradientTo"
                    type="color"
                    value={formData.gradientTo}
                    onChange={(e) =>
                      setFormData({ ...formData, gradientTo: e.target.value })
                    }
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    value={formData.gradientTo}
                    onChange={(e) =>
                      setFormData({ ...formData, gradientTo: e.target.value })
                    }
                    placeholder="#2FB86B"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={(formData.features || []).join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: e.target.value.split("\n").filter((f) => f.trim()),
                  })
                }
                placeholder="Custom web applications&#10;API integration&#10;Responsive design"
                rows={4}
              />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaText">CTA Button Text</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="Get Started"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLink: e.target.value })
                  }
                  placeholder="/contact"
                />
              </div>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Service Images/Gallery</Label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center mb-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {uploadingImage ? "Uploading..." : "Upload Images"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Image Preview Grid */}
                {(formData.galleryImages || []).length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {(formData.galleryImages || []).map((imageUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={imageUrl}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {(!formData.galleryImages || formData.galleryImages.length === 0) && (
                  <div className="text-center py-8 text-zinc-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images uploaded yet</p>
                    <p className="text-xs">Upload service screenshots, photos, etc.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="border-[#E5E5E1]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingService ? (
                  "Update Service"
                ) : (
                  "Create Service"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
