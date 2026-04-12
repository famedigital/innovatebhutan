"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Eye, Edit2, Trash2, Filter, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function ProjectHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', clientId: '', status: 'planning', startDate: '' });

  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select(`*, clients(name), services(name)`)
        .order('createdAt', { ascending: false });

      setProjects(data || []);
    } catch (err) {
      console.error("Project Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    setClients(data || []);
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.clientId) {
      toast.error("Name and client required");
      return;
    }

    const { error } = await supabase.from('projects').insert({
      name: newProject.name,
      client_id: parseInt(newProject.clientId),
      status: newProject.status,
      start_date: newProject.startDate || null,
      end_date: newProject.endDate || null,
      budget: newProject.budget ? parseFloat(newProject.budget) : null,
    });

    if (error) {
      toast.error("Failed to create project");
    } else {
      toast.success("Project created");
      setShowCreate(false);
      setNewProject({ name: '', clientId: '', status: 'planning', startDate: '' });
      fetchProjects();
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Project deleted");
      fetchProjects();
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 w-64 bg-[#F3F3F1] border-[#E5E5E1] h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E5E1]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={fetchProjects} variant="outline" className="border-[#E5E5E1]">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold text-lg">Create New Project</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Project Name *</label>
                <Input 
                  placeholder="Enter project name"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Client *</label>
                <Select value={newProject.clientId} onValueChange={(v) => setNewProject({...newProject, clientId: v})}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Status</label>
                <Select value={newProject.status} onValueChange={(v) => setNewProject({...newProject, status: v})}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Start Date</label>
                <Input 
                  type="date"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-[#E5E5E1]" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">Project</TableHead>
                <TableHead className="text-xs text-[#717171]">Client</TableHead>
                <TableHead className="text-xs text-[#717171]">Service</TableHead>
                <TableHead className="text-xs text-[#717171]">Status</TableHead>
                <TableHead className="text-xs text-[#717171]">Progress</TableHead>
                <TableHead className="text-xs text-[#717171]">Start Date</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                <TableRow key={project.id} className="border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <TableCell className="font-medium text-sm">{project.name}</TableCell>
                  <TableCell className="text-sm">{project.clients?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-[#717171]">{project.services?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`${
                      project.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                      project.status === 'complete' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      project.status === 'testing' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    } text-[10px] px-2`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#F3F3F1] rounded-full overflow-hidden">
                        <div className="h-full bg-[#3ECF8E] rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-[#717171]">{project.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#717171]">
                    {loading ? 'Loading...' : 'No projects found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}