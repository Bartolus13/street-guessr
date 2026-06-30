"use client";

import { useEffect, useState } from "react";
import MapClient from "@/components/MapClient";
import * as turf from "@turf/turf";

export type Difficulty = "easy" | "medium" | "hard" | "all";
export default function Page() {

  type Street = {
    name: string;
    coordinates: [number, number][][];
  }

  type StreetData = {
    type: string;
    properties: {name: string, highway: string};
    geometry: {coordinates: [number, number][][]};
  }

  type StreetFeature = { 
    features: StreetData[];
  };

  const [streets, setStreets] = useState<Street[]>([]);
  const [streetName, setStreetName] = useState("Loading...");
  const [streetCoordinates, setStreetCoordinates] = useState<[number, number][][]>([]);
  const [clickedCoordinates, setClickedCoordinates] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");

  const difficultyHighways = {
  easy: [
    "motorway", 
    "trunk", 
    "primary", 
    "secondary"
  ],
  medium: [
    "motorway", 
    "trunk", 
    "primary", 
    "secondary", 
    "tertiary"
  ],
  hard: [
    "motorway", 
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "residential",
  ],
  all: [
    "motorway", 
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "residential",
    "living_street",
    "unclassified",
  ],  
};

  useEffect(() => {
    fetch("/street_data/mokotow.geojson")
      .then((response) => response.json())
      .then((data: StreetFeature) => {
        const allowed = difficultyHighways[difficulty];
        const filtered = data.features.filter((feature: StreetData) =>
          allowed.includes(feature.properties.highway)
        );
        
        setStreets(filtered.map((feature: StreetData) => ({
          name: feature.properties.name,
          coordinates: feature.geometry.coordinates
        })));
      })
      .catch((error) => {
        console.error("Error fetching streets:", error);
      });
  }, []);

    const pickRandomStreet = () => {
      console.log("Streets available:", streets.length);
    if (streets.length === 0) {
      return;
    }

    const randomStreet = streets[Math.floor(Math.random() * streets.length)];
    setStreetName(randomStreet.name);
    setStreetCoordinates(randomStreet.coordinates);
    setGuessSubmitted(false);
    setClickedCoordinates([0, 0]);
    setDistance(null);
  };

  function distanceToStreet(clickLat: number, clickLng: number, street: Street) {
    const point = turf.point([clickLng, clickLat]);
    let minDistance: number | null = null;

    for (const segment of street.coordinates) {
      const line = turf.lineString(
        segment.map(([lat, lng]) => [lng, lat])
      );

      const dist = turf.pointToLineDistance(point, line, {
        units: "meters",
      });
      console.log(`Distance to street ${street.name}: ${dist} meters`);

      if (minDistance === null || dist < minDistance) {
        minDistance = dist;
      }
    }

    setDistance(minDistance);
    return minDistance;
  }

  const submitGuess = () => {
    if (!clickedCoordinates || clickedCoordinates[0] === 0 && clickedCoordinates[1] === 0) {
      return;
    }

    const [lat, lng] = clickedCoordinates;
    distanceToStreet(lat, lng, {
      name: streetName,
      coordinates: streetCoordinates,
    });
    setGuessSubmitted(true);
  };

  return (
    <>
      <div className="h-full w-full z-0">
        <MapClient
          coords={guessSubmitted ? { coordinates: streetCoordinates } : { coordinates: [[[0, 0], [0, 0]]] }}
          markerPosition={clickedCoordinates}
          onMapClick={setClickedCoordinates}
          guessSubmitted={guessSubmitted}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 text-center text-white z-10">
        <h1 className="text-xl font-semibold">{streetName}</h1>
        {guessSubmitted && distance !== null ? (
          <p className="mt-2 text-sm">
            Distance: {distance.toFixed(2)} meters
          </p>
        ) : null}
        <button
          type="button"
          onClick={pickRandomStreet}
          className="mt-2 rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200"
        >
          Pick random street
        </button>
        <div className=""></div>
        <button
          type="button"
          onClick={submitGuess}
          disabled={!clickedCoordinates}
          className="mt-2 rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Guess
        </button>
      </div>
    </>
  );
}