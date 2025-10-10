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
import { Globe } from "lucide-react";
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
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            {locale === "en" ? "English" : "ខ្មែរ"}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[150px] rounded-2xl">
          {routing.locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => changeLocale(loc)}
              className={`flex items-center gap-2 cursor-pointer ${
                locale === loc ? "bg-muted text-primary" : ""
              }`}
            >
              {loc === "en" ? "🇺🇸 English" : "🇰🇭 Khmer"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
