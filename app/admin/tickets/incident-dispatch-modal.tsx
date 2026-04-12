"use client";

import * as React from "react";
import { 
  Zap, 
  Sparkles, 
  Search, 
  User, 
  AlertTriangle, 
  CheckCircle2,
  Phone,
  MessageSquare,
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

/**
 * 🛰️ INCIDENT DISPATCH MODAL
 * A high-fidelity, multi-step interface for launching technical missions.
 */
export function IncidentDispatchModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Form State
  const [selectedClientId, setSelectedClientId] = React.useState<string>("");
  const [priority, setPriority] = React.useState("medium");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");

  const supabase = createClient();

  React.useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    setClients(data || []);
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDispatch = async () => {
    if (!selectedClientId || !subject) {
      toast.error("Protocol Error: Missing Client or Subject");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('tickets').insert({
        clientId: parseInt(selectedClientId),
        subject,
        description,
        priority,
        status: 'open'
      });

      if (error) throw error;

      toast.success("Incident Dispatched Successfully");
      setOpen(false);
      // Reset form
      setSubject("");
      setDescription("");
      setSelectedClientId("");
    } catch (err) {
      console.error(err);
      toast.error("Dispatch Failed: Communication error");
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
                <Zap className="w-5 h-5 text-[#3ECF8E]" />
             </div>
             <div>
                <DialogTitle className="text-lg font-semibold">Create Ticket</DialogTitle>
                <DialogDescription className="text-xs text-[#717171]">Create a new support ticket</DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Select Client</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E5E1]">
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-medium text-[#717171]">Priority</label>
               <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                     <SelectItem value="low">Low</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="high">High</SelectItem>
                  </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <label className="text-xs font-medium text-[#717171]">Subject</label>
               <Input 
                 placeholder="Enter subject" 
                 className="bg-[#F3F3F1] border-[#E5E5E1]"
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
               />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Description</label>
            <Textarea 
              placeholder="Describe the issue..." 
              className="bg-[#F3F3F1] border-[#E5E5E1] min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E5E1]">
          <Button variant="outline" className="border-[#E5E5E1]" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            disabled={loading}
            onClick={handleDispatch}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Create Ticket
          </Button>
        </DialogFooter>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Pre-flight Suggestion</span>
             </div>
             <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic">
                {subject ? `AI suggests tagging this as a ${priority} priority incident for ${clients.find(c => c.id.toString() === selectedClientId)?.name || 'the node'}.` : "Awaiting subject entry for triage simulation..."}
             </p>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent h-full w-20 animate-marquee" />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t border-white/5 mt-0 bg-white/[0.02]">
           <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            className="text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white"
          >
            Cancel Protocol
          </Button>
          <Button 
            disabled={loading}
            onClick={handleDispatch}
            className="bg-primary hover:bg-[#32e612] text-black font-black uppercase tracking-widest text-[10px] h-10 px-8 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Confirm Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

