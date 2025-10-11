"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { usePathname } from 'next/navigation';
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "./Logo";
import UserProfile from "@/components/supaauth/user-profile";
import { useLocale } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Navbar() {
  const supabase = createSupabaseBrowser();
  // const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    getSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
  }, [supabase]);

  return (
    <nav className="flex items-center justify-between py-4 px-3 border-b">
      {/* Logo */}
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <Logo />
      </Link>

      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-4">
        <LocaleSwitcher />
        {isLoggedIn ? (
          <>
            <Link href={`/${locale}/admin`}>
              <Button variant="ghost">Admin</Button>
            </Link>
            <UserProfile />
          </>
        ) : (
          <Link href={`/${locale}/sign-in`}>
            <Button>Sign In</Button>
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col w-[320px] p-0">
            {/* Header Section */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <Logo />
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col px-6 py-8 gap-8">
              {/* Settings Section */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                  Settings
                </p>
                <LocaleSwitcher />
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Navigation Section */}
              {isLoggedIn && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                    Navigation
                  </p>
                  <Link href={`/${locale}/admin`} className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-base font-normal hover:bg-accent"
                    >
                      Admin
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="px-6 py-6 border-t border-border">
              {isLoggedIn ? (
                <UserProfile />
              ) : (
                <Link href={`/${locale}/sign-in`} className="block">
                  <Button className="w-full h-11 text-base font-medium">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
