"use client";

import mapboxgl, { MarkerOptions } from "mapbox-gl";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useMap } from "@/context/map-context";
import { LocationFeature } from "@/lib/mapbox/utils";

type Props = {
  longitude: number;
  latitude: number;
  data: any;
  onHover?: ({
    isHovered,
    position,
    marker,
    data,
  }: {
    isHovered: boolean;
    position: { longitude: number; latitude: number };
    marker: mapboxgl.Marker;
    data: LocationFeature;
  }) => void;
  onClick?: ({
    position,
    marker,
    data,
  }: {
    position: { longitude: number; latitude: number };
    marker: mapboxgl.Marker;
    data: LocationFeature;
  }) => void;
  children?: React.ReactNode; // Allow children to be passed
} & MarkerOptions;

export default function Marker({
  children,
  latitude,
  longitude,
  data,
  onHover,
  onClick,
  ...props
}: Props) {
  const { map } = useMap();
  let marker: mapboxgl.Marker | null = null;

  const handleHover = (isHovered: boolean) => {
    if (onHover && marker) {
      onHover({
        isHovered,
        position: { longitude, latitude },
        marker,
        data,
      });
    }
  };

  const handleClick = () => {
    if (onClick && marker) {
      onClick({
        position: { longitude, latitude },
        marker,
        data,
      });
    }
  };

  useEffect(() => {
    if (!map) return;

    // Create a custom marker element
    const markerEl = document.createElement("div");
    markerEl.style.display = "flex";
    markerEl.style.alignItems = "center";
    markerEl.style.justifyContent = "center";
    markerEl.style.cursor = "pointer";

    // Render children inside the marker element
    if (children) {
      ReactDOM.render(<>{children}</>, markerEl);
    }

    // Add event listeners
    markerEl.addEventListener("mouseenter", () => handleHover(true));
    markerEl.addEventListener("mouseleave", () => handleHover(false));
    markerEl.addEventListener("click", handleClick);

    // Marker options
    const options = {
      element: markerEl,
      ...props,
    };

    marker = new mapboxgl.Marker(options)
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      // Cleanup on unmount
      if (marker) marker.remove();
      ReactDOM.unmountComponentAtNode(markerEl);
      markerEl.removeEventListener("mouseenter", () => handleHover(true));
      markerEl.removeEventListener("mouseleave", () => handleHover(false));
      markerEl.removeEventListener("click", handleClick);
    };
  }, [map, longitude, latitude, children, props]);

  return null; // No need to render anything directly
}
