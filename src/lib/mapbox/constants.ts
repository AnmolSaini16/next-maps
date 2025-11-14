export const MAP_CONSTANTS = {
  FLY_TO: {
    ZOOM: 14,
    SPEED: 4,
    DURATION: 1000,
  },
  SEARCH: {
    DEBOUNCE_MS: 400,
    DEFAULT_LIMIT: 5,
    DEFAULT_COUNTRY: "US",
    DEFAULT_PROXIMITY: [-122.4194, 37.7749] as [number, number], // San Francisco
  },
} as const;
