"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, Search, RefreshCw, Phone, Send, Zap, 
  MessageCircle, CheckCircle, XCircle, Clock, BarChart3,
  Settings, Bot, Image as ImageIcon, FileText, Paperclip,
  MoreVertical, User, PhoneCall, Video, Star, Archive,
  Trash2, Search as SearchIcon, Filter, Plus, ArrowLeft,
  Smile, Mic, Camera, MapPin, Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id?: number;
  from_number: string;
  to_number: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  company?: string;
  amc_status?: string;
}

const QUICK_REPLIES = [
  { label: "👋 Greeting", text: "Namaste! Welcome to INNOVATES BHUTAN. How can I help you today?" },
  { label: "📋 Service Info", text: "You can view our services at: https://innovates.bt/services" },
  { label: "📞 Call Support", text: "For immediate assistance, please call +975 17268753" },
  { label: "🕐 Business Hours", text: "Our office is open Sunday to Friday, 9 AM to 5 PM (BT)" },
  { label: "📧 Email Us", text: "You can email us at support@innovates.bt" },
  { label: "🔧 Technical Support", text: "I'll connect you with our technical team. Please describe your issue." },
];

export function WhatsAppHub() {
  const [activeTab, setActiveTab] = useState("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClient?.phone) {
      fetchMessages(selectedClient.phone);
    }
  }, [selectedClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const clientsRes = await supabase.from('clients').select('*').order('name', { ascending: true });
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (phone: string) => {
    try {
      const { data } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .or(`from_number.eq.${phone},to_number.eq.${phone}`)
        .order('created_at', { ascending: true });
      
      const formattedMessages: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        from_number: m.from_number,
        to_number: m.to_number,
        message: m.message,
        direction: m.direction || (m.from_number === phone ? 'inbound' : 'outbound'),
        status: m.status || 'delivered',
        created_at: m.created_at
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const sendMessage = async () => {
    if (!selectedClient?.phone || !messageText.trim()) return;
    
    setSending(true);
    try {
      // Save to database
      await supabase.from('whatsapp_logs').insert({
        from_number: 'innovate_bt',
        to_number: selectedClient.phone,
        message: messageText,
        direction: 'outbound',
        status: 'sent',
        intent: 'MANUAL_REPLY'
      });

      // Call WhatsApp API
      const settingsRes = await supabase.from('settings').select('value').eq('key', 'whatsapp_api_key').single();
      if (settingsRes.data?.value) {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            phone: selectedClient.phone,
            message: messageText
          })
        });
      }

      setMessageText("");
      fetchMessages(selectedClient.phone);
      toast.success("Message sent!");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const startNewChat = async () => {
    if (!newPhone.trim() || !newMessage.trim()) {
      toast.error("Phone and message required");
      return;
    }

    setSending(true);
    try {
      await supabase.from('whatsapp_logs').insert({
        from_number: 'innovate_bt',
        to_number: newPhone,
        message: newMessage,
        direction: 'outbound',
        status: 'sent',
        intent: 'MANUAL_REPLY'
      });

      const settingsRes = await supabase.from('settings').select('value').eq('key', 'whatsapp_api_key').single();
      if (settingsRes.data?.value) {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            phone: newPhone,
            message: newMessage
          })
        });
      }

      toast.success("Message sent!");
      setShowNewChat(false);
      setNewPhone("");
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const sendQuickReply = async (text: string) => {
    setMessageText(text);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Left Panel - Chat List */}
      <div className="w-80 flex flex-col bg-white rounded-xl border border-[#E5E5E1]">
        <div className="p-4 border-b border-[#E5E5E1]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1A1A]">Messages</h2>
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-[#E5E5E1]">
                <DialogHeader>
                  <DialogTitle>New WhatsApp Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-xs text-[#717171]">Phone Number</label>
                    <Input 
                      placeholder="+975xxxxxxxx" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-[#F3F3F1] border-[#E5E5E1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#717171]">Message</label>
                    <textarea 
                      className="w-full h-24 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#3ECF8E] text-white"
                    onClick={startNewChat}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-[#F3F3F1] border-[#E5E5E1] h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[#717171]">Loading...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-[#717171]">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No clients found</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-[#F3F3F1] transition-colors border-b border-[#E5E5E1] ${
                  selectedClient?.id === client.id ? 'bg-[#3ECF8E]/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#3ECF8E]" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1A1A1A] truncate">{client.name}</span>
                    {client.amc_status === 'active' && (
                      <Badge className="bg-green-100 text-green-700 text-[8px]">AMC</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#717171] truncate">{client.phone}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Quick Broadcast */}
        <div className="p-3 border-t border-[#E5E5E1]">
          <Button 
            variant="outline" 
            className="w-full border-[#E5E5E1] text-xs"
            onClick={() => toast.info("Broadcast feature - select multiple clients")}
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Broadcast to All
          </Button>
        </div>
      </div>

      {/* Middle Panel - Chat Window */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#E5E5E1]">
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#E5E5E1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  className="lg:hidden"
                  onClick={() => setSelectedClient(null)}
                >
                  <ArrowLeft className="w-5 h-5 text-[#717171]" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#3ECF8E]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1A1A1A]">{selectedClient.name}</h3>
                  <p className="text-xs text-[#717171]">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <PhoneCall className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-[#E5E5E1] mb-3" />
                  <p className="text-sm text-[#717171]">No messages yet</p>
                  <p className="text-xs text-[#A3A3A3]">Start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.direction === 'outbound' 
                          ? 'bg-[#3ECF8E] text-black rounded-br-md' 
                          : 'bg-[#F3F3F1] text-[#1A1A1A] rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        msg.direction === 'outbound' ? 'text-black/60' : 'text-[#717171]'
                      }`}>
                        <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                        {msg.direction === 'outbound' && (
                          msg.status === 'read' ? <CheckCircle className="w-3 h-3" /> :
                          msg.status === 'delivered' ? <CheckCircle className="w-3 h-3 opacity-50" /> :
                          <Clock className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-[#E5E5E1]">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {QUICK_REPLIES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickReply(qr.text)}
                    className="flex-shrink-0 px-3 py-1.5 bg-[#F3F3F1] rounded-full text-xs text-[#717171] hover:bg-[#E5E5E1] transition-colors"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#E5E5E1]">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-[#717171]">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-[#717171]">
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <input 
                  type="text"
                  className="flex-1 bg-[#F3F3F1] border-0 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]/20"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button 
                  className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white rounded-full w-10 h-10 p-0"
                  onClick={sendMessage}
                  disabled={sending || !messageText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-[#E5E5E1] mb-4" />
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">Select a conversation</h3>
              <p className="text-sm text-[#717171]">Choose a client from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Client Info & Settings */}
      <div className="w-72 space-y-4">
        {/* Client Details */}
        {selectedClient && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#3ECF8E]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedClient.name}</p>
                  <p className="text-xs text-[#717171]">{selectedClient.company || 'Individual'}</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3 h-3 text-[#717171]" />
                  <span className="text-[#717171]">{selectedClient.phone}</span>
                </div>
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <MessageSquare className="w-3 h-3 text-[#717171]" />
                    <span className="text-[#717171]">{selectedClient.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5E5E1]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#717171]">AMC Status</span>
                  <Badge className={selectedClient.amc_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {selectedClient.amc_status || 'None'}
                  </Badge>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-2 border-[#E5E5E1]"
                onClick={() => window.location.href = `/admin/clients?id=${selectedClient.id}`}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bot Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#3ECF8E]" />
              Bot Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#717171]">Total Messages</span>
              <span className="text-sm font-medium">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#717171]">Today</span>
              <span className="text-sm font-medium text-green-600">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#717171]">Auto-tickets</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#717171]">Leads Captured</span>
              <span className="text-sm font-medium">8</span>
            </div>
            <div className="pt-2 border-t border-[#E5E5E1]">
              <Badge className="bg-green-100 text-green-700 w-full justify-center">Bot Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-[#F3F3F1] rounded-lg">
              <span className="text-xs">Auto-reply</span>
              <Badge className="bg-green-100 text-green-700 text-[10px]">On</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#F3F3F1] rounded-lg">
              <span className="text-xs">Ticket Auto-create</span>
              <Badge className="bg-green-100 text-green-700 text-[10px]">On</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#F3F3F1] rounded-lg">
              <span className="text-xs">AI Intent Detection</span>
              <Badge className="bg-green-100 text-green-700 text-[10px]">On</Badge>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-2 border-[#E5E5E1] text-xs"
              onClick={() => window.location.href = '/admin/ai/bot-training'}
            >
              Configure Bot
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}