// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

import { Users } from "@/quacky";

interface Params {
    params: Promise<{ handle: string }>
};

export async function POST(request: NextRequest, { params }: Params) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { handle } = await params;

        const target = await Users.getHandle(handle);

        if (!target.success || !target.user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // follow
        await Users.follow(
            session.user.id,
            target.user.id
        );

        return NextResponse.json(
            {
                success: true,
                following: true
            }, { status: 200 }
        )

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }

}
