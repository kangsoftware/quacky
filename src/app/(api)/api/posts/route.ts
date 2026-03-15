import { Posts } from "@/quacky";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

const MAX_ATTACHMENTS_PER_POST = 3;

type PostAttachment = {
    key: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    kind: "image" | "video" | "file";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const isAttachment = (value: unknown): value is PostAttachment => {
    if (!isRecord(value)) return false;

    return Boolean(
        typeof value.key === "string"
        && typeof value.url === "string"
        && typeof value.name === "string"
        && typeof value.mimeType === "string"
        && typeof value.size === "number"
        && (value.kind === "image" || value.kind === "video" || value.kind === "file")
    );
};

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const result = await Posts.get();
        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
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

        if (attachments.length > MAX_ATTACHMENTS_PER_POST || !attachments.every(isAttachment)) {
            return NextResponse.json(
                { success: false, error: `A post can have at most ${MAX_ATTACHMENTS_PER_POST} valid attachments` },
                { status: 400 }
            );
        }

        const result = await Posts.new(content, session.user.id, attachments);

        return NextResponse.json(
            { result },
            { status: 201 }
        );

    } catch (error: any) {

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );

    }
}
