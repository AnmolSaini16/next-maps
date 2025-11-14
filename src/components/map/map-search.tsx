"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader, MapPin, X } from "lucide-react";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { useMap } from "@/context/map-context";
import { cn } from "@/lib/utils";
import {
  iconMap,
  LocationFeature,
  LocationSuggestion,
} from "@/lib/mapbox/utils";
import { searchLocations, retrieveLocation } from "@/lib/mapbox/api";
import { MAP_CONSTANTS } from "@/lib/mapbox/constants";
import { LocationMarker } from "../location-marker";
import { LocationPopup } from "../location-popup";

export default function MapSearch() {
  const { map } = useMap();
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationFeature | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<LocationFeature[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebounce(query, MAP_CONSTANTS.SEARCH.DEBOUNCE_MS);

  // Search for locations
  useEffect(() => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setIsOpen(true);
      setError(null);

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const suggestions = await searchLocations({
          query: debouncedQuery,
          country: MAP_CONSTANTS.SEARCH.DEFAULT_COUNTRY,
          limit: MAP_CONSTANTS.SEARCH.DEFAULT_LIMIT,
          proximity: MAP_CONSTANTS.SEARCH.DEFAULT_PROXIMITY,
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return;

        setResults(suggestions);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Search error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to search locations"
        );
        setResults([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    // Cleanup: abort request on unmount or query change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setDisplayValue(value);
  }, []);

  // Handle location selection
  const handleSelect = useCallback(
    async (suggestion: LocationSuggestion) => {
      if (!map) return;

      setIsSearching(true);
      setError(null);

      try {
        const features = await retrieveLocation(suggestion.mapbox_id);

        if (features.length === 0) {
          setError("No location details found");
          return;
        }

        const [feature] = features;
        const coordinates = feature.geometry.coordinates;

        map.flyTo({
          center: coordinates,
          zoom: MAP_CONSTANTS.FLY_TO.ZOOM,
          speed: MAP_CONSTANTS.FLY_TO.SPEED,
          duration: MAP_CONSTANTS.FLY_TO.DURATION,
          essential: true,
        });

        setDisplayValue(suggestion.name);
        setSelectedLocations(features);
        setResults([]);
        setIsOpen(false);
      } catch (err) {
        console.error("Retrieve error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to retrieve location"
        );
      } finally {
        setIsSearching(false);
      }
    },
    [map]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setQuery("");
    setDisplayValue("");
    setResults([]);
    setIsOpen(false);
    setError(null);
    setSelectedLocation(null);
    setSelectedLocations([]);
  }, []);

  const hasResults = results.length > 0;
  const showEmptyState =
    isOpen && !isSearching && query.trim() && !hasResults && !error;

  return (
    <>
      <section className="absolute top-4 left-1/2 sm:left-4 z-10 w-[90vw] sm:w-[350px] -translate-x-1/2 sm:translate-x-0 rounded-lg shadow-lg">
        <Command className="rounded-lg">
          <div
            className={cn(
              "w-full flex items-center justify-between px-3 gap-1",
              isOpen && "border-b"
            )}
          >
            <CommandInput
              placeholder="Search locations..."
              value={displayValue}
              onValueChange={handleInputChange}
              className="flex-1"
            />
            {displayValue && !isSearching && (
              <X
                className="size-4 shrink-0 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={clearSearch}
                aria-label="Clear search"
              />
            )}
            {isSearching && (
              <Loader
                className="size-4 shrink-0 text-primary animate-spin"
                aria-label="Searching"
              />
            )}
          </div>

          {isOpen && (
            <CommandList className="max-h-60 overflow-y-auto">
              {error ? (
                <CommandEmpty className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Error occurred
                    </p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                </CommandEmpty>
              ) : showEmptyState ? (
                <CommandEmpty className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-sm font-medium">No locations found</p>
                    <p className="text-xs text-muted-foreground">
                      Try a different search term
                    </p>
                  </div>
                </CommandEmpty>
              ) : hasResults ? (
                <CommandGroup>
                  {results.map((location) => (
                    <CommandItem
                      key={location.mapbox_id}
                      onSelect={() => handleSelect(location)}
                      value={`${location.name} ${location.place_formatted} ${location.mapbox_id}`}
                      className="flex items-center py-3 px-2 cursor-pointer hover:bg-accent rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-1.5 rounded-full shrink-0">
                          {location.maki && iconMap[location.maki] ? (
                            iconMap[location.maki]
                          ) : (
                            <MapPin className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {location.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {location.place_formatted}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          )}
        </Command>
      </section>

      {selectedLocations.map((location) => (
        <LocationMarker
          key={location.properties.mapbox_id}
          location={location}
          onHover={(data) => setSelectedLocation(data)}
        />
      ))}

      {selectedLocation && <LocationPopup location={selectedLocation} />}
    </>
  );
}
