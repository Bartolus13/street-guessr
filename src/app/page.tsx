"use client";

import { useEffect, useState } from "react";
import MapClient from "@/components/MapClient";
import * as turf from "@turf/turf";

export default function Page() {

  type Street = {
    name: string;
    coordinates: [number, number][];
  }

  type StreetData = {
    type: string;
    properties: {name: string};
    geometry: {coordinates: [number, number][]};
  }

  type StreetFeature = { 
    features: StreetData[];
  };

  const [streets, setStreets] = useState<Street[]>([]);
  const [streetName, setStreetName] = useState("Loading...");
  const [streetCoordinates, setStreetCoordinates] = useState<[number, number][]>([]);
  const [clickedCoordinates, setClickedCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch("/street_data/merged.geojson")
      .then((response) => response.json())
      .then((data: StreetFeature) => {
        
        setStreets(data.features.map((feature: StreetData) => ({
          name: feature.properties.name,
          coordinates: feature.geometry.coordinates
        })));
      })
      .catch((error) => {
        console.error("Error fetching streets:", error);
      });
  }, []);




    const pickRandomStreet = () => {
    if (streets.length === 0) {
      return;
    }

    const randomStreet = streets[Math.floor(Math.random() * streets.length)];
    setStreetName(randomStreet.name);
    setStreetCoordinates(randomStreet.coordinates);
  };

  function distanceToStreet(clickLat: number, clickLng: number, street: Street) {
    const point = turf.point([clickLng, clickLat]);

    const line = turf.lineString(
      street.coordinates.map(([lat, lng]) => [lng, lat])
    );

    return turf.pointToLineDistance(point, line, {
      units: "meters",
    });
}

  return (
    <>
      <div className="h-full w-full z-0">
        <MapClient
          coords={{ coordinates: streetCoordinates }}
          onMapClick={setClickedCoordinates}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 text-center text-white z-10">
        <h1 className="text-xl font-semibold">{streetName}</h1>
        {clickedCoordinates ? (
          <p className="mt-2 text-sm">
            Clicked: {clickedCoordinates[0].toFixed(4)}, {clickedCoordinates[1].toFixed(4)}
          </p>
        ) : null}
        {clickedCoordinates ? (
          <p className="mt-2 text-sm">
            Distance: {distanceToStreet(clickedCoordinates[0], clickedCoordinates[1], { name: streetName, coordinates: streetCoordinates }).toFixed(2)} meters
          </p>
        ) : null}
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