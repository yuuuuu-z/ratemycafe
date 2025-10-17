// components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

type ReviewFormProps = {
  cafeId: string;
  onReviewSubmitted?: (newReview: Review) => void;
};

export const ReviewForm = ({ cafeId, onReviewSubmitted }: ReviewFormProps) => {
  const c = useTranslations("cafe");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createSupabaseBrowser();

  const clearRating = () => {
    setRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (rating === 0) {
      toast.error("Please select a rating");
      setIsSubmitting(false);
      return;
    }

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to submit a review");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          cafe_id: cafeId,
          user_id: user.id,
          rating,
          comment,
        })
        .select("id, rating, comment, created_at, user_id")
        .single();

      if (error) {
        throw error;
      }

      toast.success("Review submitted successfully!");

      // Create the new review object with user data
      const newReview: Review = {
        id: data.id,
        rating: data.rating,
        comment: data.comment,
        created_at: data.created_at,
        user_id: data.user_id,
        user: {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Anonymous",
        },
      };

      // Call the callback to update parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      // Reset form
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold">{c("leaveReview")}</h3>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            >
              <Star
                size={30}
                className={`cursor-pointer transition-colors duration-200 ${
                  starValue <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearRating}
            aria-label="Clear rating"
            className=" rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={16} className="text-gray-500 hover:text-gray-700" />
          </Button>
        )}
      </div>
      <Textarea
        placeholder={c("cmt")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={500}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? c("submitting") : c("SubmitReview")}
      </Button>
    </form>
  );
};
