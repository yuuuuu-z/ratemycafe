"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const f = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <>
      <div className="flex flex-col space-y-8 p-3 md:flex-row md:justify-between mt-28 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <p className="text-3xl font-bold ">{t("header")}</p>
          <p className="md:w-[500px]">{f("header")}</p>
        </div>
        <div className="flex flex-col space-y-3">
          <p className="text-[1.2rem] font-bold ">{f("sitemap")}</p>
          <Link className="hover:underline" href={`${locale}/terms`}>
            {f("sitemap1")}
          </Link>
          <Link className="hover:underline" href={`${locale}/privacy`}>
            {f("sitemap2")}
          </Link>
          <Link className="hover:underline" href={`${locale}/about`}>
            {f("sitemap3")}
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <p className="text-[1.2rem] font-bold">{f("contact")}</p>
          <Link className="hover:underline" href="tel:0964320421">
            {f("contact1")}
          </Link>
          <Link className="hover:underline" href="mailto:sopheak0891@gmail.com">
            {f("contact2")}
          </Link>
        </div>
      </div>

      <div className="flex flex-col  p-3 space-y-6 md:flex-row md:justify-between md:items-center ">
        <p className="font-bold pt-7">
          {f("copyright")} © {currentYear} {f("copyright1")}
        </p>
        <Button
          variant="ghost"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center gap-2 mt-1 text-sm w-[120px]"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? f("lightmode") : f("darkmode")}
        </Button>
      </div>
    </>
  );
}
