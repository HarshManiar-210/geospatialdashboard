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
              {/* Boundaries Section */}
              <div>
                <h3 className="text-xs font-semibold mb-1 text-gray-700">BOUNDARIES</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">District Boundary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#1f78b4] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Taluka Boundary</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure Section */}
              <div>
                <h3 className="text-xs font-semibold mb-1 text-gray-700">INFRASTRUCTURE</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 sm:w-4 sm:h-1 bg-[#878787] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Road</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 sm:w-4 sm:h-1 bg-[#e31a1c] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Railway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 sm:w-4 sm:h-1 bg-[#2741ea] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Canal</span>
                  </div>
                </div>
              </div>

              {/* MA-Basins Section */}
              <div>
                <h3 className="text-xs font-semibold mb-1 text-gray-700">MA-BASINS</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#7ac602] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Water Shade Basins</span>
                  </div>
                </div>
              </div>

              {/* Landuse Section */}
              <div>
                <h3 className="text-xs font-semibold mb-1 text-gray-700">LANDUSE</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#ff0000] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Builtup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#013ddc] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Waterbodies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#feff73] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Agriculture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#7ac602] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Vegetation Patches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#95e689] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Shrubland</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#dfaaf0] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Salineland</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#fe95e7] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Barrenland</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#fefeb4] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Fallowland</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#267300] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Forest Patches</span>
                  </div>
                </div>
              </div>

              {/* Terrain Section */}
              <div>
                <h3 className="text-xs font-semibold mb-1 text-gray-700">TERRAIN</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-b from-[#ff0000] via-[#ff8f00] via-[#ffff00] to-[#4defef] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Elevation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-b from-[#00aaff] via-[#95ffd9] via-[#fcff80] via-[#ffcf5f] to-[#ff1a00] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Slope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-b from-[#030077] via-[#0064ff] via-[#00c2ff] via-[#00ffbb] via-[#fffa00] via-[#ffb300] via-[#ff0200] to-[#930000] border border-gray-300 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-gray-700">Aspect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
