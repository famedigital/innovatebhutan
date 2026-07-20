"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type PwaContextValue = {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  install: () => Promise<boolean>;
};

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isInstalled: false,
  isStandalone: false,
  install: async () => false,
});

/** Module singletons — survive Strict Mode remounts without re-binding BIP. */
let deferredPromptSingleton: BeforeInstallPromptEvent | null = null;
let bipBootstrapped = false;
const deferredSubscribers = new Set<
  (event: BeforeInstallPromptEvent | null) => void
>();

function notifyDeferred(event: BeforeInstallPromptEvent | null) {
  deferredPromptSingleton = event;
  deferredSubscribers.forEach((fn) => fn(event));
}

function detectStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    deferredPromptSingleton
  );
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(detectStandalone());
    deferredSubscribers.add(setDeferred);
    if (deferredPromptSingleton) setDeferred(deferredPromptSingleton);

    if (!bipBootstrapped) {
      bipBootstrapped = true;
      window.addEventListener("beforeinstallprompt", (e) => {
        // Custom InstallAppButton owns the prompt — suppress native banner.
        e.preventDefault();
        notifyDeferred(e as BeforeInstallPromptEvent);
      });
      window.addEventListener("appinstalled", () => {
        notifyDeferred(null);
      });
    }

    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch(() => {});
    }

    return () => {
      deferredSubscribers.delete(setDeferred);
    };
  }, []);

  useEffect(() => {
    if (!deferredPromptSingleton) return;
    const onInstalled = () => setIsStandalone(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const install = useCallback(async () => {
    const event = deferred || deferredPromptSingleton;
    if (!event) return false;
    await event.prompt();
    const choice = await event.userChoice;
    notifyDeferred(null);
    return choice.outcome === "accepted";
  }, [deferred]);

  const value = useMemo(
    () => ({
      canInstall: !!deferred && !isStandalone,
      isInstalled: isStandalone,
      isStandalone,
      install,
    }),
    [deferred, isStandalone, install]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  return useContext(PwaContext);
}
