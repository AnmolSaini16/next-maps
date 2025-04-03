"use client";

import { useRef } from "react";

import MapProvider from "@/lib/mapbox/provider";
import MapStyles from "@/components/map/map-styles";
import MapCotrols from "@/components/map/map-controls";
import MapSearch from "@/components/map/map-search";

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
          longitude: 78.9629,
          latitude: 20.5937,
          zoom: 3.5,
        }}
      >
        <MapSearch />
        <MapCotrols />
        <MapStyles />
      </MapProvider>
    </div>
  );
}
