"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import { Skeleton } from "@/components/ui/skeleton";

type Cafe = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  lat?: number;
  lng?: number;
};

type CafeClientProps = {
  cafe: Cafe;
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

export default function CafeClient({ cafe }: CafeClientProps) {
  const supabase = createSupabaseBrowser();
  const id = cafe.id;

  const [localCafe, setLocalCafe] = useState<Cafe | null>(cafe ?? null);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [editComments, setEditComments] = useState<Record<string, string>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // re-fetch cafe in client (optional, keeps client data fresh)
      const { data: cafeData } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .single();

      if (cafeData) setLocalCafe(cafeData);

      // fetch reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("cafe_id", id)
        .order("created_at", { ascending: false });

      // fetch users to attach to reviews (simple join emulation)
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name");

      const mergedReviews =
        reviewData?.map((r) => ({
          ...r,
          user: users?.find((u) => u.id === r.user_id) ?? null,
        })) || [];

      setReviews(mergedReviews);

      // current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // initial edit comments
      const initialComments: Record<string, string> = {};
      mergedReviews.forEach((r) => {
        initialComments[r.id] = r.comment;
      });
      setEditComments(initialComments);

      setLoading(false);
    }

    fetchData();
  }, [id, supabase]);

  async function handleDelete(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setEditComments((prev) => {
        const copy = { ...prev };
        delete copy[reviewId];
        return copy;
      });
    }
  }

  async function handleEdit(review: Review) {
    const comment = editComments[review.id];
    if (!comment?.trim()) return;

    const { error } = await supabase
      .from("reviews")
      .update({ comment: comment.trim() })
      .eq("id", review.id);

    if (!error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, comment: comment.trim() } : r
        )
      );
      setOpenDialogs((prev) => ({ ...prev, [review.id]: false }));
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-5xl w-full mx-auto px-4 pt-20 pb-12">
          {/* skeletons */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
            <div className="flex flex-col gap-4 flex-1">
              <Skeleton className="h-8 w-1/3 rounded" />
              <Skeleton className="h-5 w-1/4 rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 border-t pt-6">
                <Skeleton className="h-6 w-1/4 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!localCafe) return null;

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <ProtectedRoute>
      <div className="max-w-5xl w-full mx-auto px-4 pt-20 pb-12 text-[17px] leading-relaxed">
        {/* Cafe Info */}
        <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-12">
          <div className="relative w-32 h-32 mb-4 md:mb-0 md:w-40 md:h-40">
            <Image
              src={localCafe.image_url ?? ""}
              alt={localCafe.name}
              fill
              className="object-contain rounded-full border border-gray-200 shadow-sm bg-gray-50"
            />
          </div>

          <div className="flex flex-col">
            <div>
              <div className="text-4xl font-bold flex items-center gap-2">
                {localCafe.name}
                <Badge className="bg-blue-500 text-white dark:bg-blue-600 mt-2">
                  <BadgeCheckIcon /> Verified
                </Badge>
              </div>
              <div className="text-lg mt-2 flex items-center gap-2">
                <MapPinned size={15} color="green" /> {localCafe.location}
                <Badge variant="outline">
                  <a
                    href={`https://www.google.com/maps?q=${localCafe.lat},${localCafe.lng}`}
                    target="_blank"
                    // rel="noopener noreferrer"
                  >
                    View on Map
                  </a>
                </Badge>
              </div>
              <p className="mt-4 text-lg max-w-3xl">{localCafe.description}</p>
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
              <Badge className="bg-purple-200/70 text-purple-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm">
                🍵 Taste
              </Badge>
              <Badge className="bg-blue-200/70 text-blue-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm">
                💻 Productivity
              </Badge>
              <Badge className="bg-green-200/70 text-green-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm">
                🌿 Environment
              </Badge>
              <Badge className="bg-red-200/70 text-red-800 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm">
                💰 Price
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between border-t border-gray-200 dark:border-gray-700 pt-8">
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

                  <div className="py-2">
                    <p>{review.comment}</p>
                  </div>

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
                          <Button variant="ghost" size="sm">
                            <EditIcon className="w-3 h-3" />
                            Edit
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg p-5">
                          <DialogHeader className="space-y-2">
                            <DialogTitle>Edit your review</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                              Update your thoughts about this cafe
                            </p>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <textarea
                              value={editComments[review.id] || ""}
                              onChange={(e) =>
                                setEditComments((prev) => ({
                                  ...prev,
                                  [review.id]: e.target.value,
                                }))
                              }
                              className="w-full p-3 border rounded-lg"
                              rows={5}
                              placeholder="Share your updated thoughts..."
                            />
                          </div>

                          <DialogFooter>
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

                      {/* Delete Alert */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
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
    </ProtectedRoute>
  );
}
