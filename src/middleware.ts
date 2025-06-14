import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Store rate limit data in memory (consider using Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Try different headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Try other headers
  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback for development or when no IP is available
  return 'anonymous';
}

export function middleware(request: NextRequest) {
  // Get client IP using proper method
  const ip = getClientIP(request);
  
  // Get current rate limit data
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(ip) ?? { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Check if rate limit window has expired
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Increment request count
  rateLimitData.count++;
  rateLimitMap.set(ip, rateLimitData);
  
  // Check if rate limit exceeded
  if (rateLimitData.count > RATE_LIMIT) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
        },
      }
    );
  }

  // Continue with the request - security headers are handled in next.config.ts
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 