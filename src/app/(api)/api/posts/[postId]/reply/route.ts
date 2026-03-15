import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import prisma from "@/server/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await auth.api.getSession(request);
    
    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { postId } = await params;
        const body = await request.json();

        if (!body.content || body.content.length > 280) {
            return NextResponse.json(
                { success: false, error: "Invalid format" },
                { status: 400 }
            );
        }

        const result = await prisma.reply.create({
            data: {
                content: body.content.trim(),
                authorId: session.user.id,
                postId: postId,
            }
        });

        return NextResponse.json(
            {result}, 
            { status: 201 }
        );
        
    } catch (error: any) {
        console.error("Reply error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
