import { useEffect } from "react";
import { useMap } from "@/context/map-context";
import mapboxgl from "mapbox-gl";
import { School, ExternalLink } from "lucide-react"; // Import the School and ExternalLink icons from Lucide
import ReactDOM from "react-dom/client"; // Import ReactDOM for rendering popup content

export default function MapTileset() {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    // Load the custom icon
    map.loadImage("/skole-icon.png", (error, image) => {
      if (error) {
        console.error("Error loading icon:", error);
        return;
      }
      if (!map.hasImage("skole-icon")) {
        map.addImage("skole-icon", image); // Icon name is "skole-icon"
      }

      // Add the GeoJSON dataset as a source with clustering enabled
      map.addSource("my-geojson-dataset", {
        type: "geojson",
        data: "/SkolrFinal.geojson", // Path to your GeoJSON file in the public folder
        cluster: true, // Enable clustering
        clusterMaxZoom: 14, // Max zoom level to cluster points
        clusterRadius: 50, // Radius of each cluster in pixels
      });

      // Add a layer for clustered points
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "my-geojson-dataset",
        filter: ["has", "point_count"], // Only show clusters
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6", // Color for small clusters
            100, // Step threshold
            "#f1f075", // Color for medium clusters
            750, // Step threshold
            "#f28cb1", // Color for large clusters
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            15, // Radius for small clusters
            100, // Step threshold
            20, // Radius for medium clusters
            750, // Step threshold
            25, // Radius for large clusters
          ],
        },
      });

      // Add a layer for cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "my-geojson-dataset",
        filter: ["has", "point_count"], // Only show clusters
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      // Add a circle layer for the background with a border
      map.addLayer({
        id: "unclustered-point-background",
        type: "circle",
        source: "my-geojson-dataset",
        filter: ["!", ["has", "point_count"]], // Only show unclustered points
        paint: {
          "circle-color": [
            "match",
            ["to-string", ["get", "INST_TYPE_NR"]], // Convert INST_TYPE_NR to a string
            "1012", "#537A5A", // Folkeskoler
            "1015", "#9AE19D", // Specialskoler
            "1014", "#ED6B86", // Kommunale ungdomsskoler
            "1013", "#F2C94C", // Friskoler og private skoler
            "3001", "#F2994A", // Behandlingsskoler
            "1011", "#BB6BD9", // Efterskoler
            "1019", "#F2C94C", // Særlige tilbud
            "3002", "#F2994A", // Specialundervisning
            /* default */ "#ffffff", // White for other types
          ],
          "circle-radius": 12, // Adjust the size of the background
          "circle-opacity": 0.8, // Optional: Adjust the opacity
          "circle-stroke-color": "#666", // Border color (e.g., black)
          "circle-stroke-width": 1, // Border width in pixels
          "circle-stroke-opacity": 1.0, // Optional: Adjust the border opacity
        },
      });

      // Add a symbol layer for the icon
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "my-geojson-dataset",
        filter: ["!", ["has", "point_count"]], // Only show unclustered points
        layout: {
          "icon-image": "skole-icon", // Match the loaded icon name
          "icon-size": 0.7, // Adjust the size of the icon
        },
      });

      // Add a click event listener for clusters
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;

        map.getSource("my-geojson-dataset").getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
      });

      // Add a click event listener for unclustered points
      map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const {
          INST_NAVN: name,
          INST_ADR: address,
          POSTNR: postalCode,
          POSTDISTRIKT: district,
          WEB_ADR: website,
          INST_TYPE_NR: schoolType, // Get the school type
        } = e.features[0].properties;

        const absoluteWebAdr =
          website?.startsWith("http://") || website?.startsWith("https://")
            ? website
            : `http://${website}`;

        const popupContainer = document.createElement("div");

        // Use ReactDOM to render the popup content
        const root = ReactDOM.createRoot(popupContainer);
        root.render(
          <div className="p-3 max-w-[600px] sm:max-w-[600px]">
            <div className="flex items-start gap-3">
              {/* Render the Lucide School icon with dynamic background color */}
              <div
                className="p-2 rounded-full shrink-0"
                style={{
                  backgroundColor: getSchoolTypeColor(schoolType), // Dynamic background color
                }}
              >
                <School className="h-5 w-5 text-white" /> {/* Lucide School icon */}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">
                  {name || "Unknown Location"}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {address || ""}, {postalCode || ""} {district || ""}
                </p>

                {/* Divider */}
                <div
                  data-orientation="horizontal"
                  role="none"
                  data-slot="separator-root"
                  className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-3"
                ></div>

                {/* Hjemmeside Button */}
                {website && (
                  <a
                    href={absoluteWebAdr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" /> {/* Lucide ExternalLink icon */}
                    Hjemmeside
                  </a>
                )}
              </div>
              
            </div>
          </div>
        );

        new mapboxgl.Popup({ closeButton: true, className: "location-popup", maxWidth: "800px" })
          .setLngLat(coordinates)
          .setDOMContent(popupContainer)
          .addTo(map);
      });

      // Helper function to get the color based on school type
      function getSchoolTypeColor(schoolType: string): string {
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

      // Change the cursor to a pointer when hovering over clusters
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Clean up on unmount
    return () => {
      if (map.getLayer("clusters")) map.removeLayer("clusters");
      if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
      if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point");
      if (map.getLayer("unclustered-point-background")) map.removeLayer("unclustered-point-background");
      if (map.getSource("my-geojson-dataset")) map.removeSource("my-geojson-dataset");
    };
  }, [map]);

  return null; // This component doesn't render anything visually
}