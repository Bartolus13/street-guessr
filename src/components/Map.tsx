"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet";
import { LatLngExpression, LatLng } from "leaflet";
import L from "leaflet";

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Component to enforce map bounds and zoom limits
function MapBoundsHandler({ 
  mapBounds, 
  minZoom, 
  maxZoom 
}: { 
  mapBounds: LatLngExpression[]; 
  minZoom: number; 
  maxZoom: number; 
}) {
  const enforcingRef = useRef(false);
  
  const map = useMapEvents({
    zoom() {
      // Enforce zoom limits
      if (map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
      }
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom);
      }
    },
    moveend() {
      // Only enforce bounds after move has completed
      if (enforcingRef.current) return;
      
      const bounds = L.latLngBounds(mapBounds[0], mapBounds[1]);
      if (!bounds.contains(map.getCenter())) {
        enforcingRef.current = true;
        map.fitBounds(bounds);
        setTimeout(() => {
          enforcingRef.current = false;
        }, 100);
      }
    }
  });
  return null;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

function MapViewController({
  streetCoordinates,
  markerPosition,
  guessSubmitted,
}: {
  streetCoordinates: [number, number][][];
  markerPosition: [number, number] | null;
  guessSubmitted?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!guessSubmitted || !markerPosition || streetCoordinates.length === 0) {
      return;
    }

    const points = streetCoordinates.flatMap((segment) =>
      segment.map(([lat, lng]) => [lat, lng] as [number, number])
    );

    points.push(markerPosition);

    const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng] as LatLngExpression));

    map.fitBounds(bounds, {
      padding: [24, 24],
      paddingBottomRight: [0, 220],
      duration: 1.2,
    });
  }, [streetCoordinates, markerPosition, guessSubmitted, map]);

  return null;
}

export default function Map({
  streetCoordinates,
  markerPosition,
  onMapClick,
  guessSubmitted
}: {
  streetCoordinates: [number, number][][];
  markerPosition?: [number, number] | null;
  onMapClick?: (coords: [number, number]) => void;
  guessSubmitted?: boolean;
}) {
  const defaultPosition: LatLngExpression = [52.2298, 21.0118]; // Coordinates for Warsaw
  
  // === TWEAK THESE VARIABLES TO CONTROL MAP LIMITS ===
  const minZoom = 11; // Minimum zoom level (lower = more zoomed out)
  const maxZoom = 18; // Maximum zoom level (higher = more zoomed in)
  
  // Define the area users can pan to [southwest corner, northeast corner]
  // Each corner is [latitude, longitude]
  const mapBounds = [
    [52.05, 20.8],   // Southwest corner [minLat, minLng]
    [52.4, 21.3]     // Northeast corner [maxLat, maxLng]
  ] as LatLngExpression[];
  
  const [internalMarkerPosition, setInternalMarkerPosition] = useState<LatLngExpression | null>(null);
  const currentMarkerPosition = markerPosition ?? internalMarkerPosition ?? [0, 0];
  
  // Handle click events - replace marker position with new location
  const handleMapClick = (latlng: LatLng) => {
    if (guessSubmitted) {
      return; // Do not allow marker movement after guess submission
    }
    setInternalMarkerPosition([latlng.lat, latlng.lng]);
    onMapClick?.([latlng.lat, latlng.lng]);
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: "100vh", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        attribution='© CartoDB'
      />
      <MapBoundsHandler mapBounds={mapBounds} minZoom={minZoom} maxZoom={maxZoom} />
      <MapClickHandler onMapClick={handleMapClick} />
      <MapViewController
        streetCoordinates={streetCoordinates}
        markerPosition={markerPosition ?? null}
        guessSubmitted={guessSubmitted}
      />
      
      {/* Render the single marker */}
      <Marker position={currentMarkerPosition}>
        <Popup>Marker</Popup>
      </Marker>
      {streetCoordinates.map((segment, i) => (
          <Polyline
              key={i}
              positions={segment}
              color="red"
          />
      ))}
    </MapContainer>
  );
}