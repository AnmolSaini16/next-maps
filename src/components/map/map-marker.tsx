"use client";

import mapboxgl, { MarkerOptions } from "mapbox-gl";
import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { useMap } from "@/context/map-context";
import { LocationFeature } from "@/lib/mapbox/utils";

type Props = {
  longitude: number;
  latitude: number;
  data: LocationFeature;
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
  children?: React.ReactNode;
} & MarkerOptions;

export default function Marker({
  children,
  latitude,
  longitude,
  data,
  onHover,
  onClick,
  ...markerOptions
}: Props) {
  const { map } = useMap();
  const elementRef = useRef<HTMLDivElement>(document.createElement("div"));
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const position = useMemo<[number, number]>(
    () => [longitude, latitude],
    [longitude, latitude]
  );

  useEffect(() => {
    if (!map) return;

    const el = elementRef.current;
    const marker = new mapboxgl.Marker({ element: el, ...markerOptions })
      .setLngLat(position)
      .addTo(map);
    markerRef.current = marker;

    const enter = () =>
      onHover?.({
        isHovered: true,
        position: { longitude: position[0], latitude: position[1] },
        marker,
        data,
      });

    const leave = () =>
      onHover?.({
        isHovered: false,
        position: { longitude: position[0], latitude: position[1] },
        marker,
        data,
      });

    const click = () =>
      onClick?.({
        position: { longitude: position[0], latitude: position[1] },
        marker,
        data,
      });

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("click", click);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("click", click);
      marker.remove();
      markerRef.current = null;
    };
  }, [map, markerOptions, data, onHover, onClick]);

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setLngLat(position);
  }, [position]);

  return createPortal(children, elementRef.current);
}
