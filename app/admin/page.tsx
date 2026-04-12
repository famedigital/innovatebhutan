"use client";

import { Users, DollarSign, Ticket, Briefcase, TrendingUp, Activity, CheckCircle2, MessageSquare, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [stats, setStats] = useState({
    clients: 0,
    tickets: 0,
    revenue: 0,
    projects: 0,
    loading: true
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const [systemStatus, setSystemStatus] = useState({
    whatsapp: { connected: false, checking: true },
    ai: { active: false, checking: true },
    database: { online: false, checking: true },
    webhooks: { active: false, checking: true }
  });

  const supabase = createClient();

  useEffect(() => {
    checkSystemStatus();
    fetchData();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const [{ data: settings }, { error: dbError }] = await Promise.all([
        supabase.from('settings').select('key, value').in('key', ['whatsapp_api_key', 'gemini_api_key', 'webhook_url']),
        supabase.from('clients').select('id').limit(1)
      ]);

      const settingsObj = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]));

      setSystemStatus({
        whatsapp: { connected: !!settingsObj.whatsapp_api_key, checking: false },
        ai: { active: !!settingsObj.gemini_api_key, checking: false },
        database: { online: !dbError, checking: false },
        webhooks: { active: !!settingsObj.webhook_url, checking: false }
      });
    } catch (err) {
      setSystemStatus({
        whatsapp: { connected: false, checking: false },
        ai: { active: false, checking: false },
        database: { online: false, checking: false },
        webhooks: { active: false, checking: false }
      });
    }
  };

  async function fetchData() {
    try {
      const [{ count: clients }, { count: openTickets }, { data: transactions }, { count: projects }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('transactions').select('amount, type').order('created_at', { ascending: false }).limit(10),
        supabase.from('projects').select('*', { count: 'exact', head: true })
      ]);

      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        clients: clients || 0,
        tickets: openTickets || 0,
        revenue: income,
        projects: projects || 0,
        loading: false
      });

      setRecentActivity(transactions?.slice(0, 5) || []);
    } catch (err) {
      setStats(s => ({ ...s, loading: false }));
    }
  }

  if (stats.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#3ECF8E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-sm text-[#717171]">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#E5E5E1] text-sm">
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard 
          title="Clients" 
          value={stats.clients.toString()} 
          icon={Users} 
          trend="+12%" 
          color="text-[#3ECF8E]"
        />
        <MetricCard 
          title="Tickets" 
          value={stats.tickets.toString()} 
          icon={Ticket} 
          trend={stats.tickets > 0 ? "Needs attention" : "All clear"} 
          color={stats.tickets > 0 ? "text-red-500" : "text-[#3ECF8E]"}
        />
        <MetricCard 
          title="Revenue" 
          value={`${(stats.revenue / 1000).toFixed(1)}k`} 
          icon={DollarSign} 
          trend="+8.4%" 
          color="text-[#3ECF8E]"
        />
        <MetricCard 
          title="Projects" 
          value={stats.projects.toString()} 
          icon={Briefcase} 
          trend="On track" 
          color="text-[#3ECF8E]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-medium">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="text-xs">View all</Button>
            </div>
            <div className="divide-y divide-[#E5E5E1]">
              {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-[#F3F3F1]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {item.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <DollarSign className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.type === 'income' ? 'Payment Received' : 'Expense'}</p>
                      <p className="text-xs text-[#717171]">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'income' ? '+' : '-'}{Number(item.amount).toLocaleString()}
                  </span>
                </div>
              )) : (
                <div className="p-8 text-center text-[#717171]">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11" onClick={() => window.location.href = '/admin/clients'}>
                <Users className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
              <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11" onClick={() => window.location.href = '/admin/tickets'}>
                <Ticket className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11" onClick={() => window.location.href = '/admin/projects'}>
                <Briefcase className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button className="w-full justify-start bg-[#3ECF8E] hover:bg-[#34b27b] text-white h-11" onClick={() => window.location.href = '/admin/whatsapp'}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${systemStatus.whatsapp.connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <span className="text-sm">WhatsApp API</span>
              {systemStatus.whatsapp.checking ? (
                <Badge className="bg-gray-100 text-gray-700 text-xs">Checking...</Badge>
              ) : systemStatus.whatsapp.connected ? (
                <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 text-xs">Not Connected</Badge>
              )}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg border ${systemStatus.ai.active ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className="text-sm">AI Engine</span>
              {systemStatus.ai.checking ? (
                <Badge className="bg-gray-100 text-gray-700 text-xs">Checking...</Badge>
              ) : systemStatus.ai.active ? (
                <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Not Configured</Badge>
              )}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg border ${systemStatus.database.online ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <span className="text-sm">Database</span>
              {systemStatus.database.checking ? (
                <Badge className="bg-gray-100 text-gray-700 text-xs">Checking...</Badge>
              ) : systemStatus.database.online ? (
                <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 text-xs">Offline</Badge>
              )}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg border ${systemStatus.webhooks.active ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className="text-sm">Webhooks</span>
              {systemStatus.webhooks.checking ? (
                <Badge className="bg-gray-100 text-gray-700 text-xs">Checking...</Badge>
              ) : systemStatus.webhooks.active ? (
                <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Not Configured</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#717171] uppercase tracking-wider">{title}</span>
          <div className={`w-6 h-6 rounded bg-[#F3F3F1] flex items-center justify-center ${color}`}>
            <Icon className="w-3 h-3" />
          </div>
        </div>
        <p className="text-xl font-semibold mt-1">{value}</p>
        <p className={`text-[10px] mt-0.5 ${color}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}