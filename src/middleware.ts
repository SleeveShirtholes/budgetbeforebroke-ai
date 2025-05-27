import { NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware to protect routes by checking for a Better Auth session cookie.
 * Redirects to the home page if the session is missing.
 */
export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/profile"], // Specify the routes the middleware applies to
};
