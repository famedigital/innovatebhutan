"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Plus,
  ChevronRight,
  Settings,
  Calendar,
  BarChart3,
  Target,
  Brain,
  Shield,
  Star
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TeamMember {
  teamMemberId: number;
  teamMemberName: string;
  currentWorkload: number;
  maxCapacity: number;
  utilizationRate: number;
  skills: string[];
  specializations: string[];
  performanceScore?: number;
  clientSatisfactionScore?: number;
  averageResponseTime?: number;
  averageResolutionTime?: number;
}

interface WorkloadOverview {
  teamMemberId: number;
  teamMemberName: string;
  currentWorkload: number;
  maxCapacity: number;
  utilizationRate: number;
}

interface TeamStats {
  totalTeamMembers: number;
  activeTeamMembers: number;
  averageUtilization: number;
  totalWorkload: number;
  availableCapacity: number;
}

export default function TeamManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workloadOverview, setWorkloadOverview] = useState<WorkloadOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    skill: "all",
    availability: "all",
    performance: "all"
  });
  const [stats, setStats] = useState<TeamStats>({
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    averageUtilization: 0,
    totalWorkload: 0,
    availableCapacity: 0
  });

  useEffect(() => {
    fetchTeamData();
    fetchWorkloadOverview();
    fetchStats();
  }, []);

  const fetchTeamData = async () => {
    try {
      // Fetch team members from employees table with enhanced fields
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (data.success && data.employees) {
        // Transform employees to team members format
        const members = data.employees.map((emp: any) => ({
          teamMemberId: emp.id,
          teamMemberName: emp.name,
          currentWorkload: emp.currentWorkload || 0,
          maxCapacity: emp.maxConcurrentProblems || 5,
          utilizationRate: ((emp.currentWorkload || 0) / (emp.maxConcurrentProblems || 5)) * 100,
          skills: emp.skills || [],
          specializations: emp.specializations || [],
          performanceScore: 80, // Would come from performance metrics
          clientSatisfactionScore: 4.5,
          averageResponseTime: 30,
          averageResolutionTime: 120
        }));
        setTeamMembers(members);
      }
    } catch (err) {
      console.error("Team Fetch Error:", err);
      toast.error("Error loading team data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkloadOverview = async () => {
    try {
      const response = await fetch('/api/team?endpoint=workload');
      const data = await response.json();

      if (data.success) {
        setWorkloadOverview(data.data || []);
      }
    } catch (err) {
      console.error("Workload Fetch Error:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const totalMembers = teamMembers.length;
      const activeMembers = teamMembers.filter(m => m.utilizationRate < 100).length;
      const avgUtil = teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.utilizationRate, 0) / teamMembers.length
        : 0;
      const totalWork = teamMembers.reduce((sum, m) => sum + m.currentWorkload, 0);
      const availableCap = teamMembers.reduce((sum, m) => sum + (m.maxCapacity - m.currentWorkload), 0);

      setStats({
        totalTeamMembers: totalMembers,
        activeTeamMembers: activeMembers,
        averageUtilization: Math.round(avgUtil),
        totalWorkload: totalWork,
        availableCapacity: availableCap
      });
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-100';
    if (rate >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getPerformanceIcon = (score?: number) => {
    if (!score) return <Activity className="w-4 h-4" />;
    if (score >= 90) return <Star className="w-4 h-4 text-yellow-500" />;
    if (score >= 80) return <Award className="w-4 h-4 text-blue-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getAvailabilityStatus = (member: TeamMember) => {
    if (member.utilizationRate >= 100) return { status: 'full', color: 'bg-red-100 text-red-700', text: 'At Capacity' };
    if (member.utilizationRate >= 70) return { status: 'limited', color: 'bg-yellow-100 text-yellow-700', text: 'Limited' };
    return { status: 'available', color: 'bg-green-100 text-green-700', text: 'Available' };
  };

  const handleAIAssign = async (teamMemberId: number) => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate-optimal',
          clientId: 1, // Would be selected from UI
          problemData: {
            category: 'network',
            severity: 'high'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`AI recommends team member #${data.data.recommendedTeamMemberId} with ${Math.round(data.data.confidence * 100)}% confidence`);
      }
    } catch (err) {
      toast.error("Error calculating optimal assignment");
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.teamMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAvailability = filters.availability === "all" ||
      (filters.availability === "available" && member.utilizationRate < 70) ||
      (filters.availability === "limited" && member.utilizationRate >= 70 && member.utilizationRate < 100) ||
      (filters.availability === "full" && member.utilizationRate >= 100);

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Team Management</h1>
          <p className="text-sm text-gray-500">AI-optimized team routing and workload balancing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
            <Brain className="w-4 h-4 mr-2" />
            AI Optimize Assignments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Team Members</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalTeamMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-700">{stats.activeTeamMembers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Avg Utilization</p>
                <p className="text-2xl font-bold text-purple-700">{stats.averageUtilization}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">Total Workload</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.totalWorkload}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Available Slots</p>
                <p className="text-2xl font-bold text-orange-700">{stats.availableCapacity}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <Select
              value={filters.availability}
              onValueChange={(value) => setFilters({...filters, availability: value})}
            >
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="full">At Capacity</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchTeamData}
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
                    placeholder="Search team members or skills..."
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
                    <TableHead className="w-[200px]">Team Member</TableHead>
                    <TableHead>Current Workload</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Performance</TableHead>
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
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No team members found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => {
                      const availability = getAvailabilityStatus(member);
                      return (
                        <TableRow
                          key={member.teamMemberId}
                          className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedMember(member)}
                        >
                          <TableCell className="text-sm font-medium">#{member.teamMemberId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {member.teamMemberName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-black">{member.teamMemberName}</p>
                                <p className="text-xs text-gray-500">ID: {member.teamMemberId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{member.currentWorkload} / {member.maxCapacity}</p>
                              <Progress value={member.utilizationRate} className="h-1 mt-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium ${getUtilizationColor(member.utilizationRate)}`}>
                              {Math.round(member.utilizationRate)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={availability.color}>
                              {availability.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.slice(0, 2).map((skill, idx) => (
                                <Badge key={idx} className="bg-blue-50 text-blue-700 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 2 && (
                                <span className="text-xs text-gray-500">+{member.skills.length - 2}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPerformanceIcon(member.performanceScore)}
                              <span className="text-sm font-medium">{member.performanceScore || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAIAssign(member.teamMemberId);
                              }}
                              className="text-[#3ECF8E] hover:text-[#34b27b]"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
              <p className="text-sm text-gray-500">Real-time workload overview and balancing</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workloadOverview.map((member) => (
                  <div key={member.teamMemberId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.teamMemberName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-black">{member.teamMemberName}</p>
                          <p className="text-xs text-gray-500">ID: {member.teamMemberId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.currentWorkload} / {member.maxCapacity}</p>
                        <p className={`text-xs ${getUtilizationColor(member.utilizationRate)}`}>
                          {Math.round(member.utilizationRate)}% utilized
                        </p>
                      </div>
                    </div>
                    <Progress value={member.utilizationRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <p className="text-sm text-gray-500">Team performance metrics and KPIs</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.teamMemberId} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {member.teamMemberName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-black">{member.teamMemberName}</p>
                          <p className="text-xs text-gray-500">ID: {member.teamMemberId}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Performance Score</span>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(member.performanceScore)}
                            <span className="text-sm font-medium">{member.performanceScore || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Client Satisfaction</span>
                          <span className="text-sm font-medium">⭐ {member.clientSatisfactionScore || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Avg Response Time</span>
                          <span className="text-sm font-medium">{member.averageResponseTime || 'N/A'}m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Avg Resolution Time</span>
                          <span className="text-sm font-medium">{member.averageResolutionTime || 'N/A'}m</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Matrix Tab */}
        <TabsContent value="skills">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Skills Matrix</CardTitle>
              <p className="text-sm text-gray-500">Team capabilities and specializations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.teamMemberId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {member.teamMemberName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-black">{member.teamMemberName}</p>
                        <p className="text-xs text-gray-500">ID: {member.teamMemberId}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {member.skills.map((skill, idx) => (
                            <Badge key={idx} className="bg-blue-50 text-blue-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {member.specializations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Specializations</p>
                          <div className="flex flex-wrap gap-2">
                            {member.specializations.map((spec, idx) => (
                              <Badge key={idx} className="bg-purple-50 text-purple-700">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Member Details Panel */}
      {selectedMember && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedMember.teamMemberName} - Details</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Workload</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Current</span>
                    <span className="text-sm font-medium">{selectedMember.currentWorkload} / {selectedMember.maxCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Utilization</span>
                    <span className={`text-sm font-medium ${getUtilizationColor(selectedMember.utilizationRate)}`}>
                      {Math.round(selectedMember.utilizationRate)}%
                    </span>
                  </div>
                  <Progress value={selectedMember.utilizationRate} className="h-2" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Score</span>
                    <span className="text-sm font-medium">{selectedMember.performanceScore || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Satisfaction</span>
                    <span className="text-sm font-medium">⭐ {selectedMember.clientSatisfactionScore || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{selectedMember.averageResponseTime || 'N/A'}m</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Capabilities</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMember.skills.map((skill, idx) => (
                        <Badge key={idx} className="bg-blue-50 text-blue-700 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}