"use client";
import React, { useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IoMdSettings } from "react-icons/io";
import { PiSignOutFill } from "react-icons/pi";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useUser } from "../../app/[locale]/hook/useUser";
import ManageProfile from "./manage-profile";

import Image from "next/image";

export default function UserProfile() {
  const [isSignOut, startSignOut] = useTransition();
  const router = useRouter();
  const { data } = useUser();

  const signout = () => {
    startSignOut(async () => {
      const supabase = createSupabaseBrowser();
      await supabase.auth.signOut();
      router.push("/");
    });
  };

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
          {data?.user_metadata?.avatar_url ? (
            <Image
              className="rounded-full hover:opacity-80 transition-opacity"
              src={data?.user_metadata.avatar_url}
              alt="Avatar"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                {data?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className="w-[95%] max-w-[20rem] sm:w-[30rem] sm:max-w-none"
        >
          <div
            className={cn("flex gap-3 sm:gap-5 items-start w-full", {
              "animate-pulse ml-2 sm:ml-5": isSignOut,
            })}
          >
            <div className="flex-shrink-0">
              {data?.user_metadata?.avatar_url ? (
                <Image
                  className="rounded-full"
                  src={data?.user_metadata.avatar_url}
                  alt="Avatar"
                  width={40}
                  height={40}
                />
              ) : null}
            </div>
            <div className="space-y-3 sm:space-y-5 w-full flex-1 min-w-0">
              <div>
                <h1 className="text-sm sm:text-base truncate">{data?.email}</h1>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  className="w-full sm:w-1/2 h-9 rounded-xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-200 text-xs sm:text-sm"
                  variant="outline"
                  onClick={() => {
                    document.getElementById("manage-profile")?.click();
                  }}
                >
                  <IoMdSettings className="size-4 sm:size-5" />
                  <span className="hidden xs:inline">Manage Account</span>
                  <span className="xs:hidden">Manage</span>
                </Button>
                <Button
                  className="w-full sm:w-1/2 h-9 rounded-xl flex items-center justify-center gap-2 text-gray-600 dark:text-gray-200 text-xs sm:text-sm"
                  variant="outline"
                  onClick={signout}
                >
                  {!isSignOut ? (
                    <PiSignOutFill className="size-4 sm:size-5" />
                  ) : (
                    <AiOutlineLoading3Quarters className="size-3 sm:size-4 animate-spin" />
                  )}
                  SignOut
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ManageProfile />
    </div>
  );
}
