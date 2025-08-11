"use client";

import { useEffect, useState } from "react";
import { Carousel } from "./ui/carousel";
import { createClientSupabase } from "@/utils/supabase/client";

interface SlideData {
  src: string;
}

export function ImageSlider({ cafeId }: { cafeId: string }) {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const supabase = createClientSupabase();

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("cafes")
        .select("gallery_urls")
        
        .eq("id", cafeId)
        .single();

      if (error) {
        console.error("Failed to fetch gallery:", error.message);
        return;
      }

      if (data?.gallery_urls) {
        const formatted = data.gallery_urls.map((url: string) => ({
          src: url,
        }));
        setSlides(formatted);
      }
    };

    fetchGallery();
  }, [cafeId, supabase]);

  if (slides.length === 0) {
    return (
      <div className="text-center  mt-5  animate-pulse">Loading gallery...</div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-full py-20">
      <Carousel slides={slides} />
    </div>
  );
}
