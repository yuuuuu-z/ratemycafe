"use client";
import { useState, useEffect } from "react";

export default function UserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [place, setPlace] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);

          // fetch place name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
          );
          const data = await res.json();
          setPlace(data.display_name);
        },
        (err) => {
          console.error("Error:", err);
        }
      );
    }
  }, []);

  return (
    <div className="text-sm">
      {place ? (
        <p>{place}</p>
      ) : location ? (
        <p>
          Getting place name for {location.lat}, {location.lng}...
        </p>
      ) : (
        <p>Getting your location...</p>
      )}
    </div>
  );
}
