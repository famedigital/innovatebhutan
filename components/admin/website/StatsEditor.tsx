"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  TrendingUp,
  Target,
  Award,
  Heart,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Helper function for safe API calls
async function safeFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) throw new Error("Expected JSON response");
  return response.json();
}

const ICON_OPTIONS = [
  { value: "Trophy", label: "Trophy", icon: Trophy },
  { value: "Users", label: "Users", icon: Users },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Target", label: "Target", icon: Target },
  { value: "Award", label: "Award", icon: Award },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "MapPin", label: "Map Pin", icon: MapPin },
];

interface StatItem {
  id: number;
  label: string;
  value: string;
  description: string | null;
  iconName: string | null;
  iconColor: string | null;
  colorFrom: string | null;
  colorTo: string | null;
  bgGradient: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatFormData {
  label: string;
  value: string;
  description: string;
  iconName: string;
  iconColor: string;
  colorFrom: string;
  colorTo: string;
  bgGradient: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm: StatFormData = {
  label: "",
  value: "",
  description: "",
  iconName: "Trophy",
  iconColor: "#3ECF8E",
  colorFrom: "#3ECF8E",
  colorTo: "#3ECF8E",
  bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
  displayOrder: 0,
  isActive: true,
};

export function StatsEditor() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [formData, setFormData] = useState<StatFormData>(emptyForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statToDelete, setStatToDelete] = useState<StatItem | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await safeFetch("/api/website/stats");
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingStat(null);
  };

  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (stat: StatItem) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      description: stat.description || "",
      iconName: stat.iconName || "Trophy",
      iconColor: stat.iconColor || "#3ECF8E",
      colorFrom: stat.colorFrom || "#3ECF8E",
      colorTo: stat.colorTo || "#3ECF8E",
      bgGradient: stat.bgGradient || "bg-gradient-to-br from-emerald-50 to-teal-50",
      displayOrder: stat.displayOrder,
      isActive: stat.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (stat: StatItem) => {
    setStatToDelete(stat);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!statToDelete) return;

    setSaving(true);
    try {
      const data = await safeFetch(`/api/website/stats?id=${statToDelete.id}`, {
        method: "DELETE",
      });

      if (data.success) {
        toast.success("Stat deleted successfully");
        setStats((prev) => prev.filter((s) => s.id !== statToDelete.id));
        setDeleteDialogOpen(false);
        setStatToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete stat");
      }
    } catch (error) {
      console.error("Error deleting stat:", error);
      toast.error("Failed to delete stat");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim() || !formData.value.trim()) {
      toast.error("Label and value are required");
      return;
    }

    setSaving(true);
    try {
      const url = "/api/website/stats";
      const method = editingStat ? "PUT" : "POST";
      const payload = editingStat
        ? { ...formData, id: editingStat.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingStat
            ? "Stat updated successfully"
            : "Stat created successfully"
        );
        await fetchStats();
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(data.error || "Failed to save stat");
      }
    } catch (error) {
      console.error("Error saving stat:", error);
      toast.error("Failed to save stat");
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName: string | null) => {
    const option = ICON_OPTIONS.find((opt) => opt.value === iconName);
    if (!option) return null;
    const IconComponent = option.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Statistics Content</h3>
          <p className="text-sm text-muted-foreground">
            Manage the statistics displayed on your website
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stat
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Order</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No stats found</p>
                  <Button
                    onClick={handleCreate}
                    variant="outline"
                    className="mt-2"
                  >
                    Create your first stat
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              stats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell>{stat.displayOrder}</TableCell>
                  <TableCell className="font-medium">{stat.label}</TableCell>
                  <TableCell className="text-lg font-bold text-[#3ECF8E]">
                    {stat.value}
                  </TableCell>
                  <TableCell>
                    {stat.iconName && (
                      <div
                        className="inline-flex p-2 rounded-full"
                        style={{ backgroundColor: stat.iconColor || "#3ECF8E" }}
                      >
                        {getIconComponent(stat.iconName)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {stat.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stat.isActive ? "default" : "outline"}
                      className={
                        stat.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : ""
                      }
                    >
                      {stat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(stat)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(stat)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStat ? "Edit Stat" : "Create New Stat"}
            </DialogTitle>
            <DialogDescription>
              {editingStat
                ? "Update the stat information below."
                : "Fill in the details to create a new stat."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="label"
                    className="text-sm font-medium leading-none"
                  >
                    Label <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="label"
                    placeholder="e.g., Happy Clients"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="value"
                    className="text-sm font-medium leading-none"
                  >
                    Value <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="value"
                    placeholder="e.g., 500+"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium leading-none"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this stat..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="iconName"
                    className="text-sm font-medium leading-none"
                  >
                    Icon
                  </label>
                  <select
                    id="iconName"
                    value={formData.iconName}
                    onChange={(e) =>
                      setFormData({ ...formData, iconName: e.target.value })
                    }
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:border-ring outline-none focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="displayOrder"
                    className="text-sm font-medium leading-none"
                  >
                    Display Order
                  </label>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="iconColor"
                    className="text-sm font-medium leading-none"
                  >
                    Icon Color
                  </label>
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
                      type="text"
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
                  <label
                    htmlFor="colorFrom"
                    className="text-sm font-medium leading-none"
                  >
                    Gradient From
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="colorFrom"
                      type="color"
                      value={formData.colorFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, colorFrom: e.target.value })
                      }
                      className="w-16 h-9 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.colorFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, colorFrom: e.target.value })
                      }
                      placeholder="#3ECF8E"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="colorTo"
                    className="text-sm font-medium leading-none"
                  >
                    Gradient To
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="colorTo"
                      type="color"
                      value={formData.colorTo}
                      onChange={(e) =>
                        setFormData({ ...formData, colorTo: e.target.value })
                      }
                      className="w-16 h-9 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.colorTo}
                      onChange={(e) =>
                        setFormData({ ...formData, colorTo: e.target.value })
                      }
                      placeholder="#3ECF8E"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bgGradient"
                  className="text-sm font-medium leading-none"
                >
                  Background Gradient (Tailwind classes)
                </label>
                <Input
                  id="bgGradient"
                  placeholder="e.g., bg-gradient-to-br from-emerald-50 to-teal-50"
                  value={formData.bgGradient}
                  onChange={(e) =>
                    setFormData({ ...formData, bgGradient: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Active Status</p>
                  <p className="text-xs text-muted-foreground">
                    Show this stat on the website
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              {editingStat && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Preview:{" "}
                    <span
                      className="inline-flex p-2 rounded-full ml-2"
                      style={{ backgroundColor: formData.iconColor }}
                    >
                      {getIconComponent(formData.iconName)}
                    </span>
                    <span className="font-bold text-lg ml-2">
                      {formData.value}
                    </span>{" "}
                    <span className="ml-1">{formData.label}</span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
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
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingStat ? (
                  "Update Stat"
                ) : (
                  "Create Stat"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Stat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{statToDelete?.label}&quot;?
              This action can be undone by reactivating the stat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setStatToDelete(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
