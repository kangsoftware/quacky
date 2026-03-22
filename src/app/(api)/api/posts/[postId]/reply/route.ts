// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

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

        const result = await prisma.reply.create(
            {
                data: {
                    content: body.content.trim(),
                    authorId: session.user.id,
                    postId: postId,
                }
            }
        );

        return NextResponse.json(
            { success: true, result },
            { status: 201 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
