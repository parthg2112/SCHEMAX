import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('better-auth.session_token')

    // Redirect to login if no session token on protected routes
    if (!sessionToken && (request.nextUrl.pathname.startsWith('/workspace') || request.nextUrl.pathname.startsWith('/code'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/workspace/:path*', '/code/:path*'],
}
