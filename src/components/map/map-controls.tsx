import React from "react";
import { PlusIcon, MinusIcon } from "lucide-react";

import { useMap } from "@/context/map-context";
import { Button } from "../ui/button";

export default function MapCotrols() {
  const { map } = useMap();

  const zoomIn = () => {
    map?.zoomIn();
  };

  const zoomOut = () => {
    map?.zoomOut();
  };

  return (
    <div className="absolute bottom-8 right-4 z-10 bg-background p-2 rounded-lg shadow-lg flex flex-col gap-2">
      <Button variant="ghost" size="icon" onClick={zoomIn}>
        <PlusIcon className="w-5 h-5" />
        <span className="sr-only">Zoom in</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={zoomOut}>
        <MinusIcon className="w-5 h-5" />
        <span className="sr-only">Zoom out</span>
      </Button>
    </div>
  );
}
