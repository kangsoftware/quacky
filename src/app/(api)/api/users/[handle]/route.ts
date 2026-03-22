// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

import { Users } from "@/quacky";

type Params = { params: Promise<{ handle: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
    const session = await auth.api.getSession(_request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { handle } = await params;

        if (!handle) {
            return NextResponse.json(
                { success: false, error: "Missing handle" },
                { status: 400 }
            );
        }

        // fetch via. quacky api
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
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }

}
