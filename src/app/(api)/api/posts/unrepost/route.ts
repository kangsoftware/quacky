// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { Posts } from "@/quacky"
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const postId = body.postId;

        if (!postId) {
            return NextResponse.json(
                { success: false, error: "Invalid post ID" },
                { status: 400 }
            );
        }

        // remove repost
        const result = await Posts.unrepost(postId, session.user.id);

        return NextResponse.json(
            { success: true, result },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
