"use client";

import { createClientSupabase } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheckIcon, MapPinned, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";
import { ReviewForm } from "@/components/ReviewForm";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};
type Cafe = {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
};

type User = {
  id: string;
  full_name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  user?: {
    id: string;
    full_name: string;
  } | null;
};

export default function CafeDetailPage({ params }: PageProps) {
  const supabase = createClientSupabase();
  const { id } = React.use(params);

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch cafe, reviews, and user
  useEffect(() => {
    async function fetchData() {
      // 1️⃣ Get cafe details
      const { data: cafeData, error: cafeError } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .single();

      if (cafeError || !cafeData) return notFound();
      setCafe(cafeData);

      // 2️⃣ Get reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("cafe_id", id)
        .order("created_at", { ascending: false });

      // 3️⃣ Get users
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name");

      // 4️⃣ Merge reviews with user info
      const mergedReviews =
        reviewData?.map((r) => ({
          ...r,
          user: users?.find((u) => u.id === r.user_id) ?? null,
        })) || [];

      setReviews(mergedReviews);

      // 5️⃣ Get current logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    }

    fetchData();
  }, [currentUser, id, supabase]);

  // 🔹 Delete a review
  async function handleDelete(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      console.error("Delete failed:", error);
    } else {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  }

  // 🔹 Edit a review
  async function handleEdit(review: Review) {
    const newComment = prompt("Edit your review:", review.comment);
    if (!newComment) return;

    const { error } = await supabase
      .from("reviews")
      .update({ comment: newComment })
      .eq("id", review.id);

    if (error) {
      console.error("Update failed:", error);
    } else {
      setReviews(
        reviews.map((r) =>
          r.id === review.id ? { ...r, comment: newComment } : r
        )
      );
    }
  }

  if (!cafe) return null;

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-5xl w-full mx-auto px-4 pt-20 pb-12 text-[17px] leading-relaxed">
      {/* Cafe Info Section */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-12">
        <div className="relative w-32 h-32 mb-4 md:mb-0 md:w-40 md:h-40">
          <Image
            src={cafe.image_url}
            alt={cafe.name}
            fill
            className="object-cover rounded-full border"
          />
        </div>

        <div className="flex flex-col">
          <div>
            <div className="text-4xl font-bold flex items-center gap-2">
              {cafe.name}
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
              <p className="text-2xl font-semibold">{totalReviews}</p>
            </div>
            <div>
              <p className="text-base">Average Rating</p>
              <p className="text-2xl font-semibold">{averageRating}</p>
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

        <div className="my-20">
          <ReviewForm cafeId={id} />
        </div>

        {/* Display Submitted Reviews */}
        <div className=" mt-12 flex flex-col gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className=" border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <div className="flex flex-col  gap-2">
                <div className="flex gap-2">
                  <span className="font-semibold">{review.rating}</span>
                  <Star className="text-yellow-400 fill-yellow-400" />

                  <span className="text-sm flex gap-2">
                    from{" "}
                    <p className="font-bold">
                      {review.user?.full_name ?? "Anonymous"}
                    </p>
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* ✅ Only show if this review belongs to the current user */}

                {currentUser?.id === review.user_id && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
                    {/* Comment section - takes full width on mobile, limited width on larger screens */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300 break-words">
                        {review.comment}
                      </p>
                    </div>

                    {/* Button section - stacks vertically on mobile, horizontal on larger screens */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-4 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:bg-green-500 bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-600"
                        onClick={() => handleEdit(review)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:bg-red-500 bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
