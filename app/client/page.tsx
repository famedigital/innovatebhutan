"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MessageSquare, 
  CreditCard, 
  HelpCircle, 
  User,
  LogOut,
  FileCheck,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ClientPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [amcs, setAmcs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push("/login");
        return;
      }

      setUser(authUser);

      const { data: clientAccess } = await supabase
        .from("client_portal_access")
        .select("*, clients(*)")
        .eq("email", authUser.email)
        .single();

      if (!clientAccess) {
        toast.error("Access denied. You don't have client portal access.");
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setClientData(clientAccess.clients);

      const [invoicesRes, amcsRes, ticketsRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('client_id', clientAccess.clients.id).order('created_at', { ascending: false }),
        supabase.from('amcs').select('*').eq('client_id', clientAccess.clients.id).order('end_date', { ascending: false }),
        supabase.from('tickets').select('*').eq('client_id', clientAccess.clients.id).order('created_at', { ascending: false }).limit(5)
      ]);

      setInvoices(invoicesRes.data || []);
      setAmcs(amcsRes.data || []);
      setTickets(ticketsRes.data || []);
    } catch (err) {
      console.error("Error:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-[#3ECF8E] animate-pulse" />
          </div>
          <p className="text-[#717171]">Loading...</p>
        </div>
      </div>
    );
  }

  const activeAMC = amcs.find(a => a.status === 'active');
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const openTickets = tickets.filter(t => t.status === 'open');

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E1] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#3ECF8E] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#1A1A1A]">Client Portal</h1>
              <p className="text-xs text-[#717171]">INNOVATES BHUTAN</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center">
                <User className="w-4 h-4 text-[#3ECF8E]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{clientData?.name || 'Client'}</p>
                <p className="text-xs text-[#717171]">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[#3ECF8E]/10 to-transparent p-6 rounded-xl border border-[#3ECF8E]/20">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Welcome back, {clientData?.name}!</h2>
          <p className="text-sm text-[#717171] mt-1">Manage your invoices, contracts, and support all in one place.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-[#717171] uppercase">Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-[#717171] uppercase">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingInvoices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-[#717171] uppercase">Open Tickets</p>
              <p className="text-2xl font-bold text-blue-600">{openTickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-[#717171] uppercase">AMC Status</p>
              <Badge className={activeAMC ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                {activeAMC ? 'Active' : 'None'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Invoices</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#3ECF8E]">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.length === 0 ? (
                <p className="text-sm text-[#717171] text-center py-4">No invoices yet</p>
              ) : (
                invoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#717171]" />
                      <div>
                        <p className="text-sm font-medium">{inv.invoice_number}</p>
                        <p className="text-xs text-[#717171]">{new Date(inv.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Nu. {Number(inv.total).toLocaleString()}</p>
                      <Badge className={`text-[10px] ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* AMC Contract */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AMC Contract</CardTitle>
              {activeAMC && <Badge className="bg-green-100 text-green-700">Active</Badge>}
            </CardHeader>
            <CardContent>
              {activeAMC ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-4 h-4 text-[#3ECF8E]" />
                      <div>
                        <p className="text-sm font-medium">{activeAMC.contract_number}</p>
                        <p className="text-xs text-[#717171]">Annual Maintenance Contract</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[#717171]">Start Date</p>
                      <p className="font-medium">{new Date(activeAMC.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#717171]">End Date</p>
                      <p className="font-medium">{new Date(activeAMC.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#717171]">Value</p>
                      <p className="font-medium">Nu. {Number(activeAMC.contract_value).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#717171]">Services</p>
                      <p className="font-medium">{activeAMC.services_included?.length || 0} included</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileCheck className="w-8 h-8 mx-auto text-[#E5E5E1] mb-2" />
                  <p className="text-sm text-[#717171]">No active AMC contract</p>
                  <Button className="mt-3 bg-[#3ECF8E] text-black" onClick={() => window.location.href = 'mailto:sales@innovates.bt'}>
                    Request Quote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Support Tickets</CardTitle>
            <Button className="bg-[#3ECF8E] text-black" onClick={() => window.location.href = 'mailto:support@innovates.bt'}>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-6">
                <HelpCircle className="w-8 h-8 mx-auto text-[#E5E5E1] mb-2" />
                <p className="text-sm text-[#717171]">No support tickets</p>
                <Button variant="outline" className="mt-3 border-[#E5E5E1]" onClick={() => window.location.href = 'mailto:support@innovates.bt'}>
                  Contact Support
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                    <div className="flex items-center gap-3">
                      {ticket.status === 'open' ? (
                        <Clock className="w-4 h-4 text-orange-500" />
                      ) : ticket.status === 'resolved' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#717171]" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{ticket.subject}</p>
                        <p className="text-xs text-[#717171]">#{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className={ticket.status === 'open' ? 'bg-orange-100 text-orange-700' : ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => window.location.href = 'mailto:support@innovates.bt'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
            <MessageSquare className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
            <span className="text-xs font-medium">Contact Support</span>
          </button>
          <button onClick={() => window.location.href = 'mailto:sales@innovates.bt'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
            <FileCheck className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
            <span className="text-xs font-medium">Renew AMC</span>
          </button>
          <button onClick={() => window.location.href = 'https://innovates.bt/services'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
            <CreditCard className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
            <span className="text-xs font-medium">View Services</span>
          </button>
          <button onClick={() => window.location.href = 'https://innovates.bt'} className="p-4 bg-white rounded-xl border border-[#E5E5E1] hover:border-[#3ECF8E] transition-colors text-center">
            <Zap className="w-6 h-6 mx-auto text-[#3ECF8E] mb-2" />
            <span className="text-xs font-medium">Visit Website</span>
          </button>
        </div>
      </main>

      <footer className="border-t border-[#E5E5E1] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-[#717171]">
          <p>© 2026 INNOVATES BHUTAN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}