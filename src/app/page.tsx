"use client";

import { useRef } from "react";

import MapProvider from "@/lib/mapbox/provider";
import MapStyles from "@/components/map/map-styles";
import MapCotrols from "@/components/map/map-controls";
import MapSearch from "@/components/map/map-search";
import MapTileset from "@/components/map/map-tileset"; // Import the MapTileset component

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-screen h-screen">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: 10.345117,
          latitude: 56.042365,
          zoom: 6,
        }}
      >
        <MapSearch />
        <MapTileset /> 
        <MapCotrols />
        <MapStyles />
      </MapProvider>
    </div>
  );
}
