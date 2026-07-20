"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, Share, Smartphone } from "lucide-react";
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
  showFallback?: boolean;
};

export function InstallAppButton({
  className,
  variant = "outline",
  size = "default",
  fullWidth,
  showFallback = true,
}: Props) {
  const { canInstall, isStandalone, install } = usePwa();
  const [helpOpen, setHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

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

  const handleClick = async () => {
    if (canInstall) {
      const ok = await install();
      if (ok) toast.success("Innovates ERP installed");
      return;
    }
    setHelpOpen(true);
  };

  // SSR + first client paint: identical (no navigator branch)
  const showIos = mounted && isIOS;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn(fullWidth && "w-full", "border-premium/50", className)}
      >
        {showIos ? (
          <Share className="w-4 h-4 mr-2" />
        ) : canInstall ? (
          <Download className="w-4 h-4 mr-2" />
        ) : (
          <Smartphone className="w-4 h-4 mr-2" />
        )}
        {canInstall
          ? "Install app"
          : showIos
            ? "Add to Home Screen"
            : "Install app"}
      </Button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Innovates ERP</DialogTitle>
            <DialogDescription>
              {canInstall
                ? "Your browser can install this app now."
                : "Browsers only show a native install prompt after criteria are met. Use the steps below."}
            </DialogDescription>
          </DialogHeader>
          {showIos ? (
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Tap the Share button in Safari</li>
              <li>Scroll and choose Add to Home Screen</li>
              <li>Confirm Add</li>
            </ol>
          ) : (
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Open this site in Chrome or Edge on your phone (HTTPS)</li>
              <li>Tap the browser menu (⋮)</li>
              <li>Choose Install app / Add to Home screen</li>
              <li>
                If that option is missing, stay on the site a minute and refresh —
                Chrome may delay the install prompt
              </li>
            </ol>
          )}
          {canInstall && (
            <Button
              className="w-full mt-2"
              onClick={async () => {
                const ok = await install();
                if (ok) {
                  toast.success("Installed");
                  setHelpOpen(false);
                }
              }}
            >
              Install now
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
