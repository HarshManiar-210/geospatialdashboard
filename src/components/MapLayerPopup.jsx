import { X } from "lucide-react";

export default function MapLayerPopup({ activeLayer, onClose, onChange }) {
  const layers = [
    { id: "osm", label: "OpenStreetMap" },
    { id: "satellite", label: "Satellite" },
    { id: "terrain", label: "Terrain" },
    { id: "hybrid", label: "Hybrid" },
  ];

  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-4 w-64 z-[10000]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-[#8B6B55]">Map</h2>
        <button onClick={onClose}>
          <X
            size={20}
            className="text-gray-600 hover:text-black cursor-pointer"
          />
        </button>
      </div>
      <div className="space-y-2">
        {layers?.map((layer) => (
          <label
            key={layer.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="mapLayer"
              value={layer.id}
              checked={activeLayer === layer.id}
              onChange={() => onChange(layer.id)}
            />
            {layer.label}
          </label>
        ))}
      </div>
    </div>
  );
}
