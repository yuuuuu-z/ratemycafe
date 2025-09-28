"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export default function Page() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleGoogleSignIn = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google: " + error.message);
    }
  };

  const handleLogin = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    // Check if user exists in your "users" table
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found (depends on your PostgREST version)
      toast.error("Error checking user: " + error.message);
      return;
    }

    if (data) {
      // User exists, you can proceed with sign-in, e.g. magic link
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });
      if (signInError) {
        toast.error("Failed to send magic link: " + signInError.message);
      } else {
        toast.success("Magic link sent to your email!");
      }
    } else {
      toast.error("No user found with this email.");
    }
  };

  if (loading) return null;

  return (
    <div className="flex-1 flex justify-center items-center py-10">
      <div className="flex-col text-center items-center justify-center w-[400px] space-y-5 ">
        <Label className="font-bold text-lg">Email</Label>
        <Input
          className="px-3 py-6"
          placeholder="Example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <Button onClick={handleLogin} className="w-full py-6">
          Sign In
        </Button>
        <p>OR</p>
        <Button
          onClick={handleGoogleSignIn}
          className="w-full py-6"
          variant="outline"
        >
          <FcGoogle />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
