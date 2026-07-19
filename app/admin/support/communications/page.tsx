"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Calendar,
  Clock,
  Send,
  Filter,
  Download,
  RefreshCw,
  Plus,
  ChevronRight,
  X,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Inbox,
  Paperclip,
  Zap,
  Bell
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Communication {
  id: number;
  clientId?: number;
  type: 'whatsapp' | 'email' | 'ticket' | 'visit' | 'call';
  subject?: string;
  content: string;
  outcome?: string;
  nextAction?: string;
  focalPersonId?: number;
  teamMemberId?: number;
  problemId?: number;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentiment?: 'positive' | 'neutral' | 'negative';
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
}

interface CommunicationStats {
  totalCommunications: number;
  pendingCommunications: number;
  sentToday: number;
  responseRate: number;
  sentimentScore: number;
}

export default function CommunicationsHubPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    sentiment: "all"
  });
  const [stats, setStats] = useState<CommunicationStats>({
    totalCommunications: 0,
    pendingCommunications: 0,
    sentToday: 0,
    responseRate: 0,
    sentimentScore: 0
  });

  const [newCommunication, setNewCommunication] = useState({
    type: 'email' as Communication['type'],
    clientId: undefined as number | undefined,
    subject: '',
    content: '',
    scheduledFor: undefined as string | undefined,
    direction: 'outbound' as Communication['direction']
  });

  useEffect(() => {
    fetchCommunications();
    fetchStats();
  }, []);

  const fetchCommunications = async () => {
    try {
      const response = await fetch('/api/communications');
      const data = await response.json();

      if (data.success) {
        setCommunications(data.data || []);
      } else {
        toast.error("Failed to fetch communications");
      }
    } catch (err) {
      console.error("Communication Fetch Error:", err);
      toast.error("Error loading communications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const totalComms = communications.length;
      const pendingComms = communications.filter(c => c.status === 'pending').length;
      const today = new Date().toDateString();
      const sentTodayCount = communications.filter(c => {
        const commDate = new Date(c.createdAt).toDateString();
        return commDate === today && c.status === 'sent';
      }).length;

      // Calculate sentiment score
      const sentimentValues = { positive: 1, neutral: 0, negative: -1 };
      const sentimentSum = communications.reduce((sum, c) => {
        return sum + (sentimentValues[c.sentiment || 'neutral'] || 0);
      }, 0);
      const avgSentiment = totalComms > 0 ? (sentimentSum / totalComms + 1) * 50 : 50;

      setStats({
        totalCommunications: totalComms,
        pendingCommunications: pendingComms,
        sentToday: sentTodayCount,
        responseRate: 75, // Would be calculated from actual data
        sentimentScore: Math.round(avgSentiment)
      });
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  const createCommunication = async () => {
    if (!newCommunication.content) {
      toast.error("Please provide communication content");
      return;
    }

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommunication)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Communication created successfully!");
        setShowCreateDialog(false);
        setNewCommunication({
          type: 'email',
          clientId: undefined,
          subject: '',
          content: '',
          scheduledFor: undefined,
          direction: 'outbound'
        });
        fetchCommunications();
        fetchStats();

        if (data.aiSentiment) {
          toast.info(`AI detected sentiment: ${data.aiSentiment.toUpperCase()}`);
        }
      } else {
        toast.error(data.error || "Failed to create communication");
      }
    } catch (err) {
      toast.error("Error creating communication");
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (comm.subject && comm.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filters.type === "all" || comm.type === filters.type;
    const matchesStatus = filters.status === "all" || comm.status === filters.status;
    const matchesSentiment = filters.sentiment === "all" || comm.sentiment === filters.sentiment;

    return matchesSearch && matchesType && matchesStatus && matchesSentiment;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'ticket': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'visit': return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'call': return <Phone className="w-4 h-4 text-pink-600" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'bg-green-100 text-green-700';
      case 'email': return 'bg-blue-100 text-blue-700';
      case 'ticket': return 'bg-purple-100 text-purple-700';
      case 'visit': return 'bg-orange-100 text-orange-700';
      case 'call': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-600" />;
      case 'neutral': return <Meh className="w-4 h-4 text-gray-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      default: return <Meh className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? (
      <Inbox className="w-4 h-4 text-blue-600" />
    ) : (
      <Send className="w-4 h-4 text-green-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Communications</h1>
          <p className="text-sm text-muted-foreground">Multi-channel communication management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Communication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Type</label>
                    <Select
                      value={newCommunication.type}
                      onValueChange={(value: any) => setNewCommunication({...newCommunication, type: value})}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="visit">Visit</SelectItem>
                        <SelectItem value="ticket">Ticket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Direction</label>
                    <Select
                      value={newCommunication.direction}
                      onValueChange={(value: any) => setNewCommunication({...newCommunication, direction: value})}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outbound">Outbound</SelectItem>
                        <SelectItem value="inbound">Inbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Subject</label>
                  <Input
                    value={newCommunication.subject}
                    onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                    placeholder="Communication subject"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Content *</label>
                  <Textarea
                    value={newCommunication.content}
                    onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
                    placeholder="Communication content..."
                    className="bg-gray-50 border-gray-200 h-24"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Schedule For (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={newCommunication.scheduledFor || ''}
                    onChange={(e) => setNewCommunication({...newCommunication, scheduledFor: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <Button
                  className="w-full bg-[#3ECF8E] text-black"
                  onClick={createCommunication}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Send with AI Sentiment Analysis
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Communications</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalCommunications}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pendingCommunications}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Sent Today</p>
                <p className="text-2xl font-bold text-green-700">{stats.sentToday}</p>
              </div>
              <Send className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Response Rate</p>
                <p className="text-2xl font-bold text-purple-700">{stats.responseRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Sentiment Score</p>
                <p className="text-2xl font-bold text-orange-700">{stats.sentimentScore}%</p>
              </div>
              <Smile className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 border-gray-200">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({...filters, type: value})}
            >
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="visit">Visit</SelectItem>
                <SelectItem value="ticket">Ticket</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchCommunications}
              className="border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search communications..."
                    className="pl-10 bg-white border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Subject/Content</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCommunications.filter(c => c.direction === 'inbound').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No inbound communications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCommunications
                      .filter(c => c.direction === 'inbound')
                      .map((comm) => (
                        <TableRow
                          key={comm.id}
                          className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedComm(comm)}
                        >
                          <TableCell className="text-sm font-medium">#{comm.id}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(comm.type)}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(comm.type)}
                                <span className="capitalize">{comm.type}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-black">{comm.subject || 'No Subject'}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{comm.content}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getDirectionIcon(comm.direction)}
                              <span className="text-sm capitalize">{comm.direction}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(comm.status)}>
                              {comm.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getSentimentIcon(comm.sentiment)}
                              <span className="text-sm capitalize">{comm.sentiment || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <Send className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">View sent communications here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Scheduled Communications</CardTitle>
              <p className="text-sm text-gray-500">Upcoming scheduled messages and follow-ups</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCommunications
                  .filter(c => c.status === 'pending' && c.scheduledFor)
                  .map((comm) => (
                    <Card key={comm.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/10 flex items-center justify-center">
                              {getTypeIcon(comm.type)}
                            </div>
                            <div>
                              <p className="font-medium text-black">{comm.subject || 'No Subject'}</p>
                              <p className="text-xs text-gray-500">{comm.content.substring(0, 50)}...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {new Date(comm.scheduledFor!).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {filteredCommunications.filter(c => c.status === 'pending' && c.scheduledFor).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4" />
                    <p>No scheduled communications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up Tab */}
        <TabsContent value="follow-up">
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Communications requiring follow-up will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Communication Details Panel */}
      {selectedComm && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedComm.type)}
                <span>Communication #{selectedComm.id}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedComm(null)}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Communication Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Type</label>
                    <Badge className={getTypeColor(selectedComm.type) + " mt-1"}>
                      {selectedComm.type.toUpperCase()}
                    </Badge>
                  </div>
                  {selectedComm.subject && (
                    <div>
                      <label className="text-xs text-gray-600">Subject</label>
                      <p className="text-sm font-medium mt-1">{selectedComm.subject}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-600">Direction</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getDirectionIcon(selectedComm.direction)}
                      <span className="text-sm capitalize">{selectedComm.direction}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Status</label>
                    <Badge className={getStatusColor(selectedComm.status) + " mt-1"}>
                      {selectedComm.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Analysis & Timing</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Sentiment</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getSentimentIcon(selectedComm.sentiment)}
                      <span className="text-sm capitalize">{selectedComm.sentiment || 'Not analyzed'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Created</label>
                    <p className="text-sm mt-1">{new Date(selectedComm.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedComm.scheduledFor && (
                    <div>
                      <label className="text-xs text-gray-600">Scheduled For</label>
                      <p className="text-sm mt-1">{new Date(selectedComm.scheduledFor).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedComm.completedAt && (
                    <div>
                      <label className="text-xs text-gray-600">Completed</label>
                      <p className="text-sm mt-1">{new Date(selectedComm.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <p className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">{selectedComm.content}</p>
            </div>

            {selectedComm.outcome && (
              <div>
                <h3 className="font-semibold mb-2">Outcome</h3>
                <p className="text-sm bg-green-50 p-4 rounded-lg border border-green-200">{selectedComm.outcome}</p>
              </div>
            )}

            {selectedComm.nextAction && (
              <div>
                <h3 className="font-semibold mb-2">Next Action</h3>
                <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">{selectedComm.nextAction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}