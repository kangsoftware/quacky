import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { SafetyService, Posts } from "@/quacky";
import Mail from "@/server/mail";
import { env } from "@/env";

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

        // await Mail.send(
        // session.user.email,
        // "Content violation reported: Ticket ID " + result.reportId,
        // `
        // <!DOCTYPE html>
        // <html>
        // <head>
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        //     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        // </head>
        // <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        //     <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0; padding: 0;">
        //     <tr>
        //         <td align="center" style="padding: 40px 20px;">
        //         <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

        //             <tr>
        //             <td style="padding: 0 0 32px 0;">
        //                 <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.4;">
        //                 ${env.APP_NAME}
        //                 </h1>
        //             </td>
        //             </tr>

        //             <tr>
        //             <td style="padding: 0 0 32px 0;">
        //                 <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #000000;">
        //                 Thanks for reporting this content to our moderation team. <a href="${env.BETTER_AUTH_URL}/post/${contentId}" style="color: #3b82f6; text-decoration: none;">View reported post</a>
        //                 </p>

        //                 <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #000000;">
        //                 The report has been received and the content is currently under review.
        //                 </p>

        //                 <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #52525b;">
        //                 If a violation is confirmed, appropriate action will be taken. We may notify you if there is an update regarding the report.
        //                 </p>
        //             </td>
        //             </tr>

        //             <tr>
        //             <td style="padding: 32px 0 0 0; border-top: 1px solid #e4e4e7;">
        //                 <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a;">
        //                 If you have additional information related to this report, please email support@kang.software with your ticket ID and extra information.
        //                 </p>
        //             </td>
        //             </tr>

        //         </table>
        //         </td>
        //     </tr>
        //     </table>
        // </body>
        // </html>
        // `
        // );

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
