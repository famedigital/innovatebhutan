"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeProviderContext | undefined>(undefined);

/**
 * 🛰️ PURE THEME PROVIDER (REACT 19 STABLE)
 * Zero-script injection strategy to resolve hydration mismatches.
 * Directly manages the 'dark' class on the document element.
 */
export function PureThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("innovate-erp-theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setThemeState(initialTheme);
    setMounted(true);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("innovate-erp-theme", newTheme);
    applyTheme(newTheme);
  };

  const value = React.useMemo(() => ({ theme, setTheme }), [theme]);

  // Prevent flash by hiding children until theme is resolved
  // Note: Root Layout usually handles the background to prevent jarring flashes
  return (
    <ThemeContext.Provider value={value}>
      <div className={mounted ? "" : "opacity-0 invisible h-0"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a PureThemeProvider");
  }
  return context;
};
