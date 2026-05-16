"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Nu.${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [`Nu.${value.toLocaleString()}`, ""]}
            />
            <Legend
              wrapperStyle={{ color: "#9ca3af" }}
              iconType="circle"
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="url(#gradientRevenue)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="url(#gradientExpenses)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ECF8E" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3ECF8E" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
