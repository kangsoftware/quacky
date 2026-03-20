// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/server/auth';

export default async function proxy(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    if (session.user.banned) {
        return NextResponse.json(
            { success: false, error: "Your account has been banned. Contact an admin for assistance." },
            { status: 403 }
        );
    }

    return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|signin|api/auth|api/account/create|onboarding|assets/quackythebird).*)|terms|privacy',
}
