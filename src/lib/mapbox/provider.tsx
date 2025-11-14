"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { MapContext } from "@/context/map-context";
import { Loader } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapComponentProps = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  children?: React.ReactNode;
};

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}: MapComponentProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    mapRef.current = mapInstance;

    const onLoad = () => setLoaded(true);

    mapInstance.on("load", onLoad);

    return () => {
      mapInstance.off("load", onLoad);
      mapInstance.remove();
      mapRef.current = null;
    };
  }, [initialViewState]);

  return (
    <div className="z-[1000]">
      <MapContext.Provider value={{ map: mapRef.current! }}>
        {children}
      </MapContext.Provider>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-lg font-medium flex items-center gap-2">
            <Loader className="size-5 animate-spin" />
            Loading map...
          </div>
        </div>
      )}
    </div>
  );
}
