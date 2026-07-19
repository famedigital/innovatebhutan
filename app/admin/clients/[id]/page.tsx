"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin, Globe,
  FileText, Clock, DollarSign, AlertCircle, Wifi, Calendar,
  Shield, TrendingUp, Award, ExternalLink, Edit, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  active: boolean;
  contactPerson?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  whatsappGroupId?: string;
  whatsappGroupLink?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  tier?: string;
  slaLevel?: string;
  responseTimeTarget?: number;
  notes?: string;
  tags?: string[];
  meta?: {
    yearsWithUs?: number;
    totalPaid?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClientDetails extends Client {
  amcs?: Array<{
    id: number;
    contractNumber: string;
    startDate: string;
    endDate: string;
    amount: string;
    status: string;
  }>;
  invoices?: Array<{
    id: number;
    invoiceNumber: string;
    total: string;
    status: string;
    dueDate: string;
  }>;
  tickets?: Array<{
    id: number;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id ? parseInt(params.id) : null;

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);

      // Fetch client details with all related data
      const response = await fetch(`/api/clients/${clientId}/details`);
      const data = await response.json();

      if (data.success) {
        setClient(data.data);
      } else {
        toast.error(data.error || "Failed to load client details");
      }
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Client not found</p>
        <Link href="/admin/clients">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'expiring': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const activeAMCs = client.amcs?.filter(a => a.status === 'active') || [];
  const totalContractValue = activeAMCs.reduce((sum, amc) => sum + (parseFloat(amc.amount) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white font-bold text-2xl">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-sm text-gray-500">
                {client.contactPerson && `Contact: ${client.contactPerson}`}
                {client.contactPerson && client.industry && " • "}
                {client.industry && `Industry: ${client.industry}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${client.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'} px-3 py-1`}>
            {client.active ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Active AMCs</p>
                <p className="text-lg font-bold text-gray-900">{activeAMCs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Contract Value</p>
                <p className="text-lg font-bold text-gray-900">Nu. {(totalContractValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Client Tier</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{client.tier || 'Bronze'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Years With Us</p>
                <p className="text-lg font-bold text-gray-900">{client.meta?.yearsWithUs || 'New'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.contactPerson && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Contact Person</p>
                    <p className="text-sm font-medium">{client.contactPerson}</p>
                  </div>
                )}
                {client.email && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                    <a href={`mailto:${client.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone</p>
                    <a href={`tel:${client.phone}`} className="text-sm font-medium text-gray-900">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">WhatsApp</p>
                    <a
                      href={`https://wa.me/${client.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Wifi className="w-3 h-3" />
                      {client.whatsapp}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AMC Contracts */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  AMC Contracts
                </div>
                <Link href={`/admin/amc?clientId=${client.id}`}>
                  <Button variant="outline" size="sm" className="rounded-lg h-8">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.amcs && client.amcs.length > 0 ? (
                <div className="space-y-3">
                  {client.amcs.map((amc) => (
                    <div key={amc.id} className="p-3 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{amc.contractNumber}</span>
                            <Badge className={`${getStatusColor(amc.status)} text-[9px] px-2 py-0.5 h-auto rounded-full uppercase`}>
                              {amc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(amc.endDate).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-emerald-600">
                              Nu. {parseFloat(amc.amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AMC contracts</p>
                  <Link href="/admin/amc" className="text-xs text-emerald-600 hover:underline">
                    Create one →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.invoices && client.invoices.length > 0 ? (
                <div className="space-y-2">
                  {client.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">Nu. {parseFloat(invoice.total).toLocaleString()}</p>
                        <Badge className={`${getStatusColor(invoice.status)} text-[9px] px-2 py-0.5 h-auto rounded-full uppercase`}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No invoices yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.tickets && client.tickets.length > 0 ? (
                <div className="space-y-2">
                  {client.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-[9px] px-2 py-0.5 h-auto rounded-full uppercase" variant={
                          ticket.priority === 'high' ? 'destructive' :
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(ticket.status)} text-[9px] px-2 py-0.5 h-auto rounded-full uppercase`}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No support tickets - All good!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.whatsappGroupLink && (
                <a
                  href={client.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                >
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">WhatsApp Group</span>
                  <ExternalLink className="w-4 h-4 text-green-600 ml-auto" />
                </a>
              )}
              <Link href={`/admin/amc?clientId=${client.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">New AMC Contract</span>
                  <Plus className="w-4 h-4 text-emerald-600 ml-auto" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Location & Details */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.address && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm">{client.address}</p>
                </div>
              )}
              {(client.city || client.country) && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">City</p>
                  <p className="text-sm">{client.city}{client.city && client.country && ', '}{client.country}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.slaLevel && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">SLA Level</span>
                  <span className="text-sm font-medium capitalize">{client.slaLevel}</span>
                </div>
              )}
              {client.responseTimeTarget && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Response Time</span>
                  <span className="text-sm font-medium">{client.responseTimeTarget} min</span>
                </div>
              )}
              {client.companySize && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Company Size</span>
                  <span className="text-sm font-medium capitalize">{client.companySize}</span>
                </div>
              )}
              {client.meta?.totalPaid && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Paid</span>
                  <span className="text-sm font-bold text-emerald-600">Nu. {client.meta.totalPaid.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="border-gray-200/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
