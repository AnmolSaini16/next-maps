import { LocationFeature, iconMap } from "@/lib/mapbox/utils";
import { cn } from "@/lib/utils";
import { LocateIcon, MapPin } from "lucide-react";

import Popup from "./map/map-popup";
import { Badge } from "./ui/badge";

type LocationPopupProps = {
  location: LocationFeature;
};
export function LocationPopup({ location }: LocationPopupProps) {
  if (!location) return null;

  const { properties, geometry } = location;

  const name = properties?.name || "Unknown Location";
  const address = properties?.full_address || properties?.address || "";
  const categories = properties?.poi_category || [];
  const brand = properties?.brand?.[0] || "";
  const status = properties?.operational_status || "";
  const maki = properties?.maki || "";

  const lat = geometry?.coordinates?.[1] || properties?.coordinates?.latitude;
  const lng = geometry?.coordinates?.[0] || properties?.coordinates?.longitude;

  const getIcon = () => {
    const allKeys = [maki, ...(categories || [])];

    for (const key of allKeys) {
      const lower = key?.toLowerCase();
      if (iconMap[lower]) return iconMap[lower];
    }

    return <LocateIcon className="h-5 w-5" />;
  };

  return (
    <Popup
      latitude={lat}
      longitude={lng}
      offset={15}
      closeButton={false}
      closeOnClick={false}
      focusAfterOpen={false}
    >
      <div className="w-[300px] sm:w-[350px]">
        <div className="flex items-start gap-3">
          <div className="bg-rose-500/10 p-2 rounded-full shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-medium text-base truncate">{name}</h3>
              {status && (
                <Badge
                  variant={status === "active" ? "outline" : "secondary"}
                  className={cn(
                    "text-xs",
                    status === "active" ? "border-green-500 text-green-600" : ""
                  )}
                >
                  {status === "active" ? "Open" : status}
                </Badge>
              )}
            </div>
            {brand && brand !== name && (
              <p className="text-sm font-medium text-muted-foreground">
                {brand}
              </p>
            )}
            {address && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                <MapPin className="h-3 w-3 inline mr-1 opacity-70" />
                {address}
              </p>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 max-w-full">
            {categories.slice(0, 3).map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs capitalize truncate max-w-[100px]"
              >
                {category}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{categories.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span className="truncate max-w-[170px]">
              ID: {properties?.mapbox_id?.substring(0, 8)}...
            </span>
            <span className="text-right">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </Popup>
  );
}
