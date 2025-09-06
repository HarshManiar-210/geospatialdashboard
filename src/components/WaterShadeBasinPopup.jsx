import { X } from "lucide-react";

export default function WaterShadeBasinPopup({
  basins,
  onClose,
  onToggleBasin,
}) {
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-4 w-64 z-[1000]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-[#8B6B55]">Water Shade Basin</h2>
        <button onClick={onClose}>
          <X size={20} className="text-gray-600 hover:text-black" />
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {basins?.map((basin) => (
          <label
            key={basin.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={basin.visible}
              onChange={() => onToggleBasin(basin.id)}
              className="w-4 h-4 text-[#8B6B55] bg-gray-100 border-gray-300 rounded "
            />
            <span className="text-sm text-gray-700">{basin.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
