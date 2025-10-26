import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// This function can be marked `async` if using `await` inside
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthenticated = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/auth/signin") ||
      req.nextUrl.pathname.startsWith("/auth/signup");

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isAuthPage && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // If user is authenticated and trying to access auth pages
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify the paths that should be protected by this middleware
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/settings/:path*"],
};
