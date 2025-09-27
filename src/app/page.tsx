"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import Cafes from "./cafes/page";
import { ThreeDMarqueeDemo } from "@/components/ThreeDMarqueeDemo";

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  image: string;
  review: number;
}

export default function Page() {
  const supabase = createClientSupabase();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShown = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setError("You are not signed in.");
        setIsLoading(false);
        return;
      }

      // Fetch from users table
      const { data, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single<UserData>();

      if (userError) {
        setError(userError.message);
      } else {
        let finalImage = data.image || "";

        // 1️⃣ If image is missing in DB, fallback to Google/OAuth avatar
        if (!finalImage && session.user.user_metadata?.avatar_url) {
          finalImage = session.user.user_metadata.avatar_url;
        }

        // 2️⃣ If it's from Supabase Storage and not a full URL, make it public
        if (finalImage && !finalImage.startsWith("http")) {
          const { data: publicData } = supabase.storage
            .from("avatars") // your bucket name
            .getPublicUrl(finalImage);

          if (publicData?.publicUrl) {
            finalImage = publicData.publicUrl;
          }
        }

        setError(null);

        // Welcome toast
        const alreadyWelcomed = sessionStorage.getItem("welcome-toast");
        if (!toastShown.current && !alreadyWelcomed) {
          toast.success("Signed in successfully!");
          toastShown.current = true;
          sessionStorage.setItem("welcome-toast", "shown");
        }
      }

      setIsLoading(false);
    };

    // Restore toast flag
    if (sessionStorage.getItem("welcome-toast")) {
      toastShown.current = true;
    }

    fetchUserData();

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsLoading(true);
        fetchUserData();
      } else if (event === "SIGNED_OUT") {
        toast.info("Signed out");
        toastShown.current = false;
        sessionStorage.removeItem("welcome-toast");

        setError("You are not signed in.");
        setIsLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (error)
    return (
      <span>
        <ThreeDMarqueeDemo />
      </span>
    );

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-[20px] w-[200px] rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[70px] w-[70px] rounded-lg" />
              <Skeleton className="h-[20px] w-[150px] rounded" />
              <Skeleton className="h-[60px] w-full rounded" />
              <Skeleton className="h-[70px] w-[70px] rounded-lg" />
              <Skeleton className="h-[20px] w-[150px] rounded" />
              <Skeleton className="h-[60px] w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div>
      <ThreeDMarqueeDemo />
      <Cafes />
      
    </div>
  );
}
