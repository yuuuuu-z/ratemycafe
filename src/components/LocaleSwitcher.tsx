"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="group relative flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent/50"
          >
            <Globe className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-semibold">
              {locale === "en" ? "English" : "ខ្មែរ"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[180px] rounded-xl border-border/50 bg-background/95 backdrop-blur-md shadow-xl p-1.5"
          sideOffset={8}
        >
          {routing.locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => changeLocale(loc)}
              className={`
                flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-200 
                ${
                  locale === loc
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent/50"
                }
              `}
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <span className="text-lg">{loc === "en" ? "🇺🇸" : "🇰🇭"}</span>
                {loc === "en" ? "English" : "Khmer"}
              </span>
              {locale === loc && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
