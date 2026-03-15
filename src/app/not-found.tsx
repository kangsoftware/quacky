// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import NotFound from "@/components/quacky-ui/not-found";
import RightSidebar from "@/components/quacky-ui/discover";
import Sidebar from "@/components/quacky-ui/sidebar";

export default function PageNotFound() {
    return (

        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar />
                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">

                    <NotFound compact />

                </div>
                <RightSidebar />
            </div>
        </main>

    )
}
