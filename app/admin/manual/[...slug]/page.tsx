import { notFound } from "next/navigation";
import { ManualProse } from "@/components/manual/manual-prose";
import { allManualDocs, getManualDoc } from "@/lib/manual/catalog";
import { loadManualPage } from "@/lib/manual/load";
import { Badge } from "@/components/ui/badge";

export function generateStaticParams() {
  return allManualDocs().map((d) => ({ slug: [d.slug] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: parts } = await params;
  const slug = parts?.join("/") || "overview";
  const doc = getManualDoc(slug);
  return {
    title: doc ? `${doc.title} · ERP Manual` : "ERP Manual",
    description: doc?.description,
  };
}

export default async function ManualArticlePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: parts } = await params;
  const slug = parts?.join("/") || "overview";
  const page = await loadManualPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-normal">
            Staff manual
          </Badge>
          {page.updated && (
            <span className="text-muted-foreground text-xs">
              Updated {page.updated}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
        {page.description && (
          <p className="text-muted-foreground text-base">{page.description}</p>
        )}
        <p className="text-muted-foreground font-mono text-[11px]">
          {page.file}
        </p>
      </div>
      <ManualProse content={page.content} />
    </div>
  );
}
