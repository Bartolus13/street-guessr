"use client";

import { useEffect, useState } from "react";
import MapClient from "@/components/MapClient";

type GeoJsonFeature = {
  properties?: {
    name?: string;
  };
};

type GeoJsonData = {
  features?: GeoJsonFeature[];
};

export default function Page() {
  const [streetNames, setStreetNames] = useState<string[]>([]);
  const [streetName, setStreetName] = useState("Loading...");

  useEffect(() => {
    fetch("/street_data/warsaw.geojson")
      .then((response) => response.json())
      .then((data: GeoJsonData) => {
        const names = (data.features ?? [])
          .map((feature) => feature.properties?.name?.trim())
          .filter((name): name is string => Boolean(name && name.length > 0));

        setStreetNames(names);

        if (names.length > 0) {
          const randomStreet = names[Math.floor(Math.random() * names.length)];
          setStreetName(randomStreet);
        } else {
          setStreetName("No streets found");
        }
      })
      .catch(() => {
        setStreetName("Unable to load streets");
      });
  }, []);

  const pickRandomStreet = () => {
    if (streetNames.length === 0) {
      return;
    }

    const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
    setStreetName(randomStreet);
  };

  return (
    <>
      <div className="h-full w-full z-0">
        <MapClient />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 text-center text-white z-10">
        <h1 className="text-xl font-semibold">{streetName}</h1>
        <button
          type="button"
          onClick={pickRandomStreet}
          className="mt-2 rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200"
        >
          Pick random street
        </button>
      </div>
    </>
  );
}