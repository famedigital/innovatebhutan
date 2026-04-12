"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ExternalLink, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldClose,
  Phone,
  Layout,
  RefreshCw
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function ClientManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 📡 Real-time Data Sync
  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          amcs(*)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error("Client Fetch Error:", err);
      // Fallback to empty if table doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search the node matrix..." 
            className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-green-500 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={fetchClients}
          className="border-gray-200 hover:bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-widest h-10 px-6"
        >
          <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Matrix
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Infrastructure Offline</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest max-w-xs text-center leading-relaxed">
              No live nodes detected. Ensure the SQL schema has been executed in the Supabase Dashboard.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 h-12 px-6">Enterprise Partner</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 h-12 px-6">Infrastructure Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 h-12 px-6">AMC Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 h-12 px-6">Latest Protocol</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 h-12 px-6">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const latestAMC = client.amcs?.[0];
                return (
                  <TableRow key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-[10px] font-black text-green-600">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-black">{client.name || 'Unnamed Client'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span className="text-[10px] font-bold tracking-widest">{client.whatsapp || "No Phone"}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <Layout className="w-4 h-4 text-green-600 opacity-50" />
                         <span className="text-xs font-bold text-gray-600">{latestAMC?.hardware_details?.model || "Standard Node"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <Badge className={`${
                         latestAMC?.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                       } text-[10px] font-black uppercase tracking-widest`}>
                         {latestAMC?.status || "Off-Contract"}
                       </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-mono font-bold text-gray-500">
                      {latestAMC?.expiry_date ? new Date(latestAMC.expiry_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all"
                          onClick={() => window.open(`https://wa.me/${client.whatsapp}`, '_blank')}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all">
                              <MoreVertical className="w-4 h-4 text-black" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 text-black">
                            <DropdownMenuItem className="focus:bg-green-50 focus:text-green-600 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                               <ExternalLink className="w-4 h-4 mr-2" /> View Detailed Logs
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-blue-50 focus:text-blue-600 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                               Edit Client Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                               Delete Client Node
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
