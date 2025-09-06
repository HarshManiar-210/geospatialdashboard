import { useMap } from "react-leaflet";
import { useState, useEffect } from "react";

export default function ZoomControl() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom()); // ✅ initialize immediately

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());

    // set initial zoom immediately (important fix)
    setZoom(map.getZoom());

    // listen to zoom changes
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map]);

  const zoomIn = () => map.setZoom(map.getZoom() + 1);
  const zoomOut = () => map.setZoom(map.getZoom() - 1);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-center bg-[#8B6B55] text-white rounded-2xl shadow-lg z-[1000]">
      <button
        onClick={zoomIn}
        className="px-3 py-2 text-xl font-bold cursor-pointer"
      >
        +
      </button>
      <div className="px-3 py-1 text-sm">{zoom}x</div>
      <button
        onClick={zoomOut}
        className="px-3 py-2 text-xl font-bold cursor-pointer "
      >
        −
      </button>
    </div>
  );
}
