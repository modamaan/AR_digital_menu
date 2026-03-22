import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/create(.*)', '/home(.*)']);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    const { pathname } = request.nextUrl;

    // Redirect authenticated users away from root
    if (userId && pathname === '/') {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // Protect dashboard routes — redirect to sign-in if not authenticated
    if (isProtectedRoute(request)) {
        await auth.protect();
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
