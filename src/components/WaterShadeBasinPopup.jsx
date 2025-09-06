import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleRiverOrder } from "../store/riverSlice";

export default function WaterShadeBasinPopup({
  basins,
  onClose,
  onToggleBasin,
  selectedTheme, // Add selectedTheme prop
}) {
  const dispatch = useDispatch();
  const { selectedRiverOrders } = useSelector((state) => state.river);
  const { themes } = useSelector((state) => state.theme);

  // Get river orders from hydrology theme - only if hydrology is selected
  const hydrologyTheme = themes.find((theme) => theme.id === "hydrology");
  const riverOrders =
    selectedTheme === "hydrology" ? hydrologyTheme?.subThemes || [] : [];
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-xl p-4 w-80 z-[10000]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-[#8B6B55]">Water Shade Basin</h2>
        <button onClick={onClose}>
          <X size={20} className="text-gray-600 hover:text-black" />
        </button>
      </div>

      {/* Basin Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Select Basins:
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          {basins?.map((basin) => (
            <label
              key={basin.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={basin.visible}
                onChange={() => onToggleBasin(basin.id)}
                className="w-4 h-4 text-[#8B6B55] bg-gray-100 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{basin.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* River Orders Selection - Only show when Hydrology theme is selected */}
      {selectedTheme === "hydrology" && riverOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Select River Orders:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {riverOrders.map((riverOrder) => (
              <label
                key={riverOrder.id}
                className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedRiverOrders.includes(riverOrder.id)}
                  onChange={() => dispatch(toggleRiverOrder(riverOrder.id))}
                  className="w-4 h-4 text-[#8B6B55] bg-gray-100 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 font-medium">
                  {riverOrder.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
