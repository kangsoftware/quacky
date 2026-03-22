// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

import { Posts } from "@/quacky";
import config from "@/config.json";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Get
        const result = await Posts.get();

        return NextResponse.json(result);

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }

}

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
        const attachments = Array.isArray(body.attachments) ? body.attachments : [];
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (content.length > 280 || (!content && attachments.length === 0)) {
            return NextResponse.json(
                { success: false, error: "Invalid format" },
                { status: 400 }
            );
        }

        if (attachments.length > config.posting.maxAttachments) {
            return NextResponse.json(
                { success: false, error: `A post can have at most ${config.posting.maxAttachments} valid attachments` },
                { status: 400 }
            );
        }

        const result = await Posts.new(content, session.user.id, attachments);

        return NextResponse.json(
            { result },
            { status: 201 }
        );

    } catch (err: any) {

        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );

    }
}
