"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CreditCard, CheckCircle2, XCircle, RefreshCw, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";

function MetricCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#717171] uppercase tracking-wider">{title}</span>
          <div className="w-6 h-6 rounded bg-[#F3F3F1] flex items-center justify-center">
            <Icon className={`w-3 h-3 ${color}`} />
          </div>
        </div>
        <p className="text-lg font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export function HRDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      setEmployees(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Stats */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard title="Total" value={employees.length} icon={Users} color="text-[#3ECF8E]" />
        <MetricCard title="Active" value={employees.filter(e => e.status === 'active').length} icon={CheckCircle2} color="text-green-600" />
        <MetricCard title="Payroll" value="OK" icon={CreditCard} color="text-[#3ECF8E]" />
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchEmployees}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">Name</TableHead>
                <TableHead className="text-xs text-[#717171]">Designation</TableHead>
                <TableHead className="text-xs text-[#717171]">Department</TableHead>
                <TableHead className="text-xs text-[#717171]">Phone</TableHead>
                <TableHead className="text-xs text-[#717171]">Status</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? employees.map((emp) => (
                <TableRow key={emp.id} className="border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <TableCell className="text-sm font-medium">{emp.name}</TableCell>
                  <TableCell className="text-sm">{emp.designation || '-'}</TableCell>
                  <TableCell className="text-sm text-[#717171]">{emp.department || '-'}</TableCell>
                  <TableCell className="text-sm">{emp.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`${
                      emp.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                      emp.status === 'inactive' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    } text-[10px] px-2`}>
                      {emp.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#717171]">
                    {loading ? 'Loading...' : 'No employees yet. Add your first team member.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}