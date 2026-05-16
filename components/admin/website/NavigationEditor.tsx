"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Grid3X3,
  Headphones,
  Users,
  Settings,
  FileText,
  Phone,
  Mail,
  MapPin,
  Info,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Helper function for safe API calls
async function safeFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) throw new Error("Expected JSON response");
  return response.json();
}

// Available Lucide icons for navigation
const ICON_OPTIONS = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Grid3X3", label: "Grid/Dashboard", icon: Grid3X3 },
  { value: "Headphones", label: "Support", icon: Headphones },
  { value: "Users", label: "Users/Team", icon: Users },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "FileText", label: "Documents", icon: FileText },
  { value: "Phone", label: "Phone", icon: Phone },
  { value: "Mail", label: "Email", icon: Mail },
  { value: "MapPin", label: "Location", icon: MapPin },
  { value: "Info", label: "Info/About", icon: Info },
  { value: "ChevronRight", label: "Arrow", icon: ChevronRight },
  { value: "ExternalLink", label: "External Link", icon: ExternalLink },
];

// Badge color options
const BADGE_COLORS = [
  { value: "default", label: "Default", class: "bg-primary text-primary-foreground" },
  { value: "secondary", label: "Secondary", class: "bg-secondary text-secondary-foreground" },
  { value: "destructive", label: "Red", class: "bg-destructive text-white" },
  { value: "outline", label: "Outline", class: "border border-border" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-700 border border-green-200" },
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-700 border border-blue-200" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-700 border border-purple-200" },
];

