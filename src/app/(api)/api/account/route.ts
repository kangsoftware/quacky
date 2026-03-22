// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/server/db";
import Discord from "@/server/discord";
import { auth } from "@/server/auth";

interface UpdateAccountData {
    name?: string;
    handle?: string;
    bio?: string;
    privateAccount?: boolean;
    emailNotif?: boolean;
}

// Change account settings
export async function PATCH(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const updateData: UpdateAccountData = {};

    if (typeof body.name === "string") updateData.name = body.name.trim();
    if (typeof body.handle === "string") updateData.handle = body.handle.replace(/^@+/, "").trim();
    if (typeof body.privateAccount === "boolean") updateData.privateAccount = body.privateAccount;
    if (typeof body.emailNotif === "boolean") updateData.emailNotif = body.emailNotif;
    if (typeof body.bio === "string") updateData.bio = body.bio;

    if (updateData.handle) {
        const existing = await prisma.user.findFirst(
            {
                where: { handle: updateData.handle },
            }
        );

        if (existing && existing.id !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Handle already taken" },
                { status: 409 }
            );
        }
    }

    try {
        const user = await prisma.user.update(
            {
                where: { id: session.user.id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    bio: true,
                    image: true,
                    privateAccount: true,
                    emailNotif: true
                },
            }
        );

        Discord.new(
            {
                username: "Quacky",
                avatar_url: "https://quackycdn.linus.my/pub/Logo.png",
                content: `**${user.name}** (@${user.handle}) updated their account settings.`,
                embeds: [
                    {
                        title: "Updated Fields",
                        description: Object.keys(updateData).map(key => `**${key}**: ${JSON.stringify((updateData as any)[key])}`).join("\n"),
                        color: 0x1DA1F2
                    }
                ]
            }
        );

        return NextResponse.json(
            { success: true, user },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

// Get local account details
export async function GET(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique(
            {
                where: { id: session.user.id },
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    verified: true,
                    bio: true,
                    image: true,
                    role: true,
                    privateAccount: true,
                    emailNotif: true,
                    email: true,
                    banned: true,
                    createdAt: true,
                    updatedAt: true
                },
            }
        );

        return NextResponse.json(
            { success: true, user },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
