"use client";

import { BookOpen, Search, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const docsSections = [
  {
    title: "Getting Started",
    items: [
      { title: "What is Innovate ERP?", description: "Overview of the system" },
      { title: "Quick Start Guide", description: "Get up and running in 5 minutes" },
      { title: "Dashboard Tour", description: "Understanding the main dashboard" },
    ]
  },
  {
    title: "Client Management",
    items: [
      { title: "Adding New Clients", description: "How to add clients and their details" },
      { title: "Managing AMC", description: "Annual Maintenance Contract management" },
      { title: "WhatsApp Integration", description: "Connecting clients to WhatsApp" },
    ]
  },
  {
    title: "HR & Payroll",
    items: [
      { title: "Adding Employees", description: "Employee onboarding process" },
      { title: "Attendance Tracking", description: "Managing staff attendance" },
      { title: "Payroll Setup", description: "Setting up salary and deductions" },
    ]
  },
  {
    title: "Projects",
    items: [
      { title: "Creating Projects", description: "How to create and manage projects" },
      { title: "Project Tracking", description: "Monitoring project progress" },
    ]
  },
  {
    title: "Tickets & Support",
    items: [
      { title: "Creating Tickets", description: "Managing support tickets" },
      { title: "Ticket Workflow", description: "From open to resolved" },
    ]
  },
  {
    title: "WhatsApp Bot",
    items: [
      { title: "Bot Setup", description: "Configuring WhatsApp API" },
      { title: "AI Responses", description: "How the AI auto-replies work" },
      { title: "Webhook Configuration", description: "Setting up webhooks" },
    ]
  },
  {
    title: "Settings & API",
    items: [
      { title: "API Keys Setup", description: "Configuring Gemini and WhatsApp APIs" },
      { title: "White-label Branding", description: "Customizing for your brand" },
    ]
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">ERP Documentation</h1>
          <p className="text-sm text-[#717171]">Complete manual for Innovate ERP</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
        <Input 
          placeholder="Search documentation..." 
          className="pl-9 bg-[#F3F3F1] border-[#E5E5E1]"
        />
      </div>

      {/* Getting Started Card */}
      <Card className="border-[#3ECF8E]/30 bg-[#3ECF8E]/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3ECF8E]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <div>
              <h3 className="font-medium">Welcome to Innovate ERP</h3>
              <p className="text-xs text-[#717171]">Complete guide to managing your IT business</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-2 rounded hover:bg-[#F3F3F1] text-left transition-colors">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-[#717171]">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#717171]" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">External Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <a href="https://supabase.com/docs" target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-[#F3F3F1] rounded-lg text-xs hover:bg-[#E5E5E1]">
              Supabase Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://cloud.google.com/generative-ai" target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-[#F3F3F1] rounded-lg text-xs hover:bg-[#E5E5E1]">
              Gemini API <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-[#F3F3F1] rounded-lg text-xs hover:bg-[#E5E5E1]">
              WhatsApp API <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}