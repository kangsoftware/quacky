import { NextRequest, NextResponse } from "next/server";

import { Users } from "@/quacky";

type RouteParams = { params: Promise<{ handle: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { handle } = await params;

    if (!handle) {
        return NextResponse.json(
            { success: false, error: "Missing handle" },
            { status: 400 }
        );
    }

    const result = await Users.getUserbyHandle(handle);

    if (!result.success || !result.user) {
        return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
        );
    }

    const user = result.user;

    if (user.banned) {
        return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
        );
    }

    const statsResult = await Users.getFollowStats(user.id);
    const followStats = statsResult.success
        ? { followers: statsResult.followers ?? 0, following: statsResult.following ?? 0 }
        : { followers: 0, following: 0 };

    return NextResponse.json(
        {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                handle: user.handle,
                bio: user.bio ?? null,
                image: user.image ?? null,
                verified: user.verified,
                privateAccount: user.privateAccount,
                role: user.role,
                createdAt: user.createdAt,
                ...followStats,
            },
        },
        { status: 200 }
    );
}
