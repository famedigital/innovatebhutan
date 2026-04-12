"use client";

import * as React from "react";
import { UserPlus, ShieldCheck, Briefcase, Phone, Coins, RefreshCw, Save, Upload, X, Calendar, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function OperatorOnboardingModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [employee, setEmployee] = React.useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    baseSalary: '',
    cid: '',
    joinDate: '',
    status: 'active',
    photoUrl: '',
    appointmentOrder: '',
    appointmentLetter: '',
    cv: ''
  });

  const supabase = createClient();

  const handleAddEmployee = async () => {
    if (!employee.name || !employee.designation || !employee.phone) {
      toast.error("Name, designation and phone are required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('employees').insert({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        department: employee.department,
        base_salary: parseFloat(employee.baseSalary || "0"),
        national_id_masked: employee.cid,
        join_date: employee.joinDate || new Date().toISOString(),
        status: employee.status,
        photo_url: employee.photoUrl,
      });

      if (error) throw error;

      toast.success("Employee added successfully");
      setOpen(false);
      setEmployee({
        name: '', email: '', phone: '', designation: '', department: '',
        baseSalary: '', cid: '', joinDate: '', status: 'active',
        photoUrl: '', appointmentOrder: '', appointmentLetter: '', cv: ''
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-xl rounded-xl">
        <DialogHeader className="p-4 pb-2 border-b border-[#E5E5E1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3ECF8E]/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Add New Employee</DialogTitle>
              <p className="text-xs text-[#717171]">Enroll complete employee profile</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Full Name *</label>
              <Input 
                placeholder="Enter full name"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.name}
                onChange={(e) => setEmployee({...employee, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Email</label>
              <Input 
                type="email"
                placeholder="email@company.bt"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.email}
                onChange={(e) => setEmployee({...employee, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Phone *</label>
              <Input 
                placeholder="+975xxxxxxxx"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.phone}
                onChange={(e) => setEmployee({...employee, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Bhutan CID</label>
              <Input 
                placeholder="XXXXXXXXXX"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.cid}
                onChange={(e) => setEmployee({...employee, cid: e.target.value})}
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Designation *</label>
              <Input 
                placeholder="e.g., Systems Engineer"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.designation}
                onChange={(e) => setEmployee({...employee, designation: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Department</label>
              <Select value={employee.department} onValueChange={(v) => setEmployee({...employee, department: v})}>
                <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Base Salary (Nu.)</label>
              <Input 
                type="number"
                placeholder="0.00"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.baseSalary}
                onChange={(e) => setEmployee({...employee, baseSalary: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Join Date</label>
              <Input 
                type="date"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={employee.joinDate}
                onChange={(e) => setEmployee({...employee, joinDate: e.target.value})}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="border-t border-[#E5E5E1] pt-4 mt-4">
            <h4 className="text-sm font-medium mb-3">Documents & Files</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Appointment Order No.</label>
                <Input 
                  placeholder="AO-2026-001"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={employee.appointmentOrder}
                  onChange={(e) => setEmployee({...employee, appointmentOrder: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Appointment Letter</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">CV/Resume</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Photo</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file"
                    accept="image/*"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700">
              GIS and PF contributions will be calculated from join date.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E5E1]">
          <Button variant="outline" className="border-[#E5E5E1]" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleAddEmployee} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}