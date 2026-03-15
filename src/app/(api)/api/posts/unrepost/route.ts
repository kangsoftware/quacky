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

        const result = await Posts.unrepost(postId, session.user.id);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(
            { success: true, result },
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
