import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|googlebot|bingbot|slurp/i.test(userAgent);
  
  // Block bots from accessing dashboard and private pages - return 404
  if (isBot && (url.pathname.startsWith('/dashboard') || 
                url.pathname.startsWith('/admin') || 
                url.pathname.startsWith('/verify-email') || 
                url.pathname.startsWith('/reset-password'))) {
    // Return 404 for bots trying to access private pages
    return new NextResponse(null, {
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      },
    });
  }
  
  // Handle search parameter redirects - redirect to clean URL to avoid duplicates
  if (url.pathname === '/' && url.searchParams.has('s')) {
    // Redirect to clean homepage URL
    url.searchParams.delete('s');
    return NextResponse.redirect(url, 301); // Permanent redirect
  }
  
  // Remove any other unnecessary query parameters from homepage
  if (url.pathname === '/' && url.search) {
    const allowedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'referral'];
    const newSearchParams = new URLSearchParams();
    
    // Only keep allowed tracking parameters
    allowedParams.forEach(param => {
      if (url.searchParams.has(param)) {
        newSearchParams.set(param, url.searchParams.get(param)!);
      }
    });
    
    // If params changed, redirect
    if (url.search !== '?' + newSearchParams.toString()) {
      url.search = newSearchParams.toString();
      return NextResponse.redirect(url, 301);
    }
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon|robots|sitemap|.*\\..*|api).*)',
  ],
};
