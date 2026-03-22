// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { SafetyService, Posts } from "@/quacky";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            {
                success: false,
                error: "Unauthorized"
            }, { status: 401 }
        );
    }

    try {
        const {
            contentId,
            contentType,
            contentAuthorId,
            contentAuthorHandle,
            reasonType,
            reasonDetail
        } = await request.json();

        // validate
        if (!contentId || !contentType || !reasonType || !contentAuthorId || !contentAuthorHandle) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid request"
                }, { status: 400 }
            );
        }

        const composedReason = `${reasonType}${reasonDetail ? `: ${String(reasonDetail).slice(0, 2000)}` : ""}`;

        // send to mods
        const result = await SafetyService.reportContent(
            session.user.id,
            session.user.handle?.toString() || "",
            contentAuthorHandle,
            contentAuthorId,
            contentId,
            contentType,
            composedReason
        );

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error
                }, { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true
            }, { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: err.message
            }, { status: 500 }
        );
    }
}
