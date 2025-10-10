"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { usePathname } from "next/navigation";
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
          <SheetContent side="right" className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <Logo />
              <span className="font-semibold text-lg">RateMyCafe</span>
            </div>
            <LocaleSwitcher />
            {isLoggedIn ? (
              <>
                <Link href={`/${locale}/admin`}>
                  <Button variant="ghost" className="w-full">
                    Admin
                  </Button>
                </Link>
                <UserProfile />
              </>
            ) : (
              <Link href={`/${locale}/sign-in`}>
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
