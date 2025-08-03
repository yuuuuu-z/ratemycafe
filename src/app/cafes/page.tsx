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

  const items = cafes.map((cafe) => ({
    id: cafe.id,
    title: cafe.name,
    description: cafe.description,
    link: `/cafes/${cafe.id}`, // future detail page
    image: cafe.image_url,
    review: 0, // static for now
  }));

  return (
    <div className="p-6">
      <HoverEffect items={items} />
    </div>
  );
}
