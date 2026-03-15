"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Read stored theme preference or use system preference
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle("dark", shouldUseDark);
  }, []);

  return <>{children}</>;
}
