"use client";

import { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  MessageCircle,
  User,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Lightbulb,
  Target,
  Shield,
  Activity,
  Zap,
  ChevronRight,
  X,
  Save
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

interface Problem {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  status: 'new' | 'in-progress' | 'resolved' | 'prevention' | 'closed';
  clientId?: number;
  assignedTo?: number;
  rootCause?: string;
  preventionMeasures?: string;
  lessonsLearned?: string;
  resolutionTime?: number;
  clientImpact?: string;
  aiSuggestedCategory?: string;
  aiSuggestedSeverity?: string;
  aiSuggestedResolution?: string;
  createdById?: number;
  resolvedById?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProblemStats {
  totalProblems: number;
  criticalProblems: number;
  openProblems: number;
  resolvedProblems: number;
  avgResolutionTime: number;
}

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [filters, setFilters] = useState({
    severity: "all",
    status: "all",
    category: "all"
  });
  const [stats, setStats] = useState<ProblemStats>({
    totalProblems: 0,
    criticalProblems: 0,
    openProblems: 0,
    resolvedProblems: 0,
    avgResolutionTime: 0
  });

  const [newProblem, setNewProblem] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "",
    clientId: undefined as number | undefined,
    assignedTo: undefined as number | undefined
  });

  const [resolutionData, setResolutionData] = useState({
    rootCause: "",
    preventionMeasures: "",
    lessonsLearned: "",
    resolutionTime: 0,
    resolvedById: undefined as number | undefined
  });

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems');
      const data = await response.json();

      if (data.success) {
        setProblems(data.data);
      } else {
        toast.error("Failed to fetch problems");
      }
    } catch (err) {
      console.error("Problem Fetch Error:", err);
      toast.error("Error loading problems");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from problems
      const criticalCount = problems.filter(p => p.severity === 'critical').length;
      const openCount = problems.filter(p => p.status === 'new' || p.status === 'in-progress').length;
      const resolvedCount = problems.filter(p => p.status === 'resolved' || p.status === 'closed').length;

      const avgTime = problems
        .filter(p => p.resolutionTime)
        .reduce((sum, p) => sum + (p.resolutionTime || 0), 0) / (resolvedCount || 1);

      setStats({
        totalProblems: problems.length,
        criticalProblems: criticalCount,
        openProblems: openCount,
        resolvedProblems: resolvedCount,
        avgResolutionTime: Math.round(avgTime)
      });
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  const createProblem = async () => {
    if (!newProblem.title || !newProblem.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProblem)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Problem created successfully!");
        setShowCreateDialog(false);
        setNewProblem({
          title: "",
          description: "",
          severity: "medium",
          category: "",
          clientId: undefined,
          assignedTo: undefined
        });
        fetchProblems();
        fetchStats();

        if (data.aiCategorization) {
          toast.info(`AI categorized as: ${data.aiCategorization.suggestedCategory} (${data.aiCategorization.suggestedSeverity})`);
        }
      } else {
        toast.error(data.error || "Failed to create problem");
      }
    } catch (err) {
      toast.error("Error creating problem");
    }
  };

  const resolveProblem = async () => {
    if (!selectedProblem) return;

    try {
      const response = await fetch(`/api/problems/${selectedProblem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Problem resolved successfully!");
        setShowResolveDialog(false);
        setSelectedProblem(null);
        fetchProblems();
        fetchStats();
      } else {
        toast.error(data.error || "Failed to resolve problem");
      }
    } catch (err) {
      toast.error("Error resolving problem");
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filters.severity === "all" || problem.severity === filters.severity;
    const matchesStatus = filters.status === "all" || problem.status === filters.status;
    const matchesCategory = filters.category === "all" || problem.category === filters.category;

    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'prevention': return 'bg-purple-100 text-purple-700';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="w-3 h-3" />;
      case 'in-progress': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'prevention': return <Shield className="w-3 h-3" />;
      case 'closed': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Problem Tracking</h1>
          <p className="text-sm text-gray-500">Track issues, root causes, and prevention measures</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
                <Plus className="w-4 h-4 mr-2" />
                Create Problem
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Problem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs text-gray-600">Title *</label>
                  <Input
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                    placeholder="Brief problem title"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Description *</label>
                  <Textarea
                    value={newProblem.description}
                    onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                    placeholder="Detailed problem description"
                    className="bg-gray-50 border-gray-200 h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Severity</label>
                    <Select
                      value={newProblem.severity}
                      onValueChange={(value) => setNewProblem({...newProblem, severity: value})}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Category</label>
                    <Input
                      value={newProblem.category}
                      onChange={(e) => setNewProblem({...newProblem, category: e.target.value})}
                      placeholder="e.g., network, hardware"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-[#3ECF8E] text-black"
                  onClick={createProblem}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Create with AI Categorization
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
                <p className="text-xs text-blue-600 font-medium">Total Problems</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalProblems}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-700">{stats.criticalProblems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">Open</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.openProblems}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{stats.resolvedProblems}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Avg Resolution</p>
                <p className="text-2xl font-bold text-purple-700">{stats.avgResolutionTime}h</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Problem Details</TabsTrigger>
            <TabsTrigger value="root-cause">Root Cause Analysis</TabsTrigger>
            <TabsTrigger value="prevention">Prevention</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchProblems}
              className="border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search problems by title or description..."
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
                    <TableHead className="w-[250px]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Resolution Time</TableHead>
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
                  ) : filteredProblems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No problems found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProblems.map((problem) => (
                      <TableRow
                        key={problem.id}
                        className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedProblem(problem)}
                      >
                        <TableCell className="text-sm font-medium">#{problem.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-black">{problem.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{problem.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{problem.category || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(problem.severity)}>
                            {problem.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(problem.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(problem.status)}
                              <span className="capitalize">{problem.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(problem.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {problem.resolutionTime ? `${problem.resolutionTime}h` : '-'}
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

        {/* Problem Details Tab */}
        <TabsContent value="details">
          {selectedProblem ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>#{selectedProblem.id} - {selectedProblem.title}</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProblem(null)}>
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Problem Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600">Description</label>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedProblem.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Category</label>
                          <p className="text-sm font-medium capitalize mt-1">{selectedProblem.category || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Severity</label>
                          <Badge className={getSeverityColor(selectedProblem.severity) + " mt-1"}>
                            {selectedProblem.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Status</label>
                          <Badge className={getStatusColor(selectedProblem.status) + " mt-1"}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(selectedProblem.status)}
                              <span className="capitalize">{selectedProblem.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Resolution Time</label>
                          <p className="text-sm font-medium mt-1">{selectedProblem.resolutionTime ? `${selectedProblem.resolutionTime}h` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600">Created</p>
                          <p className="text-sm">{new Date(selectedProblem.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {selectedProblem.resolvedAt && (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-600">Resolved</p>
                            <p className="text-sm">{new Date(selectedProblem.resolvedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {selectedProblem.aiSuggestedCategory && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <p className="text-xs font-medium text-purple-600">AI Suggestions</p>
                          </div>
                          <p className="text-xs text-gray-600">Category: {selectedProblem.aiSuggestedCategory}</p>
                          <p className="text-xs text-gray-600">Severity: {selectedProblem.aiSuggestedSeverity?.toUpperCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedProblem.status !== 'resolved' && selectedProblem.status !== 'closed' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve Problem
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-gray-200 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Resolve Problem - Root Cause Analysis</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                              <Target className="w-3 h-3" />
                              Root Cause *
                            </label>
                            <Textarea
                              value={resolutionData.rootCause}
                              onChange={(e) => setResolutionData({...resolutionData, rootCause: e.target.value})}
                              placeholder="What was the underlying cause of this problem?"
                              className="bg-gray-50 border-gray-200 h-20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                              <Shield className="w-3 h-3" />
                              Prevention Measures *
                            </label>
                            <Textarea
                              value={resolutionData.preventionMeasures}
                              onChange={(e) => setResolutionData({...resolutionData, preventionMeasures: e.target.value})}
                              placeholder="What measures can prevent this from happening again?"
                              className="bg-gray-50 border-gray-200 h-20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 flex items-center gap-2">
                              <Lightbulb className="w-3 h-3" />
                              Lessons Learned *
                            </label>
                            <Textarea
                              value={resolutionData.lessonsLearned}
                              onChange={(e) => setResolutionData({...resolutionData, lessonsLearned: e.target.value})}
                              placeholder="What did we learn from this problem?"
                              className="bg-gray-50 border-gray-200 h-20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Resolution Time (hours)</label>
                            <Input
                              type="number"
                              value={resolutionData.resolutionTime}
                              onChange={(e) => setResolutionData({...resolutionData, resolutionTime: parseInt(e.target.value) || 0})}
                              placeholder="Time taken to resolve"
                              className="bg-gray-50 border-gray-200"
                            />
                          </div>
                          <Button
                            className="w-full bg-[#3ECF8E] text-black"
                            onClick={resolveProblem}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Resolution
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a problem to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Root Cause Analysis Tab */}
        <TabsContent value="root-cause">
          {selectedProblem ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Root Cause Analysis - #{selectedProblem.id}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProblem.rootCause ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-500" />
                        Root Cause
                      </h3>
                      <p className="text-sm bg-red-50 p-4 rounded-lg border border-red-200">{selectedProblem.rootCause}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Impact Analysis
                      </h3>
                      <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {selectedProblem.clientImpact || 'No impact analysis provided'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4" />
                    <p>No root cause analysis available for this problem</p>
                    {selectedProblem.status !== 'resolved' && selectedProblem.status !== 'closed' && (
                      <Button
                        className="mt-4 bg-[#3ECF8E] text-black"
                        onClick={() => setShowResolveDialog(true)}
                      >
                        Perform Root Cause Analysis
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a problem to view root cause analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prevention Tab */}
        <TabsContent value="prevention">
          {selectedProblem ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Prevention Measures - #{selectedProblem.id}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProblem.preventionMeasures ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Prevention Measures
                      </h3>
                      <p className="text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                        {selectedProblem.preventionMeasures}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Lessons Learned
                      </h3>
                      <p className="text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        {selectedProblem.lessonsLearned || 'No lessons learned documented'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4" />
                    <p>No prevention measures available for this problem</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a problem to view prevention measures</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}