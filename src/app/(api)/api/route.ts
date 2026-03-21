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
