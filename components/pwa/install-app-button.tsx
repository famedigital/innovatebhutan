"use client";

import { useState } from "react";
import { Download, CheckCircle2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwa } from "@/components/pwa/pwa-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  /** When true, show muted hint even if install prompt is unavailable */
  showFallback?: boolean;
};

export function InstallAppButton({
  className,
  variant = "outline",
  size = "default",
  fullWidth,
  showFallback = false,
}: Props) {
  const { canInstall, isStandalone, install } = usePwa();
  const [iosOpen, setIosOpen] = useState(false);
  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isStandalone) {
    return (
      <Button
        type="button"
        variant="secondary"
        size={size}
        disabled
        className={cn(fullWidth && "w-full", className)}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        App installed
      </Button>
    );
  }

  // Browser can show native install prompt
  if (canInstall) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={async () => {
          const ok = await install();
          if (ok) toast.success("Innovates ERP installed");
        }}
        className={cn(fullWidth && "w-full", "border-premium/50", className)}
      >
        <Download className="w-4 h-4 mr-2" />
        Install app
      </Button>
    );
  }

  // iOS: guide Add to Home Screen
  if (isIOS) {
    return (
      <>
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={() => setIosOpen(true)}
          className={cn(fullWidth && "w-full", "border-premium/50", className)}
        >
          <Share className="w-4 h-4 mr-2" />
          Add to Home Screen
        </Button>
        <Dialog open={iosOpen} onOpenChange={setIosOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install on iPhone</DialogTitle>
              <DialogDescription>
                Safari does not support a one-tap install button. Use Share instead.
              </DialogDescription>
            </DialogHeader>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground">
              <li>Tap the Share button in Safari</li>
              <li>Scroll and tap Add to Home Screen</li>
              <li>Confirm Add — Innovates ERP opens like an app</li>
            </ol>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!showFallback) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled
      className={cn(fullWidth && "w-full", "text-muted-foreground", className)}
    >
      Open in Chrome to install
    </Button>
  );
}
