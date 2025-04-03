import {
  Coffee,
  Utensils,
  ShoppingBag,
  Hotel,
  Dumbbell,
  Landmark,
  Store,
  Banknote,
  GraduationCap,
  Shirt,
  Stethoscope,
  Home,
} from "lucide-react";

export const iconMap: { [key: string]: React.ReactNode } = {
  café: <Coffee className="h-5 w-5" />,
  cafe: <Coffee className="h-5 w-5" />,
  coffee: <Coffee className="h-5 w-5" />,
  restaurant: <Utensils className="h-5 w-5" />,
  food: <Utensils className="h-5 w-5" />,
  hotel: <Hotel className="h-5 w-5" />,
  lodging: <Hotel className="h-5 w-5" />,
  gym: <Dumbbell className="h-5 w-5" />,
  bank: <Banknote className="h-5 w-5" />,
  shopping: <ShoppingBag className="h-5 w-5" />,
  store: <Store className="h-5 w-5" />,
  government: <Landmark className="h-5 w-5" />,
  school: <GraduationCap className="h-5 w-5" />,
  hospital: <Stethoscope className="h-5 w-5" />,
  clothing: <Shirt className="h-5 w-5" />,
  home: <Home className="h-5 w-5" />,
};

export type LocationSuggestion = {
  mapbox_id: string;
  name: string;
  place_formatted: string;
  maki?: string;
};

export type LocationFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    name_preferred?: string;
    mapbox_id: string;
    feature_type: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
    context: {
      country?: {
        name: string;
        country_code: string;
        country_code_alpha_3: string;
      };
      region?: {
        name: string;
        region_code: string;
        region_code_full: string;
      };
      postcode?: { name: string };
      district?: { name: string };
      place?: { name: string };
      locality?: { name: string };
      neighborhood?: { name: string };
      address?: {
        name: string;
        address_number?: string;
        street_name?: string;
      };
      street?: { name: string };
    };
    coordinates: {
      latitude: number;
      longitude: number;
      accuracy?: string;
      routable_points?: {
        name: string;
        latitude: number;
        longitude: number;
        note?: string;
      }[];
    };
    language?: string;
    maki?: string;
    poi_category?: string[];
    poi_category_ids?: string[];
    brand?: string[];
    brand_id?: string[];
    external_ids?: Record<string, string>;
    metadata?: Record<string, unknown>;
    bbox?: [number, number, number, number];
    operational_status?: string;
  };
};
