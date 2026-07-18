import { Download } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-background text-foreground text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Download className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Innovates ERP needs a connection for live data. Reconnect, then open Dashboard, AMC, or
        Tickets again.
      </p>
      <a
        href="/login/"
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Back to sign in
      </a>
    </div>
  );
}
