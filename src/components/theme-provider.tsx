// Generated from shadcn/ui

"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    const root = document.documentElement;
    root.classList.toggle("dark", shouldUseDark);
  }, []);

  return <>{children}</>;
}
