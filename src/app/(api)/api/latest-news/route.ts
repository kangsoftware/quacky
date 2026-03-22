// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    return NextResponse.json(
        {
            updated: "2024-06-01T12:00:00Z",
            news: [
                // {
                //     id: "1",
                //     category: "Quacky Release",
                //     title: "Quacky alpha-v1.1 Released with New Features",
                //     link: "https://linuskang.au/blog/quacky-release-notes",
                //     time: "2026-03-22T12:00:00Z"
                // },
                // {
                //     id: "2",
                //     category: "Technology",
                //     title: "New AI Breakthrough Promises to Revolutionize Healthcare",
                //     link: "https://example.com/news/ai-healthcare-breakthrough",
                //     time: "2024-03-01T11:00:00Z"
                // },
                // {
                //     id: "3",
                //     category: "Sports",
                //     title: "Local Team Wins Championship in Thrilling Finale",
                //     link: "https://example.com/news/local-team-championship",
                //     time: "2024-06-01T09:30:00Z"
                // }
            ]
        }

    )

}
