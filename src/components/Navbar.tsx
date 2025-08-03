"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createClientSupabase } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function Navbar() {
  const supabase = createClientSupabase();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);
    };

    getSession();

    // Optional: listen to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
  });

  // Sign out function
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Link className="flex items-center" href="/">
        <Image src={"/logo.png"} alt="logo" width={70} height={70} />
        <p className="md:text-2xl text-lg font-bold">RateMyCafe</p>
      </Link>

      {/* Conditionally render Sign In or Sign Out */}
      {pathname !== "/sign-in" &&
        (isLoggedIn ? (
          <Button className="bg-red-500" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        ))}
    </div>
  );
}
