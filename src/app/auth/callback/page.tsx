"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const exchangeSession = async () => {
      try {
        setStatus("Exchanging code for session...");

        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error("Auth error:", error);
          toast.error("Authentication failed: " + error.message);
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => router.replace("/"), 2000);
          return;
        }

        if (data.user) {
          setStatus("Creating user profile...");

          // Debug: Log user data
          console.log("User data received:", {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
            app_metadata: data.user.app_metadata,
          });

          // Create or update user record in your users table
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              data.user.user_metadata?.display_name ||
              null,
            image: data.user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          console.log("Attempting to upsert user data:", userData);

          const { error: upsertError } = await supabase
            .from("users")
            .upsert(userData, {
              onConflict: "id",
            });

          if (upsertError) {
            console.error("Error creating user record:", upsertError);
            toast.error(
              "Failed to create user profile: " + upsertError.message
            );
            setStatus("Profile creation failed. Redirecting...");
            setTimeout(() => router.replace("/"), 2000);
            return;
          }

          console.log("User profile created/updated successfully");
          setStatus("Success! Redirecting...");
          toast.success("Successfully signed in!");

          // Small delay to show success message
          setTimeout(() => {
            router.replace("/");
          }, 1000);
        } else {
          console.error("No user data received");
          toast.error("No user data received from authentication");
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => router.replace("/"), 2000);
        }
      } catch (error) {
        console.error("Unexpected error during authentication:", error);
        toast.error("An unexpected error occurred during authentication");
        setStatus("Error occurred. Redirecting...");
        setTimeout(() => router.replace("/"), 2000);
      }
    };

    exchangeSession();
  }, [router, supabase]);

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="text-lg">{status}</p>
    </div>
  );
}
