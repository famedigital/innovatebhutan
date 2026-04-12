"use client";

import * as React from "react";
import { 
  Plus, 
  Building2, 
  Save, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

/**
 * 🏢 NODE ENROLLMENT MODAL
 * High-fidelity interface for onboarding new Enterprise Partners into the Matrix.
 */
export function NodeEnrollmentModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  // Form State
  const [name, setName] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [whatsappGroupLink, setWhatsappGroupLink] = React.useState("");

  const supabase = createClient();

  const handleEnroll = async () => {
    if (!name) {
      toast.error("Protocol Error: Identity Node Required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('clients').insert({
        name,
        contact_person: contactPerson,
        whatsapp,
        whatsapp_group_link: whatsappGroupLink,
        active: true
      });

      if (error) throw error;

      toast.success("Enterprise Node Enrolled Successfully");
      setOpen(false);
      // Reset form
      setName("");
      setContactPerson("");
      setWhatsapp("");
      setWhatsappGroupLink("");
    } catch (err) {
      console.error(err);
      toast.error("Enrollment Failed: Signal conflict");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-lg p-0 shadow-xl rounded-xl">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-[#3ECF8E]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#3ECF8E]" />
             </div>
             <div>
                <DialogTitle className="text-lg font-semibold">Add New Client</DialogTitle>
                <DialogDescription className="text-xs text-[#717171]">Register new enterprise client</DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Enterprise Name *</label>
            <Input 
              placeholder="e.g., Druk Trading Enterprise" 
              className="bg-[#F3F3F1] border-[#E5E5E1]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-medium text-[#717171]">Contact Person</label>
               <Input 
                 placeholder="Contact Name" 
                 className="bg-[#F3F3F1] border-[#E5E5E1]"
                 value={contactPerson}
                 onChange={(e) => setContactPerson(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-medium text-[#717171]">Phone</label>
               <Input 
                 placeholder="+975xxxxxxxx" 
                 className="bg-[#F3F3F1] border-[#E5E5E1]"
                 value={whatsapp}
                 onChange={(e) => setWhatsapp(e.target.value)}
               />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">WhatsApp Group Link</label>
            <Input 
              placeholder="https://chat.whatsapp.com/..." 
              className="bg-[#F3F3F1] border-[#E5E5E1]"
              value={whatsappGroupLink}
              onChange={(e) => setWhatsappGroupLink(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
             <ShieldCheck className="w-4 h-4 text-green-600" />
             <p className="text-xs text-green-700">
               Client will be added to database.
             </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E5E1]">
          <Button 
            disabled={loading}
            onClick={handleEnroll}
            className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-white font-medium"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Add Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

