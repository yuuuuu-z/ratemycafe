// app/cafe/[id]/page.tsx
import { createClientSupabase } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheckIcon, MapPinned, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";
import { ReviewForm } from "@/components/ReviewForm"; // 1️⃣ Import the new component

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CafeDetailPage({ params }: PageProps) {
  const supabase = createClientSupabase();
  const { id } = await params;

  // 1️⃣ Get cafe details
  const { data: cafe, error: cafeError } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cafe || cafeError) return notFound();

  // 2️⃣ Get reviews for this cafe, including the comment and created_at
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at")
    .eq("cafe_id", id)
    .order("created_at", { ascending: false }); // Show newest reviews first

  const totalReviews = reviews?.length || 0;
  const averageRating =
    totalReviews > 0
      ? (
          (reviews || []).reduce((sum, r) => sum + (r.rating || 0), 0) /
          totalReviews
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
        <div className="mt-12 flex flex-col gap-8">
          {/* 2️⃣ Place the new form here */}
          {reviews?.map((review, index) => (
            <div
              key={index}
              className="border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.rating}</span>
                <Star className="text-yellow-400 fill-yellow-400" />
                

                <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
