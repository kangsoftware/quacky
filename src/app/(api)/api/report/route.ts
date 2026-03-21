import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { SafetyService, Posts } from "@/quacky";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { contentId, contentType, contentAuthorId, contentAuthorHandle, reasonType, reasonDetail } = body;

        if (!contentId || !contentType || !reasonType) {
            return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
        }

        let authorId = contentAuthorId;
        let authorHandle = contentAuthorHandle;

        if ((!authorId || !authorHandle) && contentType === "post") {
            const postRes = await Posts.getById(contentId);
            if (postRes.success && postRes.post) {
                authorId = postRes.post.author?.id;
                authorHandle = postRes.post.author?.handle;
            }
        }

        const composedReason = `${reasonType}${reasonDetail ? `: ${String(reasonDetail).slice(0,2000)}` : ""}`;

        const result = await SafetyService.reportContent(
            session.user.id,
            session.user.handle || session.user.email || "",
            authorHandle || "",
            authorId || "",
            contentId,
            contentType,
            composedReason
        );

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error || "Failed to report" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
