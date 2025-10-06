"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
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

  const TOP_N = 5; // how many top items to show

  useEffect(() => {
    const fetchCafes = async () => {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.from("cafes").select("*");

      if (error) {
        console.error("Error fetching cafes:", error.message);
      } else {
        console.log("Fetched cafes:", data);
        setCafes(data || []);
      }
    };

    fetchCafes();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (cafes.length === 0) return;

      const supabase = createSupabaseBrowser();
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

  // 1) compute review stats
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
      review: averageRating, // average rating
      rating: totalReviews, // number of reviews
    };
  });

  // 2) apply search filter
  const searched = computed.filter((cafe) =>
    cafe.title.toLowerCase().includes(search.toLowerCase())
  );

  // 3) apply sorting + "top N"
  let finalList = [...searched];
  if (sortBy === "name") {
    finalList.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "reviews") {
    finalList.sort((a, b) => b.rating - a.rating);
    finalList = finalList.slice(0, TOP_N);
  } else if (sortBy === "stars") {
    finalList.sort((a, b) => b.review - a.review);
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
      </div>

      {/* ✅ Conditional display */}
      {cafes.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg font-medium">
            🚫 No cafes available yet
          </p>
        </div>
      ) : finalList.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg font-medium">
            ☕ No Coffee Shop Found
          </p>
        </div>
      ) : (
        <HoverEffect
          items={finalList.map((cafe) => ({
            id: cafe.id,
            title: cafe.title,
            description: cafe.description,
            link: cafe.link,
            image: cafe.image,
            review: cafe.review,
            rating: cafe.rating,
          }))}
        />
      )}
    </div>
  );
}
