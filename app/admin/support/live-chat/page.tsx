"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  MoreVertical,
  Phone,
  Mail,
  Send,
  Trash2,
  Archive,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { RealTimeChat } from "@/components/chat/real-time-chat";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

/**
 * 💬 Admin Live Chat Dashboard
 *
 * Features:
 * - Active conversations list with real-time updates
 * - Multiple concurrent chat windows
 * - Agent assignment
 * - Conversation filtering and search
 * - Typing indicators
 * - WhatsApp sync status
 */

interface Conversation {
  id: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  status: 'open' | 'active' | 'pending' | 'closed' | 'archived';
  source: 'web' | 'whatsapp' | 'email';
  assignedTo?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  online: boolean;
  activeChats: number;
}

export default function LiveChatDashboard() {
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('userId', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }

      // Fetch conversations
      await fetchConversations();

      // Fetch agents
      await fetchAgents();

      // Subscribe to real-time updates
      subscribeToUpdates();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        clientId,
        status,
        source,
        assignedTo,
        createdAt,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .in('status', ['open', 'active', 'pending'])
      .order('createdAt', { ascending: false });

    if (!error && data) {
      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        data.map(async (conv: any) => {
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('message, createdAt')
            .eq('conversationId', conv.id)
            .order('createdAt', { ascending: false })
            .limit(1)
            .single();

          // Count unread
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversationId', conv.id)
            .not('senderType', 'eq', 'admin')
            .is('readAt', null);

          return {
            ...conv,
            clientName: conv.clients?.name,
            clientEmail: conv.clients?.email,
            clientPhone: conv.clients?.phone,
            lastMessage: messages?.message,
            lastMessageAt: messages?.createdAt,
            unreadCount: count || 0,
          };
        })
      );

      setConversations(conversationsWithMessages);
    }
  };

  const fetchAgents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('role', ['ADMIN', 'STAFF']);

    if (data) {
      const agentsWithStatus = await Promise.all(
        data.map(async (agent: any) => {
          // Count active chats
          const { count } = await supabase
            .from('chat_conversations')
            .select('*', { count: 'exact', head: true })
            .eq('assignedTo', agent.id)
            .in('status', ['open', 'active']);

          return {
            ...agent,
            online: true, // TODO: Implement online status tracking
            activeChats: count || 0,
          };
        })
      );

      setAgents(agentsWithStatus);
    }
  };

  const subscribeToUpdates = () => {
    // Subscribe to new conversations
    const convChannel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  };

  const assignConversation = async (conversationId: string, agentId: number) => {
    await supabase
      .from('chat_conversations')
      .update({ assignedTo: agentId })
      .eq('id', conversationId);

    await fetchConversations();
  };

  const closeConversation = async (conversationId: string) => {
    await supabase
      .from('chat_conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);

    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }

    await fetchConversations();
  };

  const archiveConversation = async (conversationId: string) => {
    await supabase
      .from('chat_conversations')
      .update({ status: 'archived' })
      .eq('id', conversationId);

    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }

    await fetchConversations();
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'open':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'closed':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return '';
    }
  };

  const getSourceIcon = (source: Conversation['source']) => {
    switch (source) {
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '🌐';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar - Conversations List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="border-b space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Live Chats
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              {conversations.length}
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeConversation?.id === conv.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {conv.clientName?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {conv.clientName || 'Unknown'}
                        </span>
                        <span className="text-lg">
                          {getSourceIcon(conv.source)}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {conv.lastMessageAt
                            ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })
                            : formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                        </span>
                        <Badge className={`text-[10px] px-1 py-0 ${getStatusColor(conv.status)}`}>
                          {conv.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Agents Status */}
        <div className="border-t p-3">
          <div className="text-xs font-medium text-muted-foreground mb-2">Online Agents</div>
          <div className="flex -space-x-2">
            {agents.slice(0, 5).map((agent) => (
              <Avatar key={agent.id} className="h-8 w-8 border-2 border-background" title={agent.name}>
                <AvatarFallback className="text-xs">
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {agents.length > 5 && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  +{agents.length - 5}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {activeConversation.clientName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {activeConversation.clientName || 'Unknown Client'}
                      </h3>
                      <Badge className={`text-xs ${getStatusColor(activeConversation.status)}`}>
                        {activeConversation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {activeConversation.clientEmail || 'No email'}
                      </span>
                      {activeConversation.clientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {activeConversation.clientPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Assign to agent */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => assignConversation(activeConversation.id, currentUserId!)}>
                        Assign to me
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {agents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          onClick={() => assignConversation(activeConversation.id, agent.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {agent.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{agent.name}</span>
                            <span className="text-xs text-muted-foreground">({agent.activeChats})</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* More actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => closeConversation(activeConversation.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Close Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveConversation(activeConversation.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Chat Component */}
            <div className="flex-1">
              <RealTimeChat
                conversationId={activeConversation.id}
                clientId={activeConversation.clientId}
                currentUserId={currentUserId?.toString()}
                currentUserType="admin"
                whatsappSyncEnabled={true}
                className="h-full"
              />
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Select a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the sidebar to start chatting with clients
              </p>
              <Button
                variant="outline"
                onClick={fetchConversations}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
