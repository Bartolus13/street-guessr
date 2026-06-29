"use client";

import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
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

export default function Map() {
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
  
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression>(defaultPosition);
  
  // Handle click events - replace marker position with new location
  const handleMapClick = (latlng: LatLng) => {
    setMarkerPosition([latlng.lat, latlng.lng]);
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: "100vh", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution='© CartoDB'
      />
      <MapBoundsHandler mapBounds={mapBounds} minZoom={minZoom} maxZoom={maxZoom} />
      <MapClickHandler onMapClick={handleMapClick} />
      
      {/* Render the single marker */}
      <Marker position={markerPosition}>
        <Popup>Marker</Popup>
      </Marker>
    </MapContainer>
  );
}