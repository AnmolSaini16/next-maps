"use client";

import { useMap } from "@/context/map-context";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

type PopupProps = {
  children: React.ReactNode;
  latitude?: number;
  longitude?: number;
  onClose?: () => void;
  marker?: mapboxgl.Marker;
  schoolType?: string; // Add schoolType prop
} & mapboxgl.PopupOptions;

export default function Popup({
  latitude,
  longitude,
  children,
  marker,
  onClose,
  className,
  schoolType, // Destructure schoolType
  ...props
}: PopupProps) {
  const { map } = useMap();

  const container = useMemo(() => {
    return document.createElement("div");
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!map) return;

    const popupOptions: mapboxgl.PopupOptions = {
      ...props,
      className: `mapboxgl-custom-popup ${className ?? ""}`,
    };

    const popup = new mapboxgl.Popup(popupOptions)
      .setDOMContent(container)
      .setMaxWidth("none");

    popup.on("close", handleClose);

    if (marker) {
      const currentPopup = marker.getPopup();
      if (currentPopup) {
        currentPopup.remove();
      }

      marker.setPopup(popup);

      marker.togglePopup();
    } else if (latitude !== undefined && longitude !== undefined) {
      popup.setLngLat([longitude, latitude]).addTo(map);
    }

    return () => {
      popup.off("close", handleClose);
      popup.remove();

      if (marker && marker.getPopup()) {
        marker.setPopup(null);
      }
    };
  }, [
    map,
    marker,
    latitude,
    longitude,
    props,
    className,
    container,
    handleClose,
  ]);

  return createPortal(
    <div
      style={{
        backgroundColor: getSchoolTypeColor(schoolType), // Apply dynamic background color
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      {children}
    </div>,
    container
  );
}

// Helper function to get the color based on school type
function getSchoolTypeColor(schoolType?: string): string {
  switch (schoolType) {
    case "1012":
      return "#537A5A"; // Folkeskoler
    case "1015":
      return "#9AE19D"; // Specialskoler
    case "1014":
      return "#ED6B86"; // Kommunale ungdomsskoler
    case "1013":
      return "#F2C94C"; // Friskoler og private skoler
    case "3001":
      return "#F2994A"; // Behandlingsskoler
    case "1011":
      return "#BB6BD9"; // Efterskoler
    case "1019":
      return "#F2C94C"; // Særlige tilbud
    case "3002":
      return "#F2994A"; // Specialundervisning
    default:
      return "#ffffff"; // Default white
  }
}
