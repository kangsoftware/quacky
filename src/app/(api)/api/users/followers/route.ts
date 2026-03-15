import { NextRequest, NextResponse } from "next/server";

import { Users } from "@/quacky";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 50);

    if (!userId) {
        return NextResponse.json(
            { success: false, error: "Missing userId" },
            { status: 400 }
        );
    }

    const result = await Users.getFollowers(userId, Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50);

    if (!result.success) {
        return NextResponse.json(
            { success: false, error: result.error ?? "Failed to fetch followers" },
            { status: 400 }
        );
    }

    return NextResponse.json(
        {
            success: true,
            users: result.users,
        },
        { status: 200 }
    );
}
