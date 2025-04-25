"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "@/context/map-context";
import { LocationMarker } from "../location-marker";
import { LocationPopup } from "../location-popup";

// Dynamically import the SearchBox component with SSR disabled
const SearchBox = dynamic(() => import("@mapbox/search-js-react").then((mod) => mod.SearchBox), {
  ssr: false,
});

export default function MapSearch() {
  const { map } = useMap();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const handleRetrieve = (result) => {
    console.log("Retrieve result:", result);

    if (!map) {
      console.error("Map instance is not ready.");
      return;
    }

    if (!result || Object.keys(result).length === 0) {
      console.error("Invalid result object:", result);
      return;
    }

    // Check if features array exists and contains geometry
    if (
      !result.features ||
      !Array.isArray(result.features) ||
      result.features.length === 0 ||
      !result.features[0].geometry ||
      !result.features[0].geometry.coordinates
    ) {
      console.error("Result does not contain valid features or geometry:", result);
      return;
    }

    const { coordinates } = result.features[0].geometry;

    // Log the coordinates for debugging
    console.log("Coordinates from Retrieve:", coordinates);

    // Ensure coordinates are in the correct format
    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      // Fly to the selected location
      map.flyTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 14, // Adjust the zoom level as needed
        essential: true,
      });
      console.log("Flying to:", [coordinates[0], coordinates[1]]);

      // Update selected locations
      setSelectedLocation(result.features[0]);
    } else {
      console.error("Invalid coordinates format:", coordinates);
    }
  };

  return (
    <>
      <section className="absolute top-4 left-1/2 sm:left-4 z-10 w-[90vw] sm:w-[350px] -translate-x-1/2 sm:translate-x-0 rounded-lg shadow-lg">
        <div className="rounded-lg">
          <SearchBox
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            options={{
              country: "DK", // Use a string instead of an array
              types: new Set(["address"]), // Limit to specific types
            }}
            onRetrieve={handleRetrieve}
            onError={(error) => console.error("SearchBox Error:", error)}
            className="w-full"
          />
        </div>
      </section>

      {selectedLocations.map((location) => (
        <LocationMarker
          key={location.properties.mapbox_id}
          location={location}
          onHover={(data) => setSelectedLocation(data)}
        />
      ))}

      {selectedLocation && (
        <LocationPopup
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </>
  );
}
