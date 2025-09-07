"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const supabase = createClientSupabase();
  const router = useRouter();

  useEffect(() => {
    const exchangeSession = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        // console.error("Auth error:", error.message);
        router.replace("/"); // fallback if exchange fails
      } else {
        router.replace("/"); // redirect to homepage (or dashboard)
      }
    };

    exchangeSession();
  }, [router, supabase]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg">Signing you in...</p>
    </div>
  );
}
