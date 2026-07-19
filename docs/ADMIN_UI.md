# Admin UI Standards (shadcn)

## Rules

1. Import interactive chrome only from `@/components/ui/*` (`Button`, `Table`, `Dialog`, `AlertDialog`, `Select`, `Tabs`, `Card`, `Input`, `Form`, `Skeleton`, `Item`, `Drawer`, Sonner).
2. Use design tokens — never brand hex in admin:
   - Surfaces: `bg-background` (warm stone), `bg-card`, `bg-muted`, `bg-secondary`
   - Text: `text-foreground`, `text-muted-foreground`
   - Borders: `border-border`
   - Premium metal: `text-premium` / `border-premium` / `bg-premium` (`#B8956A` champagne)
   - Brand emerald: `bg-primary` / `text-primary` (`#0A5F4E`) — **green budget below**
3. Lists: `Table` on `md+`, `Item` rows on mobile (`AdminPageHeader` + `ResponsiveDataList`).
4. Confirms use `AlertDialog`; toasts use Sonner.
5. ERP mutations go UI → `/api/*` → service → repository (no direct browser Supabase writes).
6. Tokens live in `app/globals.css` (`:root` / `.dark`). Keep shadcn semantic vars + sidebar + `--premium` mapped in `@theme inline`.

## Green budget (avoid fatigue)

Emerald is a **sparse brand accent**, not the page color:

- At most **one** solid `bg-primary` CTA per view
- Active nav: icon `text-primary` + small `bg-premium` indicator — not full green fills
- Focus ring may use primary; body text and page washes must not
- No mint/sage page backgrounds, green gradients, or neon glows in admin
- Status: prefer `secondary` / outline badges; green only for true success/paid/active
- Secondary actions: `outline` or champagne border — not green outlines everywhere

## Radius

`--radius: 0.625rem` for ERP density.
