// app/cafes/[id]/page.tsx
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CafeClient from "./CafeClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabaseBrowser();

  // ✅ fetch name + image_url from Supabase
  const { data: cafe } = await supabase
    .from("cafes")
    .select("name, image_url")
    .eq("id", id)
    .single();

  if (!cafe) {
    return {
      title: "Cafe Not Found - RateMyCafe",
      description: "This cafe does not exist or was removed.",
      icons: { icon: "/logo.png" },
    };
  }

  const siteUrl = "https://ratemycafe.vercel.app"; // change to your domain

  return {
    title: `${cafe.name} - RateMyCafe`,
    description: `Discover reviews and ratings for ${cafe.name} on RateMyCafe.`,
    openGraph: {
      title: `${cafe.name} - RateMyCafe`,
      description: `Discover reviews and ratings for ${cafe.name} on RateMyCafe.`,
      images: [
        {
          url: cafe.image_url?.startsWith("http")
            ? cafe.image_url
            : `${siteUrl}${cafe.image_url}`, // ensure absolute
          width: 1200,
          height: 630,
          alt: cafe.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cafe.name} - RateMyCafe`,
      description: `Discover reviews and ratings for ${cafe.name} on RateMyCafe.`,
      images: [
        cafe.image_url?.startsWith("http")
          ? cafe.image_url
          : `${siteUrl}${cafe.image_url}`,
      ],
    },
    icons: {
      icon: cafe.image_url?.startsWith("http")
        ? cafe.image_url
        : `${siteUrl}${cafe.image_url}`,
    },
  };
}

// ----------------------
// Page Component
// ----------------------
export default async function CafeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createSupabaseBrowser();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cafe) {
    notFound();
  }

  return <CafeClient cafe={cafe} />;
}
