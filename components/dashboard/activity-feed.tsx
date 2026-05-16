"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DollarSign,
  Briefcase,
  Users,
  Ticket,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "payment" | "project" | "client" | "ticket" | "invoice" | "payroll";
  title: string;
  description: string;
  amount?: number;
  status?: string;
  createdAt: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const activityIcons = {
  payment: DollarSign,
  project: Briefcase,
  client: Users,
  ticket: Ticket,
  invoice: FileText,
  payroll: CheckCircle2,
};

const activityColors = {
  payment: "bg-green-500/20 text-green-400",
  project: "bg-blue-500/20 text-blue-400",
  client: "bg-purple-500/20 text-purple-400",
  ticket: "bg-orange-500/20 text-orange-400",
  invoice: "bg-yellow-500/20 text-yellow-400",
  payroll: "bg-emerald-500/20 text-emerald-400",
};

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {activity.amount && (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500/30 text-green-400"
                        >
                          Nu.{activity.amount.toLocaleString()}
                        </Badge>
                      )}
                      {activity.status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            activity.status === "completed" && "border-green-500/30 text-green-400",
                            activity.status === "pending" && "border-yellow-500/30 text-yellow-400",
                            activity.status === "overdue" && "border-red-500/30 text-red-400"
                          )}
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
