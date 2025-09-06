import { X } from "lucide-react";

export default function LayersPopup({ layers, onClose, onToggleLayer }) {
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-4 w-64 z-[1000]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-[#8B6B55]">Layers</h2>
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
              type="checkbox"
              checked={layer.visible}
              onChange={() => onToggleLayer(layer.id)}
              className="w-4 h-4 text-[#8B6B55] bg-gray-100 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{layer.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
