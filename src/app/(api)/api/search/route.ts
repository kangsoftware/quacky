import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { Posts, Users } from "@/quacky";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim() ?? "";
        const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
        const limit = Number.isFinite(rawLimit)
            ? Math.min(Math.max(Math.floor(rawLimit), 1), MAX_LIMIT)
            : DEFAULT_LIMIT;

        if (!query) {
            return NextResponse.json(
                { success: false, error: "Missing search query" },
                { status: 400 }
            );
        }

        const [usersResult, postsResult] = await Promise.all([
            Users.search(query, limit),
            Posts.search(query, limit),
        ]);

        if (!usersResult.success || !postsResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: usersResult.error ?? postsResult.error ?? "Search failed",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                query,
                users: usersResult.users,
                posts: postsResult.posts,
            },
            { status: 200 }
        );

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
