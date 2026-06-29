"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

type MapClientProps = {
  coords: { coordinates: [number, number][] };
  onMapClick?: (coords: [number, number]) => void;
};

export default function MapClient({ coords, onMapClick }: MapClientProps) {
  return <Map streetCoordinates={coords.coordinates} onMapClick={onMapClick} />;
}