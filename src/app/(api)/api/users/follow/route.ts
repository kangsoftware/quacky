import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { NotifyService, Users } from "@/quacky";

export async function GET(request: NextRequest) {
    const targetUserId = request.nextUrl.searchParams.get("userId");
    const mode = request.nextUrl.searchParams.get("mode");

    if (!targetUserId) {
        return NextResponse.json(
            { success: false, error: "Missing userId" },
            { status: 400 }
        );
    }

    if (mode === "stats") {
        const stats = await Users.getFollowStats(targetUserId);

        if (!stats.success) {
            return NextResponse.json(
                { success: false, error: stats.error ?? "Failed to fetch follow stats" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                following: stats.following,
                followers: stats.followers,
            },
            { status: 200 }
        );
    }

    const session = await auth.api.getSession(request);

    if (!session?.user?.id) {
        return NextResponse.json(
            { success: true, following: false },
            { status: 200 }
        );
    }

    const result = await Users.isFollowing(session.user.id, targetUserId);

    if (!result.success) {
        return NextResponse.json(
            { success: false, error: result.error ?? "Failed to fetch follow status" },
            { status: 400 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            following: result.following,
        },
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const targetUserId = body?.userId;

        if (!targetUserId || typeof targetUserId !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid target user" },
                { status: 400 }
            );
        }

        const result = await Users.follow(session.user.id, targetUserId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? "Failed to follow user" },
                { status: 400 }
            );
        }

        if (targetUserId !== session.user.id) {
            await NotifyService.create(
                targetUserId,
                "FOLLOW",
                "started following you",
                session.user.id
            );
        }

        return NextResponse.json(
            { success: true, following: true },
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

export async function DELETE(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const targetUserId = body?.userId;

        if (!targetUserId || typeof targetUserId !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid target user" },
                { status: 400 }
            );
        }

        const result = await Users.unfollow(session.user.id, targetUserId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? "Failed to unfollow user" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: true, following: false },
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
