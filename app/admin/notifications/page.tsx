"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  FolderKanban,
  ShieldCheck,
  FileText,
  DollarSign,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "success";
  category?: string;
  entityType?: string;
  entityId?: number;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterCategory, showUnreadOnly]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (showUnreadOnly) params.append("unreadOnly", "true");
      params.append("limit", "100");

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        if (stats) setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
      }
    } catch (err) {
      console.error("Mark read error:", err);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        if (stats) setStats({ ...stats, unread: 0 });
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error("Mark all read error:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) => {
          const deleted = prev.find((n) => n.id === id);
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          if (stats && deleted && !deleted.read) {
            setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
          }
          return prev.filter((n) => n.id !== id);
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllRead = async () => {
    if (!confirm("Delete all read notifications?")) return;

    try {
      const response = await fetch("/api/notifications?action=read", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) => prev.filter((n) => !n.read));
        toast.success("All read notifications deleted");
      }
    } catch (err) {
      console.error("Delete all read error:", err);
      toast.error("Failed to delete read notifications");
    }
  };

  const deleteAll = async () => {
    if (!confirm("Delete ALL notifications? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/notifications?action=all", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setNotifications([]);
        if (stats) setStats({ ...stats, unread: 0, total: 0 });
        toast.success("All notifications deleted");
      }
    } catch (err) {
      console.error("Delete all error:", err);
      toast.error("Failed to delete all notifications");
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconForCategory = (category?: string) => {
    switch (category) {
      case "task_assigned":
      case "mentioned":
      case "due_soon":
      case "overdue":
      case "milestone_completed":
      case "comment_added":
      case "project_updated":
        return <FolderKanban className="w-4 h-4" />;
      case "amc_expiring":
      case "amc_expired":
        return <ShieldCheck className="w-4 h-4" />;
      case "invoice_overdue":
      case "invoice_paid":
        return <FileText className="w-4 h-4" />;
      case "payroll_ready":
      case "payroll_approved":
      case "payroll_paid":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return "System";
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getFilteredNotifications = () => {
    return notifications;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Notifications</h1>
          <p className="text-sm text-[#717171]">
            {stats?.unread ? `${stats.unread} unread` : "No unread notifications"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={deleteAllRead}
            disabled={!notifications.some((n) => n.read)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-[#717171] uppercase">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-[#717171] uppercase">Unread</p>
              <p className="text-xl font-bold text-blue-600">{stats.unread}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-[#717171] uppercase">Warnings</p>
              <p className="text-xl font-bold text-orange-600">{stats.byType.warning || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-[#717171] uppercase">Critical</p>
              <p className="text-xl font-bold text-red-600">{stats.byType.critical || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#717171]" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="task_assigned">Tasks</SelectItem>
                <SelectItem value="amc_expiring">AMC</SelectItem>
                <SelectItem value="invoice_overdue">Invoices</SelectItem>
                <SelectItem value="payroll_ready">Payroll</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Showing Unread" : "Show Unread Only"}
            </Button>

            {stats?.unread ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="ml-auto"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
        </div>
      ) : (
        <div className="space-y-2">
          {getFilteredNotifications().length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-[#A3A3A3]" />
                <p className="text-[#717171]">No notifications found</p>
                <p className="text-sm text-[#A3A3A3] mt-1">
                  {showUnreadOnly
                    ? "You have no unread notifications"
                    : "Your notification center is empty"}
                </p>
              </CardContent>
            </Card>
          ) : (
            getFilteredNotifications().map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIconForType(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-[10px] h-5">
                                New
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-[10px] flex items-center gap-1"
                            >
                              {getIconForCategory(notification.category)}
                              {getCategoryLabel(notification.category)}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#717171] mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#A3A3A3] mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.link && (
                            <Link href={notification.link}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                View
                              </Button>
                            </Link>
                          )}
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Bulk Delete Footer */}
      {notifications.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 flex items-center justify-between">
            <p className="text-sm text-red-700">
              {notifications.length} notification{notifications.length > 1 ? "s" : ""}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteAll}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Notifications
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
