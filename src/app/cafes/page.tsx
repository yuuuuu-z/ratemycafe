"use client";

import { useEffect, useState } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Cafe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  location?: string;
  reviews?: Review[];
}

interface Review {
  rating: number;
  cafe_id?: string;
}

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "reviews" | "stars">("name");

  // how many top items to show when using "Most Reviewed" or "Highest Rated"
  const TOP_N = 5;

  useEffect(() => {
    const fetchCafes = async () => {
      const supabase = createClientSupabase();
      const { data, error } = await supabase.from("cafes").select("*");

      if (error) {
        console.error("Error fetching cafes:", error.message);
      } else {
        setCafes(data || []);
      }
    };

    fetchCafes();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (cafes.length === 0) return;

      const supabase = createClientSupabase();
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("cafe_id, rating");

      if (error) {
        console.error("Error fetching reviews:", error.message);
        return;
      }

      if (reviewsData) {
        const reviewsByCafe = reviewsData.reduce(
          (acc: Record<string, Review[]>, review) => {
            if (!acc[review.cafe_id]) acc[review.cafe_id] = [];
            acc[review.cafe_id].push({ rating: review.rating });
            return acc;
          },
          {}
        );

        setCafes((prev) =>
          prev.map((cafe) => ({
            ...cafe,
            reviews: reviewsByCafe[cafe.id] || [],
          }))
        );
      }
    };

    fetchReviews();
  }, [cafes.length]);

  // 1) map to computed fields, 2) filter by search, 3) apply sort / "top N" filtering
  const computed = cafes.map((cafe) => {
    const totalReviews = cafe.reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? cafe.reviews!.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews
        : 0;

    return {
      id: cafe.id,
      title: cafe.name,
      description: cafe.description,
      link: `/cafes/${cafe.id}`,
      image: cafe.image_url,
      averageRating,
      reviewCount: totalReviews,
    };
  });

  // apply search filter
  const searched = computed.filter((cafe) =>
    cafe.title.toLowerCase().includes(search.toLowerCase())
  );

  // apply sorting + "top N" behavior
  let finalList = [...searched];

  if (sortBy === "name") {
    finalList.sort((a, b) => a.title.localeCompare(b.title));
    // show all when sorting by name
  } else if (sortBy === "reviews") {
    // Most Reviewed -> show only top N by reviewCount
    finalList.sort((a, b) => b.reviewCount - a.reviewCount);
    finalList = finalList.slice(0, TOP_N);
  } else if (sortBy === "stars") {
    // Highest Rated -> show only top N by averageRating
    finalList.sort((a, b) => b.averageRating - a.averageRating);
    finalList = finalList.slice(0, TOP_N);
  }

  return (
    <div className="p-6">
      {/* Search + Sort controls */}
      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between">
        <div className="pt-5 pl-3">
          {sortBy === "reviews" && (
            <p className="text-sm mb-2">
              Showing top {TOP_N} most reviewed cafes
            </p>
          )}
          {sortBy === "stars" && (
            <p className="text-sm mb-2">
              Showing top {TOP_N} highest rated cafes
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="🔍 Search cafes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[280px]"
          />

          <Select
            value={sortBy}
            onValueChange={(val: string) =>
              setSortBy(val as "name" | "reviews" | "stars")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort / Show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">All (A → Z)</SelectItem>
              <SelectItem value="reviews">
                Most Reviewed (Top {TOP_N})
              </SelectItem>
              <SelectItem value="stars">Highest Rated (Top {TOP_N})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* quick "Show all" control when in top-N view */}
        {/* {sortBy !== "name" && (
          <button
            onClick={() => setSortBy("name")}
            className="text-sm underline ml-2"
            title="Show all cafes"
          >
            Show all
          </button>
        )} */}
      </div>

      {/* optional helper text so user knows they're seeing top-N */}

      <HoverEffect
        items={finalList.map((cafe) => ({
          title: cafe.title,
          description: cafe.description,
          link: cafe.link,
          image: cafe.image,
          review: parseFloat(cafe.averageRating.toFixed(1)), // average stars shown on card
          rating: cafe.reviewCount, // number of reviews shown on card
        }))}
      />
    </div>
  );
}
