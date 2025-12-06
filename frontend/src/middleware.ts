import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('better-auth.session_token')

    // Simple check for session token existence
    // For more robust server-side validation, we would need to call the backend
    if (!sessionToken && !(request.nextUrl.pathname.startsWith('/workspace') || request.nextUrl.pathname.startsWith('/code'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/workspace/:path*', '/code/:path*'],
}
