# Admin UI Standards (shadcn)

## Rules

1. Import interactive chrome only from `@/components/ui/*` (`Button`, `Table`, `Dialog`, `AlertDialog`, `Select`, `Tabs`, `Card`, `Input`, `Form`, `Skeleton`, Sonner).
2. Use design tokens — never brand hex in admin:
   - Primary: `bg-primary` / `text-primary` (`#0A5F4E`)
   - Surfaces: `bg-background`, `bg-muted`, `bg-card`
   - Text: `text-foreground`, `text-muted-foreground`
   - Borders: `border-border`
3. Lists use `Table`; confirms use `AlertDialog`; toasts use Sonner.
4. ERP mutations go UI → `/api/*` → service → repository (no direct browser Supabase writes).
5. Tokens live in `app/globals.css` (`:root` / `.dark`). Keep shadcn semantic vars defined (`--muted`, `--accent`, `--ring`, `--secondary`, `--popover`, `--input`, sidebar set).

## Radius

`--radius: 0.625rem` for ERP density.
