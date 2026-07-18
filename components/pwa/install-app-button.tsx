"use client";

import { Download, CheckCircle2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/components/pwa/pwa-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
};

export function InstallAppButton({
  className,
  variant = "outline",
  size = "default",
  fullWidth,
}: Props) {
  const { canInstall, isStandalone, install } = usePwa();
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

  const handleClick = async () => {
    if (canInstall) {
      const ok = await install();
      if (ok) toast.success("Innovates ERP installed on this device");
      return;
    }

    if (isIOS) {
      toast.message("Install on iPhone", {
        description: "Tap Share → Add to Home Screen to install the ERP app.",
        duration: 6000,
      });
      return;
    }

    toast.message("Install available soon", {
      description:
        "Open this site in Chrome/Edge on your phone, then use the browser menu → Install app.",
      duration: 6000,
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(fullWidth && "w-full", className)}
    >
      {isIOS && !canInstall ? (
        <Share className="w-4 h-4 mr-2" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {canInstall ? "Install ERP App" : isIOS ? "Add to Home Screen" : "Install ERP App"}
    </Button>
  );
}
