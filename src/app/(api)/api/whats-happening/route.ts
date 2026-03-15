import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession(req);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" }, 
            { status: 401 }
        );
    }

    return NextResponse.json(
        {
            
        }
    )

}