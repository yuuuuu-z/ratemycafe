import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import { BadgeCheckIcon, Star } from "lucide-react";
import { Badge } from "./badge";
import Link from "next/link";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    id: string; // added id to track best shop
    title: string;
    description: string;
    link: string;
    image: string;
    review: number; // ⭐ average rating
    rating: number; // 👥 number of reviews
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // find the cafe with the most reviews
  const bestShop = items.reduce((best, item) => {
    return !best || item.review > best.review ? item : best;
  }, null as (typeof items)[0] | null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 gap-4",
        className
      )}
    >
      {items.map((item, idx) => {
        const isBestShop = bestShop?.id === item.id;

        return (
          <Link
            href={item?.link}
            key={idx}
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>

            <Card className="border-2 border-green-500 hover:ring-2 hover:ring-green-500 hover:scale-95 transition-all relative">
              {/* card content */}

              {isBestShop && (
                <Badge className="absolute top-1 -right-20 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md rotate-6 border border-green-500 ">
                  {" "}
                  🌟 Best Coffee Shop{" "}
                </Badge>
              )}
              <div className="flex items-center mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={70}
                  height={70}
                  className="rounded-lg"
                />
              </div>

              <div className="flex-col h-[100px]">
                <CardTitle>
                  <span className="md:text-[1.4rem] text-[1.2rem] font-bold pr-3">
                    {item.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500 text-white dark:bg-blue-600"
                  >
                    <BadgeCheckIcon />
                    Verified
                  </Badge>
                </CardTitle>

                <CardDescription>
                  {item.description.length > 100 ? (
                    <>
                      {item.description.slice(0, 80)}...{" "}
                      <span className="text-blue-500 cursor-pointer">
                        see more
                      </span>
                    </>
                  ) : (
                    item.description
                  )}
                </CardDescription>
              </div>

              <div className="flex items-center justify-between py-5">
                <CardDescription className="pb-4">
                  {item.rating} reviews
                </CardDescription>
                <Button
                  variant="secondary"
                  className={cn(
                    "flex items-center h-14 w-14 gap-1 px-4 py-2 rounded-full",
                    item.rating > 0 ? "bg-green-500 text-white" : ""
                  )}
                >
                  {item.review > 0 ? item.review.toFixed(1) : "0.0"}{" "}
                  <Star size={18} />
                </Button>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden border border-transparent relative z-20 dark:text-white",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4 dark:text-white">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4
      className={cn("dark:text-white font-bold tracking-wide mt-4", className)}
    >
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p className={cn("mt-4 tracking-wide leading-relaxed text-sm", className)}>
      {children}
    </p>
  );
};
