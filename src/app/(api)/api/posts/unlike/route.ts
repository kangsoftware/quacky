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

        const result = await Posts.unlike(postId, session.user.id);

        return NextResponse.json(
            { success: true, message: "Unliked post" },
            { status: 200 }
        );

    } catch (error: any) {

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}