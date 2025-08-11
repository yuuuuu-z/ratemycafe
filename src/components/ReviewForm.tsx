// components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ReviewFormProps = {
  cafeId: string;
};

export const ReviewForm = ({ cafeId }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientSupabase();
  const router = useRouter();

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
      const { error } = await supabase.from("reviews").insert({
        cafe_id: cafeId,
        user_id: user.id,
        rating,
        comment,
      });

      if (error) {
        throw error;
      }

      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setComment("");

      // Refresh the page or reviews section
      router.refresh();
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
      <h3 className="text-xl font-semibold">Leave a Review</h3>
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
      <Textarea
        placeholder="Share your thoughts about this cafe..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={500} // Consider adding a character limit
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};
