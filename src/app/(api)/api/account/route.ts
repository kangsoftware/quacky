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

export async function PATCH(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
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
        const existing = await prisma.user.findFirst({
            where: { handle: updateData.handle },
        });

        if (existing && existing.id !== session.user.id) {
            return NextResponse.json(
                { error: "Handle already taken" },
                { status: 409 }
            );
        }
    }

    try {
        const user = await prisma.user.update({
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
        });

        Discord.new(
            {
                username: "Quacky",
                avatar_url: "https://quackycdn.linus.my/pub/Logo.png",
                content: `Account updated:\nUser ID: ${user.id}\nName: ${user.name}\nHandle: ${user.handle}\nBio: ${user.bio}\nPrivate Account: ${user.privateAccount}\nEmail Notifications: ${user.emailNotif}`
            }
        );

        return NextResponse.json(
            { message: "Account updated successfully", user },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                handle: true,
                bio: true,
                image: true,
                privateAccount: true,
                emailNotif: true,
                email: true,
            },
        });

        return NextResponse.json({ user }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
