import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_EMAIL = "sopheak0891@gmail.com";

export async function middleware(req: NextRequest) {
  // Run next-intl middleware first (handles / → /en etc.)
  const res = intlMiddleware(req);

  // Create Supabase client
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
        },
      },
    }
  );

  // Check session
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Protect /admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/(en|kh)/:path*", // locales you support
    "/admin/:path*",
  ],
};
