"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

type MapClientProps = {
  coords: { coordinates: [number, number][][] };
  markerPosition?: [number, number] | null;
  onMapClick?: (coords: [number, number]) => void;
  guessSubmitted?: boolean;
};

export default function MapClient({ coords, markerPosition, onMapClick, guessSubmitted }: MapClientProps) {
  return <Map streetCoordinates={coords.coordinates} markerPosition={markerPosition} onMapClick={onMapClick} guessSubmitted={guessSubmitted} />;
}