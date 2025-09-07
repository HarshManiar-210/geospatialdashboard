import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { toggleStatisticsPopup } from "../store/waterShadeBasinSlice";

export default function Legend({ selectedTheme, selectedSubTheme, layers }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const dispatch = useDispatch();
  const { selectedBasins, showStatisticsPopup } = useSelector(
    (state) => state.waterShadeBasin
  );

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleViewStatistics = () => {
    dispatch(toggleStatisticsPopup());
  };

  // Auto-collapse legend when statistics popup is open
  useEffect(() => {
    if (showStatisticsPopup) {
      setIsCollapsed(true);
    }
  }, [showStatisticsPopup]);

  // Theme-specific legend sections
  const getLegendSections = () => {
    const allSections = [];

    // Check if any individual layers are selected
    const visibleLayers = layers?.filter((layer) => layer.visible) || [];

    // Add individual layer legends if any are selected
    if (visibleLayers.length > 0) {
      // Group layers by type
      const boundaryLayers = visibleLayers.filter(
        (layer) => layer.id === "district" || layer.id === "talukas"
      );
      const infrastructureLayers = visibleLayers.filter(
        (layer) =>
          layer.id === "road" || layer.id === "railways" || layer.id === "canal"
      );

      if (boundaryLayers.length > 0) {
        allSections.push({
          title: "BOUNDARIES",
          items: boundaryLayers.map((layer) => {
            const layerStyles = {
              district: { color: "#000000", label: "District Boundary" },
              talukas: { color: "#1f78b4", label: "Taluka Boundary" },
            };
            return layerStyles[layer.id];
          }),
        });
      }

      if (infrastructureLayers.length > 0) {
        allSections.push({
          title: "INFRASTRUCTURE",
          items: infrastructureLayers.map((layer) => {
            const layerStyles = {
              road: { color: "#878787", label: "Road" },
              railways: { color: "#e31a1c", label: "Railway" },
              canal: { color: "#2741ea", label: "Canal" },
            };
            return layerStyles[layer.id];
          }),
        });
      }
    }

    // Add theme-based legends if a theme is selected
    switch (selectedTheme) {
      case "landuse":
        allSections.push({
          title: "LANDUSE",
          items: [
            { color: "#ff0000", label: "Builtup" },
            { color: "#013ddc", label: "Waterbodies" },
            { color: "#feff73", label: "Agriculture" },
            { color: "#7ac602", label: "Vegetation Patches" },
            { color: "#95e689", label: "Shrubland" },
            { color: "#dfaaf0", label: "Salineland" },
            { color: "#fe95e7", label: "Barrenland" },
            { color: "#fefeb4", label: "Fallowland" },
            { color: "#267300", label: "Forest Patches" },
          ],
        });
        break;
      case "terrain": {
        if (selectedSubTheme === "elevation") {
          allSections.push({
            title: "MAHI ELEVATION",
            isDetailedGradient: true,
            gradientType: "elevation",
            gradient:
              "linear-gradient(to bottom, #ff0000, #ff8f00, #ffff00, #4defef)",
            values: ["968.69m", "726.52m", "484.35m", "242.17m", "0m"],
            height: "180px",
          });
        } else if (selectedSubTheme === "slope") {
          allSections.push({
            title: "MAHI SLOPE",
            isDetailedGradient: true,
            gradientType: "slope",
            gradient:
              "linear-gradient(to bottom, #00aaff, #95ffd9, #fcff80, #ffcf5f, #ff1a00)",
            values: ["53.94°", "40.45°", "26.97°", "13.48°", "0.00°"],
            height: "180px",
          });
        } else if (selectedSubTheme === "aspect") {
          allSections.push({
            title: "MAHI ASPECT",
            isDetailedGradient: true,
            gradientType: "aspect",
            gradient:
              "linear-gradient(to bottom, #030077, #0064ff, #00c2ff, #00ffbb, #fffa00, #ffb300, #ff0200, #930000, #030077)",
            values: [
              { label: "North", range: "(337.5°-22.5°)" },
              { label: "Northeast", range: "(22.5°-67.5°)" },
              { label: "East", range: "(67.5°-112.5°)" },
              { label: "Southeast", range: "(112.5°-157.5°)" },
              { label: "South", range: "(157.5°-202.5°)" },
              { label: "Southwest", range: "(202.5°-247.5°)" },
              { label: "West", range: "(247.5°-292.5°)" },
              { label: "Northwest", range: "(292.5°-337.5°)" },
            ],
            height: "240px",
          });
        }
        break;
      }
      case "hydrology":
        allSections.push({
          title: "MA-BASINS",
          items: [{ color: "#8B6B55", label: "Water Shade Basins" }],
        });
        break;
      default: // No theme selected - show all available layers if no individual layers are selected
        if (visibleLayers.length === 0) {
          allSections.push(
            {
              title: "BOUNDARIES",
              items: [
                { color: "#000000", label: "District Boundary" },
                { color: "#1f78b4", label: "Taluka Boundary" },
              ],
            },
            {
              title: "INFRASTRUCTURE",
              items: [
                { color: "#878787", label: "Road" },
                { color: "#e31a1c", label: "Railway" },
                { color: "#2741ea", label: "Canal" },
              ],
            }
          );
        }
        break;
    }

    return allSections;
  };

  const legendSections = getLegendSections();

  return (
    <div className="absolute bottom-4 right-4 z-[10000]">
      {/* View Statistics Button - Only show when landuse theme is selected */}
      {selectedTheme === "landuse" && (
        <div className="mb-2">
          <button
            onClick={handleViewStatistics}
            disabled={selectedBasins.length === 0}
            className="bg-[#8B6B55] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#a17e65] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed text-sm w-[200px] text-center flex items-center justify-center cursor-pointer"
          >
            View Statistics
          </button>
        </div>
      )}

      {/* Legend Component */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-xs sm:max-w-none max-h-96">
        {/* Legend Header */}
        <div
          className="flex items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors w-[200px]"
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-2">
            <span className="text-[#8B6B55] font-semibold text-sm sm:text-base ">
              Legends
            </span>
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
            <div className="space-y-1 sm:space-y-2 mt-1 sm:mt-2 max-h-64 overflow-y-auto custom-scrollbar">
              {legendSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-xs font-semibold mb-1 text-gray-700">
                    {section.title}
                  </h3>

                  {section.isDetailedGradient ? (
                    // Detailed gradient section for terrain
                    <div className="flex space-x-3">
                      <div
                        className="w-6 relative flex-shrink-0"
                        style={{ height: section.height }}
                      >
                        <div
                          className="h-full w-full rounded"
                          style={{
                            background: section.gradient,
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-between text-xs py-1 flex-1">
                        {section.gradientType === "aspect"
                          ? // Aspect values with ranges
                            section.values.map((value, index) => (
                              <div key={index} className="space-y-1">
                                <div className="font-medium text-gray-600">
                                  {value.label}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {value.range}
                                </div>
                              </div>
                            ))
                          : // Simple values for elevation and slope
                            section.values.map((value, index) => (
                              <span
                                key={index}
                                className="font-medium text-gray-600"
                              >
                                {value}
                              </span>
                            ))}
                      </div>
                    </div>
                  ) : (
                    // Regular legend items
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2"
                        >
                          {item.isGradient ? (
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-300 rounded flex-shrink-0"
                              style={{
                                background:
                                  item.color ===
                                  "gradient-to-b from-[#ff0000] via-[#ff8f00] via-[#ffff00] to-[#4defef]"
                                    ? "linear-gradient(to bottom, #ff0000, #ff8f00, #ffff00, #4defef)"
                                    : item.color ===
                                      "gradient-to-b from-[#00aaff] via-[#95ffd9] via-[#fcff80] via-[#ffcf5f] to-[#ff1a00]"
                                    ? "linear-gradient(to bottom, #00aaff, #95ffd9, #fcff80, #ffcf5f, #ff1a00)"
                                    : item.color ===
                                      "gradient-to-b from-[#030077] via-[#0064ff] via-[#00c2ff] via-[#00ffbb] via-[#fffa00] via-[#ffb300] via-[#ff0200] to-[#930000]"
                                    ? "linear-gradient(to bottom, #030077, #0064ff, #00c2ff, #00ffbb, #fffa00, #ffb300, #ff0200, #930000)"
                                    : item.color,
                              }}
                            ></div>
                          ) : (
                            <div
                              className={`border border-gray-300 rounded flex-shrink-0 ${
                                item.weight
                                  ? "w-8 h-1 sm:w-10 sm:h-1"
                                  : "w-3 h-3 sm:w-4 sm:h-4"
                              }`}
                              style={{
                                backgroundColor: item.color,
                              }}
                            ></div>
                          )}
                          <span className="text-xs sm:text-sm text-gray-700">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
