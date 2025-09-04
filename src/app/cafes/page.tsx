"use client";

import { useEffect, useState } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import { HoverEffect } from "@/components/ui/card-hover-effect";

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
}

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);

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
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("cafe_id, rating");

      if (reviewsData) {
        // Group reviews by cafe_id and calculate averages
        const reviewsByCafe = reviewsData.reduce((acc, review) => {
          if (!acc[review.cafe_id]) {
            acc[review.cafe_id] = [];
          }
          acc[review.cafe_id].push(review);
          return acc;
        }, {} as Record<string, Review[]>);

        // Update cafes with review data
        setCafes((prevCafes) =>
          prevCafes.map((cafe) => ({
            ...cafe,
            reviews: reviewsByCafe[cafe.id] || [],
          }))
        );
      }
    };

    fetchReviews();
  }, [cafes.length]);

  const items = cafes.map((cafe) => {
    const totalReviews = cafe.reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? (
            cafe.reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) /
            totalReviews
          ).toFixed(1)
        : "0.0";

    return {
      id: cafe.id,
      title: cafe.name,
      description: cafe.description,
      link: `/cafes/${cafe.id}`,
      image: cafe.image_url,
      review: parseFloat(averageRating),
      rating: totalReviews,
    };
  });

  return (
    <div className="p-6">
      <HoverEffect items={items} />
    </div>
  );
}
