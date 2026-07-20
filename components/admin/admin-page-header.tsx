import { cn } from "@/lib/utils";

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** @deprecated Path breadcrumbs render in the admin layout header */
  breadcrumbs?: AdminBreadcrumb[];
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: Props) {
  return (
    <div className={cn("admin-page-header space-y-3 pb-1", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
