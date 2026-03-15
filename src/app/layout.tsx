import type { Metadata } from "next";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

import { env } from "@/env";

import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: env.APP_NAME,
    description: env.APP_DESCRIPTION,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                const storedTheme = localStorage.getItem("theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
                if (shouldUseDark) {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
                    }}
                />
            </head>
            <body
                className={lexend.className}
            >
                <ThemeProvider>
                    <TooltipProvider>
                        <div className="pt-0">{children}</div>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
