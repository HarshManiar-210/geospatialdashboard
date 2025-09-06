import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { toggleStatisticsPopup } from "../store/waterShadeBasinSlice";

export default function Legend() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const dispatch = useDispatch();
  const { selectedBasins } = useSelector((state) => state.waterShadeBasin);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleViewStatistics = () => {
    dispatch(toggleStatisticsPopup());
  };

  return (
    <div className="absolute bottom-4 right-4 z-[10000]">
      {/* View Statistics Button */}
      <div className="mb-2">
        <button
          onClick={handleViewStatistics}
          disabled={selectedBasins.length === 0}
          className="bg-[#8B6B55] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#a17e65] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          View Statistics
        </button>
      </div>

      {/* Legend Component */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-xs sm:max-w-none">
        {/* Legend Header */}
        <div
          className="flex items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-2">
            <span className="text-[#8B6B55] font-semibold text-sm sm:text-base">Legends</span>
            <Info size={14} className="text-[#8B6B55] sm:w-4 sm:h-4" />
          </div>
          {isCollapsed ? (
            <ChevronUp size={14} className="text-gray-500 sm:w-4 sm:h-4" />
          ) : (
            <ChevronDown size={14} className="text-gray-500 sm:w-4 sm:h-4" />
          )}
        </div>

        {/* Legend Content - Collapsible */}
        {!isCollapsed && (
          <div className="px-2 sm:px-3 pb-2 sm:pb-3 border-t border-gray-200">
            <div className="space-y-1 sm:space-y-2 mt-1 sm:mt-2">
              {/* Layer Legend Items */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-sm"></div>
                <span className="text-xs sm:text-sm text-gray-700">District</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-teal-500 rounded-sm"></div>
                <span className="text-xs sm:text-sm text-gray-700">Talukas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 sm:w-4 sm:h-1 bg-blue-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Road</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 sm:w-4 sm:h-1 bg-yellow-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Railways</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 sm:w-4 sm:h-1 bg-purple-500"></div>
                <span className="text-xs sm:text-sm text-gray-700">Canal</span>
              </div>

              {/* Theme Legend Items */}
              <div className="border-t border-gray-200 pt-1 sm:pt-2 mt-1 sm:mt-2">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  Themes
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Landuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Hydrology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-sm"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Terrain</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
