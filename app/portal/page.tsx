"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Ticket, ShoppingCart, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function PortalDashboard() {
  const [stats, setStats] = useState({
    activeChats: 0,
    openTickets: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (!profile) return;

      // Get client info
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (client) {
        // Count active chats
        const { count: chatCount } = await supabase
          .from('chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .in('status', ['open', 'active']);

        // Count open tickets
        const { count: ticketCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('clientId', client.id)
          .in('status', ['open', 'in_progress']);

        // Count pending orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('clientId', client.id)
          .in('status', ['pending', 'processing']);

        setStats({
          activeChats: chatCount || 0,
          openTickets: ticketCount || 0,
          pendingOrders: orderCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Start Live Chat",
      description: "Chat with our support team in real-time",
      icon: MessageCircle,
      href: "/portal/chat",
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      title: "View Tickets",
      description: "Check your support requests status",
      icon: Ticket,
      href: "/portal/tickets",
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "My Orders",
      description: "Track your orders and purchases",
      icon: ShoppingCart,
      href: "/portal/orders",
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
  ];

  const recentActivity = [
    {
      type: "chat",
      message: "Support team is online and ready to help",
      time: "Now",
      icon: MessageCircle,
    },
    {
      type: "system",
      message: "Welcome to your client portal",
      time: "Just now",
      icon: CheckCircle,
    },
    {
      type: "info",
      message: "You can reach us via WhatsApp for quick support",
      time: "Anytime",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to your Portal
        </h1>
        <p className="text-muted-foreground">
          Manage your communications, tickets, and orders in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Chats
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.activeChats}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time support
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.openTickets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Support requests
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => router.push(action.href)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity & Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Need immediate assistance?
              </h3>
              <p className="text-sm text-muted-foreground">
                Start a live chat or reach out via WhatsApp for quick responses.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
              onClick={() => router.push('/portal/chat')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
