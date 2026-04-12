"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * 🌗 THEME PROVIDER (REACT 19 STABLE)
 * Optimized for React 19 / Next.js 16 / Turbopack.
 * Disables automated script injection to prevent 'Encountered a script tag' errors.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure next-themes doesn't inject the FOUC script during the render pass
  return (
    <NextThemesProvider 
      {...props} 
      enableColorScheme={false} // Prevents forbidden script injection in React 19
    >
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </NextThemesProvider>
  );
}
