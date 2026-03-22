// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NotifyService } from "@/quacky"
import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const result = await NotifyService.getForUser(session.user.id);

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
        const { action } = body;

        if (action === "markAllRead") {
            const result = await NotifyService.markAllAsRead(session.user.id);
            return NextResponse.json(result);
        }

        return NextResponse.json(
            { success: false, error: "Invalid action" },
            { status: 400 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { notificationId } = await request.json();

        const result = await NotifyService.markAsRead(notificationId);

        return NextResponse.json(
            {
                success: true,
                result
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
