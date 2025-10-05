"use client";

import { useUser } from "@/app/hook/useUser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect if we're already on the sign-in page
  const isSignInPage = pathname === "/sign-in";

  useEffect(() => {
    if (!isLoading && !user && !isSignInPage) {
      router.push("/sign-in" );
    }
  }, [user, isLoading, router, isSignInPage]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If there's an error or no user and not on sign-in page, don't render children
  if ((error || !user) && !isSignInPage) {
    return null;
  }

  // If on sign-in page, always render children (let the sign-in page handle its own logic)
  if (isSignInPage) {
    return <>{children}</>;
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // Fallback - should not reach here
  return null;
}
