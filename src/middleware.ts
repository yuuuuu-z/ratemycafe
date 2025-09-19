import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define your admin email
const ADMIN_EMAIL = "sopheak0891@gmail.com";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  });

  // Create Supabase server client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get current user session
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Protect /admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      // Not logged in → redirect home
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (user.email !== ADMIN_EMAIL) {
      // Logged in but not admin → redirect home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"], // Apply only to /admin routes
};
