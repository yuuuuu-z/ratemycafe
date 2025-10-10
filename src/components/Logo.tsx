"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Logo() {
  const t = useTranslations("nav");
  return (
    <div className="flex items-center space-x-2">
      <motion.svg
        animate={{ scale: [1, 1.15, 1] }} // Pulse: normal > bigger > normal
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-8 w-8 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="1" y2="4" />
        <line x1="10" x2="10" y1="1" y2="4" />
        <line x1="14" x2="14" y1="1" y2="4" />
      </motion.svg>

      <span
        className="text-xl font-bold text-foreground 
    relative cursor-pointer
    before:absolute before:-bottom-1 before:left-0 before:h-[2px] before:w-0 
    before:bg-foreground before:transition-[width] before:duration-300 
    hover:before:w-full"
      >
        {t("header")}
      </span>
    </div>
  );
}
