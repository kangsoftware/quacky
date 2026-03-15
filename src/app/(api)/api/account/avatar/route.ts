import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { s3 } from "@/server/cdn";
import Discord from "@/server/discord";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const form = await req.formData();
        const file = form.get("avatar") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = (file.name || "").split(".").pop() || "bin";
        const key = `avatars/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const uploader = new s3();
        const url = await uploader.uploadFile(buffer, key, file.type || undefined);

        await prisma.user.update({ where: { id: session.user.id }, data: { image: url } });

        await Discord.logToWebhook(
            `@${session.user.handle} (${session.user.id}) updated their avatar: ${url}`
        );

        return NextResponse.json({ url }, { status: 200 });
    } catch (err: any) {
        console.error("avatar upload error", err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
