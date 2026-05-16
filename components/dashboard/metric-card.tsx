"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  color = "text-[#3ECF8E]",
  trend,
  trendUp,
  subtitle,
  loading = false,
  onClick
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer",
        "backdrop-blur-xl bg-white/5 border-white/10",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className={cn("w-4 h-4", color)} />
          </div>
        </div>

        {loading ? (
          <div className="h-8 w-20 bg-white/5 rounded animate-pulse mt-2" />
        ) : (
          <p className="text-2xl font-bold mt-2 text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}

        {(trend || subtitle) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trendUp ? "text-green-400" : "text-red-400"
                )}
              >
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-500">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
