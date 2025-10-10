"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useLocale } from "next-intl";

export default function CallbackPage() {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        router.replace(`/${locale}/sign-in`);
        return;
      }

      if (session) {
        router.replace(`/${locale}`);
      } else {
        router.replace(`/${locale}/sign-in`);
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Signing you in...</p>
    </div>
  );
}
