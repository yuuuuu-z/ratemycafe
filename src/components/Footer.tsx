"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <>
      <div className="flex flex-col space-y-8 p-3 md:flex-row md:justify-between mt-28 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <p className="text-3xl font-bold">RateMyCafe</p>
          <p>
            This is a web platform that allows users to discover, rate, and{" "}
            <br />
            review cafes based on different experiences.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <p className="text-[1.2rem] font-bold ">Site Map</p>
          <Link className="hover:underline" href="/terms">
            Terms & Conditions
          </Link>
          <Link className="hover:underline" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:underline" href="/about">
            About
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <p className="text-[1.2rem] font-bold">Contact</p>
          <Link className="hover:underline" href="tel:0964320421">
            Phone
          </Link>
          <Link className="hover:underline" href="mailto:sopheak0891@gmail.com">
            Email
          </Link>
        </div>
      </div>

      <div className="flex flex-col  p-3 space-y-6 md:flex-row md:justify-between md:items-center ">
        <p className="font-bold pt-7">All rights reserved © Sopheaktra</p>
        <Button
          variant="ghost"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center gap-2 mt-1 text-sm w-[120px] "
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </>
  );
}
