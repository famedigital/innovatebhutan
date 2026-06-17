"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RealTimeChat } from "@/components/chat/real-time-chat";
import { createClient } from "@/utils/supabase/client";

export default function ClientChatPage() {
  const router = useRouter();
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<"online" | "offline" | "connecting">("connecting");

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/portal/chat');
        return;
      }

      setCurrentUserId(user.id);

      // Get client profile
      const { data: client } = await supabase
        .from('clients')
        .select('id, userId, status')
        .eq('userId', user.id)
        .single();

      if (!client) {
        console.error('Client profile not found');
        return;
      }

      setClientId(client.id);

      // Check if there's an existing conversation
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id, status')
        .eq('clientId', client.id)
        .in('status', ['open', 'active'])
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      if (existingConv) {
        setConversationId(existingConv.id);
        setChatStatus('online');
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({
            clientId: client.id,
            status: 'open',
            source: 'web',
          })
          .select()
          .single();

        if (newConv) {
          setConversationId(newConv.id);
          setChatStatus('online');

          // Add welcome message
          await supabase.from('chat_messages').insert({
            conversationId: newConv.id,
            senderId: 'system',
            senderType: 'system',
            message: 'Welcome to Innovate Bhutan Support! How can we help you today?',
            messageType: 'text',
          });
        }
      }

      // Set status to online
      setChatStatus('online');
    } catch (error) {
      console.error('Error initializing chat:', error);
      setChatStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      title: "WhatsApp Support",
      description: "Quick responses via WhatsApp",
      icon: MessageCircle,
      action: () => window.open('https://wa.me/97517345678', '_blank'),
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      available: "24/7",
    },
    {
      title: "Phone Support",
      description: "Call us directly",
      icon: Phone,
      action: () => window.open('tel:+97517345678'),
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      available: "9 AM - 5 PM",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      action: () => window.location.href = 'mailto:support@innovates.bt',
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      available: "24/7",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Live Chat Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Get instant help from our support team
          </p>
        </div>
        <Badge variant={chatStatus === "online" ? "default" : "secondary"} className="gap-1">
          <div className={`w-2 h-2 rounded-full ${chatStatus === "online" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
          {chatStatus === "online" ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Chat Container */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Support Chat</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                Average response: ~2 minutes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                WhatsApp Sync
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px]">
            {conversationId ? (
              <RealTimeChat
                conversationId={conversationId}
                clientId={clientId || undefined}
                currentUserId={currentUserId || undefined}
                currentUserType="client"
                whatsappSyncEnabled={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Unable to load chat</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={initializeChat}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Contact Methods */}
      <div className="grid gap-4 md:grid-cols-3">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={method.action}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${method.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${method.color}`} />
                  </div>
                  <CardTitle className="text-base">{method.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {method.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {method.available}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Contact
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Chat Support Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Support team typically responds within 2-5 minutes</li>
                <li>• Messages sync to WhatsApp for seamless communication</li>
                <li>• For urgent matters, call us directly at +975 17 345 678</li>
                <li>• Chat history is saved for future reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
