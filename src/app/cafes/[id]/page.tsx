// src/app/cafes/[id]/page.tsx

import { createClientSupabase } from "@/utils/supabase/client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheckIcon, MapPinned, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClientSupabase();
  const { id } = await params; // Await the params promise

  const { data: cafe, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cafe || error) return notFound();

  return (
    <div className="max-w-5xl w-full mx-auto px-4 pt-20 pb-12 text-[17px] leading-relaxed">
      {/* Cafe Info Section */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-12">
        {/* Logo Image */}
        <div className="relative w-32 h-32 mb-4 md:mb-0 md:w-40 md:h-40">
          <Image
            src={cafe.image_url}
            alt={cafe.name}
            fill
            className="object-cover rounded-full border"
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col ">
          <div>
            <div className="text-4xl font-bold flex items-center gap-2   ">
              {cafe.name}{" "}
              <Badge className="bg-blue-500 text-white dark:bg-blue-600 mt-2">
                <BadgeCheckIcon />
                Verified
              </Badge>
            </div>
            <div className="text-lg mt-2 flex items-center gap-2">
              <MapPinned size={15} color="green" /> {cafe.location}
            </div>
            <p className="mt-4 text-lg max-w-3xl">{cafe.description}</p>
          </div>

          <div>
            <ImageSlider cafeId={id} />
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Reviews</h2>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between border-t border-gray-200 dark:border-gray-700 pt-8">
          {/* Review Stats */}
          <div className="flex gap-16">
            <div>
              <p className="text-base">Total Reviews</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
            <div>
              <p className="text-base">Average Rating</p>
              <p className="text-2xl font-semibold">0.0</p>
            </div>
          </div>

          {/* Rating Legend */}
          <div className="flex flex-col gap-3 text-base mt-2 md:mt-0">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Star
                  className={
                    [
                      "text-green-600",
                      "text-green-400",
                      "text-yellow-500",
                      "text-orange-500",
                      "text-red-500",
                    ][5 - rating]
                  }
                />
                {rating}{" "}
                {
                  ["Excellent", "Good", "Average", "Below Average", "Poor"][
                    5 - rating
                  ]
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
