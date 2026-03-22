// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
    return NextResponse.json(
        {
            name: env.APP_NAME,
            url: env.BETTER_AUTH_URL,
            version: env.APP_VERSION,
            build: env.APP_BUILD,
            description: env.APP_DESCRIPTION,
            copyright: env.COPYRIGHT,
        },
        { status: 200 }
    )
}
