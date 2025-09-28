"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheckIcon,
  EditIcon,
  MapPinned,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";
import { ReviewForm } from "@/components/ReviewForm";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
  const supabase = createSupabaseBrowser();
  const { id } = React.use(params);

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Track editable comments
  const [editComments, setEditComments] = useState<Record<string, string>>({});
  // Track which edit dialogs are open
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const { data: cafeData, error: cafeError } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .single();

      if (cafeError || !cafeData) return notFound();
      setCafe(cafeData);

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("cafe_id", id)
        .order("created_at", { ascending: false });

      const { data: users } = await supabase
        .from("users")
        .select("id, full_name");

      const mergedReviews =
        reviewData?.map((r) => ({
          ...r,
          user: users?.find((u) => u.id === r.user_id) ?? null,
        })) || [];

      setReviews(mergedReviews);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Initialize editComments state
      const initialComments: Record<string, string> = {};
      mergedReviews.forEach((r) => {
        initialComments[r.id] = r.comment;
      });
      setEditComments(initialComments);
    }

    fetchData();
  }, [id, supabase]);

  // Delete review
  async function handleDelete(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      console.error("Delete failed:", error);
    } else {
      setReviews(reviews.filter((r) => r.id !== reviewId));
      setEditComments((prev) => {
        const copy = { ...prev };
        delete copy[reviewId];
        return copy;
      });
    }
  }

  // Edit review
  async function handleEdit(review: Review) {
    const comment = editComments[review.id];
    if (!comment?.trim()) return;

    const { error } = await supabase
      .from("reviews")
      .update({ comment: comment.trim() })
      .eq("id", review.id);

    if (error) {
      console.error("Update failed:", error);
    } else {
      setReviews(
        reviews.map((r) =>
          r.id === review.id ? { ...r, comment: comment.trim() } : r
        )
      );
      // Close the dialog
      setOpenDialogs((prev) => ({
        ...prev,
        [review.id]: false,
      }));
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
      {/* Cafe Info */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-12">
        <div className="relative w-32 h-32 mb-4 md:mb-0 md:w-40 md:h-40">
          <Image
            src={cafe.image_url}
            alt={cafe.name}
            fill
            className="object-contain rounded-full border border-gray-200 shadow-sm bg-gray-50"
          />
        </div>
        <div className="flex flex-col">
          <div>
            <div className="text-4xl font-bold flex items-center gap-2">
              {cafe.name}
              <Badge className="bg-blue-500 text-white dark:bg-blue-600 mt-2">
                <BadgeCheckIcon /> Verified
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

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-center justify-between mb-5 ">
          <h2 className="text-3xl font-bold">Reviews</h2>

          <div className="flex-wrap space-x-3 space-y-3 gap-3">
            <Badge className="bg-purple-200/70 text-purple-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-200  hover:shadow-green-500/25 group">
              🍵 Taste
            </Badge>
            <Badge className="bg-blue-200/70 text-blue-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200  hover:shadow-green-500/25 group">
              💻 Productivity
            </Badge>
            <Badge className="bg-green-200/70 text-green-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200  hover:shadow-green-500/25 group">
              🌿 Environment
            </Badge>
            <Badge className="bg-red-200/70 text-red-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-200  hover:shadow-green-500/25 group">
              💰 Price
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between border-t border-gray-200 dark:border-gray-700 pt-8">
          {/* Stats */}
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
          <ReviewForm
            cafeId={id}
            onReviewSubmitted={(newReview) => {
              setReviews((prev) => [newReview, ...prev]);
            }}
          />
        </div>

        {/* Review List */}
        <div className="mt-12 flex flex-col gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <div className="flex flex-col gap-4">
                {/* Review Header */}
                <div className="flex gap-2 items-center">
                  <Badge
                    variant="outline"
                    className="h-5 min-w-5 rounded-full px-4 py-3 tabular-nums bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 dark:text-white shadow-lg"
                  >
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
                  </Badge>
                </div>

                {/* Comment */}
                <div className=" py-2">
                  <p>{review.comment}</p>
                </div>

                {/* User actions - Only show if current user owns this review */}
                {currentUser?.id === review.user_id && (
                  <div className="flex gap-3 mt-2">
                    {/* Edit Dialog */}
                    <Dialog
                      open={openDialogs[review.id] ?? false}
                      onOpenChange={(isOpen) =>
                        setOpenDialogs((prev) => ({
                          ...prev,
                          [review.id]: isOpen,
                        }))
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-green-500/20 backdrop-blur-sm border border-green-300/30 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200 shadow-lg hover:shadow-green-500/25 group"
                        >
                          <EditIcon className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                          Edit
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="motion-safe:animate-none">
                        <DialogHeader>
                          <DialogTitle>Edit your review</DialogTitle>
                        </DialogHeader>

                        <textarea
                          value={editComments[review.id] || ""}
                          onChange={(e) =>
                            setEditComments((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring focus:ring-green-300 resize-none"
                          rows={4}
                          placeholder="Update your comment..."
                        />

                        <DialogFooter className="gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={() => handleEdit(review)}
                            disabled={!editComments[review.id]?.trim()}
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Alert Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-300/30 dark:text-red-200 hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50 transition-all duration-200 shadow-lg hover:shadow-red-500/25 group"
                        >
                          <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="motion-safe:animate-none">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your review.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Review
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
