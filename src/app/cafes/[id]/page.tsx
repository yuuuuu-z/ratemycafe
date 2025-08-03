// src/app/cafes/[id]/page.tsx

import { createClientSupabase } from "@/utils/supabase/client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";

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
        <div>
          <h1 className="text-4xl font-bold">{cafe.name}</h1>
          <p className="text-lg mt-2">{cafe.location}</p>
          <p className="mt-4 text-lg max-w-3xl">{cafe.description}</p>
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
            <div className="flex items-center gap-2">
              <Star className="text-green-600 w-5 h-5" /> 5 Excellent
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-green-400 w-5 h-5" /> 4 Good
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 w-5 h-5" /> 3 Average
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-orange-500 w-5 h-5" /> 2 Below Average
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-red-500 w-5 h-5" /> 1 Poor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
