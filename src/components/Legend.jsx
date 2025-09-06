import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export default function Legend() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      {/* View Statistics Button */}
      <div className="mb-2">
        <button className="bg-[#8B6B55] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#a17e65] transition-colors font-medium">
          View Statistics
        </button>
      </div>

      {/* Legend Component */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Legend Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-2">
            <span className="text-[#8B6B55] font-semibold">Legends</span>
            <Info size={16} className="text-[#8B6B55]" />
          </div>
          {isCollapsed ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>

        {/* Legend Content - Collapsible */}
        {!isCollapsed && (
          <div className="px-3 pb-3 border-t border-gray-200">
            <div className="space-y-2 mt-2">
              {/* Layer Legend Items */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                <span className="text-sm text-gray-700">District</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-teal-500 rounded-sm"></div>
                <span className="text-sm text-gray-700">Talukas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span className="text-sm text-gray-700">Road</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Railways</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-purple-500"></div>
                <span className="text-sm text-gray-700">Canal</span>
              </div>

              {/* Theme Legend Items */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  Themes
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700">Landuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                  <span className="text-sm text-gray-700">Hydrology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700">Terrain</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
