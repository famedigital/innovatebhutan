"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, MessageSquare, Settings, RefreshCw, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function AIConsole() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalIntents: 0, ticketsCreated: 0, autoReplied: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setLogs(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const { count: tickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
    const { count: intents } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('action', 'WHATSAPP_TRIAGE');
    
    setStats({
      totalIntents: intents || 0,
      ticketsCreated: tickets || 0,
      autoReplied: (intents || 0) - (tickets || 0)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">AI & Bot Control</h1>
          <p className="text-sm text-[#717171]">Monitor WhatsApp bot activity and automation</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" className="border-[#E5E5E1]">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#717171] uppercase">Messages Processed</p>
                <p className="text-lg font-semibold">{stats.totalIntents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#717171] uppercase">Tickets Created</p>
                <p className="text-lg font-semibold">{stats.ticketsCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#717171] uppercase">Auto-Replied</p>
                <p className="text-lg font-semibold">{stats.autoReplied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bot Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-[#F3F3F1]">
                <tr>
                  <th className="text-left text-[10px] text-[#717171] px-4 py-2">Time</th>
                  <th className="text-left text-[10px] text-[#717171] px-4 py-2">Action</th>
                  <th className="text-left text-[10px] text-[#717171] px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.slice(0, 20).map((log, i) => (
                  <tr key={i} className="border-t border-[#E5E5E1]">
                    <td className="text-xs text-[#717171] px-4 py-2">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge className="text-[10px] px-2 bg-[#F3F3F1] text-[#717171]">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="text-xs text-[#717171] px-4 py-2">
                      {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-[#717171]">
                      {loading ? 'Loading...' : 'No bot activity yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Bot Setup */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bot Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Gemini AI</span>
              </div>
              <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">WhatsApp API</span>
              </div>
              <Badge className="bg-green-100 text-green-700 text-[10px]">Connected</Badge>
            </div>

            <div className="p-3 bg-[#F3F3F1] rounded-lg">
              <p className="text-xs text-[#717171] mb-2">Webhook URL</p>
              <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
                /api/whatsapp
              </code>
            </div>

            <Button className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={() => window.location.href = '/admin/settings'}>
              <Settings className="w-4 h-4 mr-2" />
              Configure APIs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}