import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const ADMIN_EMAIL = "sopheak0891@gmail.com";

export async function middleware(req: NextRequest) {
  // Run next-intl middleware first (handles locale redirects)
  const res = intlMiddleware(req);

  // Extract the locale from pathname manually (instead of useLocale)
  const pathname = req.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/(en|kh)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";

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
          cookiesToSet.forEach(({ name, value }) => {
            res.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Get user session
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Protect /admin route
  if (pathname.startsWith(`/${locale}/admin`)) {
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/", "/(en|kh)/:path*", "/admin/:path*"],
};
