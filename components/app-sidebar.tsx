"use client";

import * as React from "react";
import {
  LayoutGrid,
  Users,
  Briefcase,
  UserCircle,
  CreditCard,
  Settings,
  Zap,
  HelpCircle,
  MessageSquare,
  Folder,
  Terminal,
  Image,
  Globe,
  TrendingUp,
  FileText,
  FileCheck,
  Brain,
  BookOpen,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

const menuItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/admin" },
  { title: "Clients", icon: Users, url: "/admin/clients" },
  { title: "AMC Contracts", icon: FileCheck, url: "/admin/amc" },
  { title: "Invoices", icon: FileText, url: "/admin/invoice" },
  { title: "Blog & Content", icon: BookOpen, url: "/admin/blog" },
  { title: "Services", icon: Briefcase, url: "/admin/services" },
  { title: "HR & Payroll", icon: UserCircle, url: "/admin/hr" },
  { title: "Finance", icon: CreditCard, url: "/admin/finance" },
  { title: "Projects", icon: Folder, url: "/admin/projects" },
  { title: "Tickets", icon: Zap, url: "/admin/tickets" },
  { title: "WhatsApp", icon: MessageSquare, url: "/admin/whatsapp" },
  { title: "Bot Training", icon: Brain, url: "/admin/ai/bot-training" },
  { title: "Marketing", icon: TrendingUp, url: "/admin/marketing" },
  { title: "Website", icon: Globe, url: "/admin/website" },
  { title: "Media", icon: Image, url: "/admin/media" },
  { title: "Settings", icon: Settings, url: "/admin/settings" },
  { title: "Support", icon: HelpCircle, url: "/admin/support" },
  { title: "Docs", icon: FileText, url: "/admin/docs" },
];

export function AppSidebar() {
  const { user } = useUser();
  const router = useRouter();

  const handleClick = (url: string) => {
    router.push(url);
  };

  return (
    <div className="fixed left-0 top-0 h-screen bg-white dark:bg-[#0A0A0A] border-r border-[#E5E5E1] dark:border-[#2A2A2A] z-40 w-64">
      <div className="p-4 border-b border-[#E5E5E1] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#3ECF8E] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#1A1A1A] dark:text-white">Innovate ERP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => (
          <button 
            key={item.title}
            onClick={() => handleClick(item.url)}
            className="flex items-center gap-3 py-2 px-4 w-full text-left text-[#717171] dark:text-[#A3A3A3] hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A] hover:text-black dark:hover:text-white transition-all rounded-lg mx-2 my-0.5"
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="text-sm">{item.title}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-[#E5E5E1] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F3F3F1] dark:bg-[#1A1A1A] border border-[#E5E5E1] dark:border-[#3A3A3A] overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-[#3ECF8E]" />
          </div>
          <div className="flex-col min-w-0">
            <span className="text-sm font-medium text-[#1A1A1A] dark:text-white truncate">{user?.email?.split('@')[0] || "Admin"}</span>
            <span className="text-[10px] font-semibold text-[#717171] dark:text-[#A3A3A3] uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}