export interface NavLink {
  id: number;
  label: string;
  url: string;
  parentId: number | null;
  iconName: string | null;
  iconColor: string | null;
  badge: string | null;
  badgeColor: string | null;
  openInNewTab: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NavigationEditorProps {
  onSuccess?: () => void;
}

export function NavigationEditor({ onSuccess }: NavigationEditorProps) {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    url: "",
    parentId: "",
    iconName: "",
    iconColor: "#3ECF8E",
    badge: "",
    badgeColor: "default",
    openInNewTab: false,
    displayOrder: 0,
    isActive: true,
  });

  // Fetch navigation links
  const fetchLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await safeFetch("/api/website/navigation");

      if (result.success) {
        setLinks(result.data || []);
      } else {
        setError(result.error || "Failed to fetch navigation links");
        toast.error(result.error || "Failed to load navigation");
      }
    } catch (err) {
      console.error("[NavigationEditor] Fetch error:", err);
      setError("Network error: Could not load navigation");
      toast.error("Network error: Could not load navigation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      label: "",
      url: "",
      parentId: "",
      iconName: "",
      iconColor: "#3ECF8E",
      badge: "",
      badgeColor: "default",
      openInNewTab: false,
      displayOrder: 0,
      isActive: true,
    });
    setEditingLink(null);
  };

  // Open create modal
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (link: NavLink) => {
    setEditingLink(link);
    setFormData({
      label: link.label,
      url: link.url,
      parentId: link.parentId?.toString() || "",
      iconName: link.iconName || "",
      iconColor: link.iconColor || "#3ECF8E",
      badge: link.badge || "",
      badgeColor: link.badgeColor || "default",
      openInNewTab: link.openInNewTab,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
    });
    setShowModal(true);
  };

  // Delete link
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this navigation item? Child items will also be deleted.")) {
      return;
    }

    setSaving(true);
    try {
      const result = await safeFetch("/api/website/navigation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (result.success) {
        toast.success("Navigation item deleted successfully");
        await fetchLinks();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to delete navigation item");
      }
    } catch (err) {
      console.error("[NavigationEditor] Delete error:", err);
      toast.error("Network error: Could not delete navigation item");
    } finally {
      setSaving(false);
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim() || !formData.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: formData.label.trim(),
        url: formData.url.trim(),
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        iconName: formData.iconName || null,
        iconColor: formData.iconColor || null,
        badge: formData.badge.trim() || null,
        badgeColor: formData.badgeColor || null,
        openInNewTab: formData.openInNewTab,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      const method = editingLink ? "PUT" : "POST";
      const body = editingLink ? { id: editingLink.id, ...payload } : payload;

      const result = await safeFetch("/api/website/navigation", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (result.success) {
        toast.success(editingLink ? "Navigation item updated successfully" : "Navigation item created successfully");
        setShowModal(false);
        resetForm();
        await fetchLinks();
        onSuccess?.();
      } else {
        toast.error(result.error || `Failed to ${editingLink ? "update" : "create"} navigation item`);
      }
    } catch (err) {
      console.error("[NavigationEditor] Submit error:", err);
      toast.error(`Network error: Could not ${editingLink ? "update" : "create"} navigation item`);
    } finally {
      setSaving(false);
    }
  };

  // Build tree structure for display
  const buildTree = (items: NavLink[], parentId: number | null = null, depth = 0): NavLink[] => {
    const result: NavLink[] = [];
    for (const item of items) {
      if (item.parentId === parentId) {
        result.push({ ...item, _depth: depth } as NavLink & { _depth?: number });
        result.push(...buildTree(items, item.id, depth + 1));
      }
    }
    return result.sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const treeLinks = buildTree(links);

  // Get parent options (exclude current link and its descendants when editing)
  const getParentOptions = () => {
    if (editingLink) {
      // Filter out the current link and its descendants
      const excludeIds = new Set([editingLink.id]);
      const findDescendants = (parentId: number) => {
        links
          .filter((l) => l.parentId === parentId)
          .forEach((child) => {
            excludeIds.add(child.id);
            findDescendants(child.id);
          });
      };
      findDescendants(editingLink.id);

      return links.filter((l) => !excludeIds.has(l.id));
    }
    return links;
  };

  // Render icon component
  const renderIcon = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
    if (!iconOption) return null;
    const Icon = iconOption.icon;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#3ECF8E]" />
        <span className="ml-2 text-sm text-[#717171]">Loading navigation...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load navigation</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchLinks}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Navigation Links</h3>
          <p className="text-sm text-[#717171]">Manage your website menu structure</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>

      {/* Navigation Table */}
      <div className="border border-[#E5E5E1] rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#F3F3F1]">
            <TableRow>
              <TableHead className="w-[300px]">Label</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treeLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#717171]">
                  No navigation items yet. Create your first link.
                </TableCell>
              </TableRow>
            ) : (
              treeLinks.map((link) => {
                const depth = (link as any)._depth || 0;
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
                        {link.iconName && (
                          <span className="text-[#3ECF8E]">{renderIcon(link.iconName)}</span>
                        )}
                        <span className="font-medium">{link.label}</span>
                        {link.openInNewTab && (
                          <ExternalLink className="w-3 h-3 text-[#717171]" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#717171] font-mono">{link.url}</span>
                    </TableCell>
                    <TableCell>
                      {link.badge ? (
                        <Badge
                          variant="outline"
                          className={
                            BADGE_COLORS.find((c) => c.value === link.badgeColor)?.class ||
                            "bg-primary text-primary-foreground"
                          }
                        >
                          {link.badge}
                        </Badge>
                      ) : (
                        <span className="text-[#A3A3A3]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          link.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-[#717171]">{link.displayOrder}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleEdit(link)}
                          disabled={saving}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                          disabled={saving}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Navigation Link" : "Create Navigation Link"}</DialogTitle>
            <DialogDescription>
              {editingLink
                ? "Update the navigation link details below."
                : "Add a new item to your website navigation."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">
                Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="label"
                placeholder="e.g., Home, Services, About Us"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                placeholder="e.g., /, /services, https://example.com"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            {/* Parent & Display Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent (for nesting)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                >
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="None (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (top level)</SelectItem>
                    {getParentOptions().map((link) => (
                      <SelectItem key={link.id} value={link.id.toString()}>
                        {link.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Select
                value={formData.iconName}
                onValueChange={(v) => setFormData({ ...formData, iconName: v })}
              >
                <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Badge Text & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge Text (optional)</Label>
                <Input
                  id="badge"
                  placeholder="e.g., New, Hot, Sale"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeColor">Badge Color</Label>
                <Select
                  value={formData.badgeColor}
                  onValueChange={(v) => setFormData({ ...formData, badgeColor: v })}
                >
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full ${color.class} border border-border`}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Open in New Tab & Active Status */}
            <div className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="newTab" className="text-sm font-medium">
                  Open in new tab
                </Label>
                <p className="text-xs text-[#717171]">Opens link in a new browser tab</p>
              </div>
              <Switch
                id="newTab"
                checked={formData.openInNewTab}
                onCheckedChange={(v) => setFormData({ ...formData, openInNewTab: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-[#717171]">Show this link in navigation</p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-[#E5E5E1]"
                onClick={() => setShowModal(false)}
                disabled={saving}
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
                ) : editingLink ? (
                  "Update Link"
                ) : (
                  "Create Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
