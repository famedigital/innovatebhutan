"use client";

import Link from "next/link";
import { FileText, ArrowRight, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const LINKS = [
  {
    href: "/admin/products/website/invoice-design",
    title: "Invoice design",
    description: "Letterhead, numbering, GST, terms for Website invoices",
    icon: FileText,
  },
];

export default function WebsiteHubPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Website"
        description="Product desk — completed website projects and invoices"
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/projects">
              Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full shadow-none transition-colors group-hover:border-premium/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-primary">Open</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        <Card className="shadow-none opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Client sites
            </CardTitle>
            <CardDescription>
              Completed projects will appear here as Website → client accounts.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
