// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Block any request to /api/test
    if (pathname === '/api/test') {
        // Return a custom response without executing the API route
        return new NextResponse('API endpoint is blocked', { status: 404 });
    }

    // Allow all other requests to continue normally
    return NextResponse.next();
}