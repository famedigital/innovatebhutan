"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy /client → unified /portal */
export default function ClientRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/portal");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
