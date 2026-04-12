"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Clock, CheckCircle, ShieldAlert, Activity, Package, Phone, MapPin } from "lucide-react";

export function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
    
    // Set up Realtime Sync
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          fetchOrders(); // Re-fetch on any order change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const deployedCount = orders.filter(o => o.status === 'deployed').length;

return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Signals</p>
            <p className="text-3xl font-black text-black">{orders.length}</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-200">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-yellow-700 text-xs font-bold uppercase tracking-widest mb-1">Pending Calibration</p>
            <p className="text-3xl font-black text-yellow-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-green-700 text-xs font-bold uppercase tracking-widest mb-1">Nodes Deployed</p>
            <p className="text-3xl font-black text-green-600">{deployedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-widest text-black">Live Infrastructure Orders</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">System Synced</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 bg-gray-50">
                <th className="px-8 py-4">Request ID</th>
                <th className="px-8 py-4">Commander (Client)</th>
                <th className="px-8 py-4">Target Node (Location)</th>
                <th className="px-8 py-4">Capital (Value)</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-gray-600">#{order.id}</span>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-black">{order.customer_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs font-bold">{order.customer_phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold">{order.customer_location || "Awaiting Data"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-green-600">Nu. {parseInt(order.total_amount).toLocaleString()}</span>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">
                      {order.meta?.serviceCount || 0} Nodes
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    {order.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-[10px] font-black uppercase tracking-widest text-yellow-600">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-black uppercase tracking-widest text-green-600">
                        <CheckCircle className="w-3 h-3" /> Deployed
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right space-x-3">
                     {order.status === 'pending' && (
                       <button 
                         onClick={() => updateStatus(order.id, 'deployed')}
                         className="px-4 py-2 bg-black hover:bg-gray-800 text-white border border-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         Deploy Flag
                       </button>
                     )}
                     {order.status === 'deployed' && (
                       <button 
                         onClick={() => updateStatus(order.id, 'pending')}
                         className="px-4 py-2 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         Revert
                       </button>
                     )}
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                    No active operations found in the matrix
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

