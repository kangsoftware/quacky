// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db";
import { s3 } from "@/server/cdn";
import Discord from "@/server/discord";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const form = await req.formData();
        const file = form.get("avatar") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const ext = (file.name || "").split(".").pop() || "bin";
        const key = `avatars/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // upload
        const s3client = new s3();
        const url = await s3client.uploadFile(buffer, key, file.type);

        await prisma.user.update(
            {
                where: {
                    id: session.user.id
                },
                data: {
                    image: url
                }
            }
        );

        await Discord.new(
            {
                username: "Quacky",
                avatar_url: "https://quackycdn.linus.my/pub/Logo.png",
                content: `<@${session.user.id}> updated their avatar: ${url}`,
                embeds: [
                    {
                        title: "New Avatar",
                        image: { url }
                    }
                ]
            }
        );

        return NextResponse.json(
            { success: true, url },
            { status: 200 }
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
