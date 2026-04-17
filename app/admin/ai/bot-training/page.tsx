"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Save, RefreshCw, MessageSquare, Zap, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface BotResponse {
  id?: number;
  intent: string;
  trigger_keywords: string[];
  response_template: string;
  active: boolean;
}

const DEFAULT_RESPONSES: BotResponse[] = [
  {
    intent: "SALES_LEAD",
    trigger_keywords: ["interested", "price", "pricing", "buy", "purchase", "cost", "quotation", "demo", "try", "service"],
    response_template: "Thank you for your interest in INNOVATES BHUTAN! Our sales team will contact you within 24 hours. In the meantime, you can view our services at: https://innovates.bt/services",
    active: true
  },
  {
    intent: "SUPPORT_TICKET",
    trigger_keywords: ["not working", "error", "problem", "issue", "broken", "lag", "slow", "crash", "help"],
    response_template: "I understand you're experiencing technical issues. I've logged a support ticket. Our technical team will reach out within 2 hours. For urgent issues, call: +975 17268753",
    active: true
  },
  {
    intent: "AMC_QUERY",
    trigger_keywords: ["amc", "contract", "renewal", "expiry", "maintenance", "support contract", "service agreement"],
    response_template: "Thank you for your AMC inquiry. Our team will check your contract status and get back to you. You can also call +975 17268753 for immediate assistance.",
    active: true
  },
  {
    intent: "EXPENSE_REPORT",
    trigger_keywords: ["expense", "claim", "reimbursement", "bill", "receipt", "spending"],
    response_template: "For expense submissions, please use our ERP Finance module or submit receipts to accounts@innovates.bt. Our team will process within 48 hours.",
    active: true
  },
  {
    intent: "GREETING",
    trigger_keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "namaste"],
    response_template: "Namaste! Welcome to INNOVATES BHUTAN. How can I help you today? You can ask about our services, technical support, or AMC contracts.",
    active: true
  }
];

export default function BotTrainingPage() {
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<BotResponse>({
    intent: "",
    trigger_keywords: [],
    response_template: "",
    active: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('bot_responses').select('*').order('intent');
      if (data && data.length > 0) {
        setResponses(data);
      } else {
        for (const response of DEFAULT_RESPONSES) {
          await supabase.from('bot_responses').insert(response);
        }
        setResponses(DEFAULT_RESPONSES);
      }
    } catch (err) {
      console.error("Error:", err);
      setResponses(DEFAULT_RESPONSES);
    }
    setLoading(false);
  };

  const updateResponse = async (id: number) => {
    try {
      const { error } = await supabase.from('bot_responses').update({
        trigger_keywords: editForm.trigger_keywords,
        response_template: editForm.response_template,
        active: editForm.active
      }).eq('id', id);

      if (!error) {
        toast.success("Response updated!");
        setEditingId(null);
        fetchResponses();
      } else {
        toast.error("Failed to update");
      }
    } catch (err) {
      toast.error("Error updating response");
    }
  };

  const addNewResponse = async () => {
    try {
      const { error } = await supabase.from('bot_responses').insert({
        intent: "CUSTOM_" + Date.now(),
        trigger_keywords: [],
        response_template: "Your custom response here",
        active: true
      });

      if (!error) {
        toast.success("New response added");
        fetchResponses();
      } else {
        toast.error("Failed to add response");
      }
    } catch (err) {
      toast.error("Error adding response");
    }
  };

  const deleteResponse = async (id: number) => {
    if (!confirm("Delete this response?")) return;
    try {
      const { error } = await supabase.from('bot_responses').delete().eq('id', id);
      if (!error) {
        toast.success("Deleted");
        fetchResponses();
      }
    } catch (err) {
      toast.error("Error deleting");
    }
  };

  const startEdit = (resp: BotResponse) => {
    setEditingId(resp.id || null);
    setEditForm({
      ...resp,
      trigger_keywords: Array.isArray(resp.trigger_keywords) ? resp.trigger_keywords : []
    });
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Bot Training Center</h1>
          <p className="text-sm text-[#717171]">Train your WhatsApp Superbot responses</p>
        </div>
        <Button onClick={addNewResponse} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Response
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Responses</p>
            <p className="text-xl font-bold">{responses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Active</p>
            <p className="text-xl font-bold text-green-600">{responses.filter(r => r.active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Keywords</p>
            <p className="text-xl font-bold">{responses.reduce((sum, r) => sum + (r.trigger_keywords?.length || 0), 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Bot Status</p>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {responses.map((resp) => (
          <Card key={resp.id} className={resp.active ? '' : 'opacity-60'}>
            {editingId === resp.id ? (
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#3ECF8E] text-black">{resp.intent}</Badge>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" className="bg-[#3ECF8E] text-black" onClick={() => updateResponse(resp.id!)}>
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Trigger Keywords (comma separated)</label>
                  <Input 
                    value={editForm.trigger_keywords.join(', ')}
                    onChange={(e) => setEditForm({...editForm, trigger_keywords: e.target.value.split(',').map(k => k.trim())})}
                    placeholder="keyword1, keyword2, keyword3"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Response Template</label>
                  <textarea 
                    className="w-full h-24 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                    value={editForm.response_template}
                    onChange={(e) => setEditForm({...editForm, response_template: e.target.value})}
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editForm.active}
                    onChange={(e) => setEditForm({...editForm, active: e.target.checked})}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </CardContent>
            ) : (
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={resp.active ? 'bg-[#3ECF8E] text-black' : 'bg-gray-100 text-gray-500'}>
                        {resp.intent}
                      </Badge>
                      {!resp.active && <span className="text-xs text-red-500">Disabled</span>}
                    </div>
                    <p className="text-sm mb-2">{resp.response_template}</p>
                    <div className="flex flex-wrap gap-1">
                      {(resp.trigger_keywords || []).map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F3F3F1] rounded-full text-[#717171]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(resp)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteResponse(resp.id!)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-[#F3F3F1]">
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2">How Bot Training Works</h3>
          <ul className="text-xs text-[#717171] space-y-1">
            <li>• Bot analyzes incoming messages using AI + keyword matching</li>
            <li>• Each response has trigger keywords that activate it</li>
            <li>• AI generates the actual response based on context</li>
            <li>• You can customize both keywords and response templates</li>
            <li>• Changes take effect immediately - no restart needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}