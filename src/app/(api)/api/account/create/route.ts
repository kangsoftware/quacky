// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { Users, NotifyService } from "@/quacky"
import { Discord } from "@/server/discord";
import Mail from "@/server/mail";

export async function POST(req: NextRequest) {
    const body = await req.json();
    var { name, handle, email }: { name: string; handle: string; email: string } = body;

    // Validate
    if (!name || !handle || !email) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    // Sanitize
    handle = String(handle).toLowerCase();
    email = String(email).toLowerCase();

    // Create user
    try {
        // Create the new user
        const result = await Users.new(
            name,
            handle,
            email
        )

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Send welcome email
        await Mail.send(
            email,
            `Welcome to Quacky, ${name}!`,
            `
            <!DOCTYPE html>
            <html>
            <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            </head>

            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#F3F1EB;">

            <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
            <td align="center" style="padding:40px 20px;">

            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

            <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
            <img
            src="https://cdn.lkang.au/quacky/Screenshot_2026-03-14_084304-removebg-preview.png"
            alt="Quacky Logo"
            width="120"
            style="display:block;margin:0 auto;border:0;max-width:100%;height:auto;"
            >
            </td>
            </tr>

            <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
            <h1 style="margin:0;font-size:24px;font-weight:600;color:#000000;line-height:1.4;">
            Welcome to Quacky, ${name}!
            </h1>
            </td>
            </tr>

            <tr>
            <tr>
            <td style="padding:0 0 28px 0;">

            <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#000000;">
            Hi ${name},
            </p>

            <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#000000;">
            We're really glad you joined our humble, open community. Quacky is a place to connect, share ideas, and build things together — and the platform is fully open source.
            </p>

            <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#000000;">
            Did you know you can also self-host Quacky for you and your friends to have a private, relaxed social media space? You can learn more
            <a href="https://quacky.lkang.au/self-host" style="color:#4D1C00;text-decoration:underline;">
            here
            </a>.
            </p>

            <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#000000;">
            Quacky is still growing, so if you have any feedback, ideas, or things you'd like to see improved, I'd really love to hear from you.
            </p>

            <p style="margin:0;font-size:16px;line-height:1.7;color:#000000;">
            Thanks for giving Quacky a try.<br><br>
            — Linus
            </p>

            </td>
            </tr>
            </tr>

            <tr>
            <td style="padding:8px 0 32px 0;text-align:center;">
            <a href="https://quacky.lkang.au"
            style="display:inline-block;background-color:#4D1C00;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 24px;border-radius:64px;">
            Go to Quacky
            </a>
            </td>
            </tr>

            <tr>
            <td style="border-top:1px solid #e4e4e7;padding:24px 0 0 0;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;text-align:center">
            If you have any questions, feel free to reach out at
            <a href="mailto:support@kang.software" style="color:#71717a;text-decoration:underline;">
            support@kang.software
            </a>.
            </p>
            </td>
            </tr>

            </table>

            </td>
            </tr>
            </table>

            </body>
            </html>
            `
        );

        // Send welcome notification
        await NotifyService.create(
            result.user?.id!,
            'system:message',
            `Welcome to Quacky, ${name}!\n\nWe're really glad you joined our humble, open community. Quacky is a place to connect, share ideas, and build things together.\n\nDid you know you can also self-host Quacky for you and your friends to have a private, relaxed social media space? You can learn more here: https://quacky.linus.my/self-host\n\nQuacky is still growing, so if you have any feedback, ideas, or things you'd like to see improved, I'd really love to hear from you.\n\n\nThanks for giving Quacky a try.\nThe Quacky Team`,
            'quacky',
        );

        // Log for mods.
        await Discord.new(
            {
                username: "Quacky",
                avatar_url: "https://quackycdn.linus.my/pub/Logo.png",
                content: `New account created: @${handle} (${email})`,
                embeds: [
                    {
                        title: "New Account Created",
                        description: "A new Quacky account was created via. onboarding.",
                        color: 0x4d1c00,
                        timestamp: new Date().toISOString(),
                        fields: [
                            { name: "User ID", value: result.user?.id ?? "unknown", inline: false },
                            { name: "Name", value: name, inline: true },
                            { name: "Handle", value: `@${handle}`, inline: true },
                            { name: "Email", value: email, inline: false },
                        ],
                    }
                ],
            }
        );

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
