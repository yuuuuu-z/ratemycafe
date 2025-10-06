import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import { Star } from "lucide-react";
import { Badge } from "./badge";
import Link from "next/link";
import ColourfulText from "@/components/ui/colourful-text";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    id: string;
    title: string;
    description: string;
    link: string;
    image: string;
    review: number; // ⭐ average rating
    rating: number; // 👥 number of reviews
    lat: number;
    lng: number;
    distance: number | null;
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
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10",
        className
      )}
    >
      {items.map((item, idx) => {
        const isBestShop = bestShop?.id === item.id;

        return (
          <Link
            href={item.link}
            key={item.id}
            className="relative group block h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* hover background */}
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 rounded-2xl "
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                />
              )}
            </AnimatePresence>

            <Card className="border border-green-500/60 hover:shadow-lg transition-all relative flex flex-col">
              {isBestShop && (
                <Badge className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full rotate-12 shadow-lg">
                  🎖️ <ColourfulText text="Best Shop" />
                </Badge>
              )}

              {/* top section */}
              <div className="flex gap-3 items-center mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={70}
                  height={70}
                  className="rounded-lg object-cover"
                />
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  {item.distance !== null ? (
                    <Badge
                      variant="outline"
                      className="text-pink-600 font-medium border border-pink-600 mt-1"
                    >
                      {item.distance < 1
                        ? `${Math.round(item.distance * 1000)} m away`
                        : `${item.distance.toFixed(1)} km away`}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">No location</span>
                  )}
                </div>
              </div>

              {/* middle section - grows/shrinks */}
              <div className="flex-1">
                <CardDescription>
                  {item.description.length > 100
                    ? `${item.description.slice(0, 80)}...`
                    : item.description}
                </CardDescription>
              </div>

              {/* footer pinned at bottom */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm">{item.rating} reviews</span>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-full text-sm",
                    item.rating > 0 ? "bg-yellow-500 text-white" : ""
                  )}
                >
                  {item.review > 0 ? item.review.toFixed(1) : "0.0"}
                  <Star size={16} />
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
}) => (
  <div
    className={cn(
      "rounded-2xl h-full w-full p-5 overflow-hidden relative z-20 ",
      className
    )}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h4 className={cn("font-bold tracking-wide text-lg", className)}>
    {children}
  </h4>
);

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <p className={cn("mt-2 text-sm ", className)}>{children}</p>;
