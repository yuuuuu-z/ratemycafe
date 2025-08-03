"use client";

import { useEffect, useState, useRef } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import Cafes from "./cafes/page";

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  image: string;
  review: number;
}

export default function Page() {
  const supabase = createClientSupabase();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShown = useRef(false);
  console.log(userData);

  //   {
  //     title: "Rate Cafes",
  //     description: "Discover and rate your favorite coffee shops",
  //     link: "/rate",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  //   {
  //     title: "Find Cafes",
  //     description: "Explore cafes near you with ratings and reviews",
  //     link: "/explore",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  //   {
  //     title: "My Reviews",
  //     description: "View and manage your cafe reviews",
  //     link: "/reviews",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  //   {
  //     title: "My Reviews",
  //     description: "View and manage your cafe reviews",
  //     link: "/reviews",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  //   {
  //     title: "My Reviews",
  //     description: "View and manage your cafe reviews",
  //     link: "/reviews",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  //   {
  //     title: "My Reviews",
  //     description: "View and manage your cafe reviews",
  //     link: "/reviews",
  //     image:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
  //     review: 0,
  //   },
  // ];

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUserData(null);
        setError("You are not signed in.");
        setIsLoading(false);
        return;
      }

      const { data, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        setError(userError.message);
        setUserData(null);
      } else {
        setUserData(data);
        setError(null);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    // Check sessionStorage for toast flag
    const alreadyWelcomed = sessionStorage.getItem("welcome-toast");
    if (alreadyWelcomed) {
      toastShown.current = true;
    }

    // Initial user fetch and toast if needed
    fetchUserData().then(() => {
      if (!toastShown.current) {
        toast.success("Signed in successfully!");
        toastShown.current = true;
        sessionStorage.setItem("welcome-toast", "shown");
      }
    });

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsLoading(true);
        if (!toastShown.current) {
          toast.success("Signed in successfully!");
          toastShown.current = true;
          sessionStorage.setItem("welcome-toast", "shown");
        }
        fetchUserData();
      } else if (event === "SIGNED_OUT") {
        toast.info("Signed out");
        toastShown.current = false;
        sessionStorage.removeItem("welcome-toast");
        setUserData(null);
        setError("You are not signed in.");
        setIsLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth, supabase]);

  if (error) return <p className="text-red-500">⚠️ {error}</p>;
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
      {/* <p>✅ Welcome {userData?.full_name || userData?.email}</p> */}

      {/* <HoverEffect items={items} /> */}
      <Cafes />
    </div>
  );
}
