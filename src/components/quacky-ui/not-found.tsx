// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NotFoundProps {
    compact?: boolean;
}

export default function NotFound({ compact = false }: NotFoundProps) {
    const outerClass = compact
        ? "w-full flex justify-center"
        : "min-h-screen flex justify-center bg-background dark:bg-background px-4";

    const panelClass = compact
        ? "w-full flex flex-col justify-center items-center h-full gap-4 p-6 rounded-xl border border-border bg-[var(--lynt)] text-center"
        : "flex flex-col items-center gap-8 text-center max-w-md";

    return (
        <div className={outerClass}>
            <div className={panelClass}>
                <div className="flex flex-col gap-4">
                    <h1 className="text-5xl font-bold text-primary dark:text-primary tracking-tight">404</h1>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-semibold text-primary dark:text-primary">Page Not Found</h2>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="pt-4">
                        <Link href="/">
                            <Button className="w-full">Go Home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
