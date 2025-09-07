import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  getSortedSelectedBasins,
  getChartDataForBasin,
  getLandUseInfo,
} from "../utils/dataFormatter";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin for center text
const centerTextPlugin = {
  id: "centerText",
  afterDatasetsDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#374151";

    // Calculate the largest segment percentage
    const data = chart.data.datasets[0].data;
    const total = data.reduce((a, b) => a + b, 0);
    const maxValue = Math.max(...data);
    const percentage = ((maxValue / total) * 100).toFixed(0);

    ctx.fillText(`${percentage}%`, centerX, centerY);
    ctx.restore();
  },
};

export default function StatisticsPopup({ selectedBasins, onClose }) {
  const [currentBasinIndex, setCurrentBasinIndex] = useState(0);
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Get sorted selected basins
  const sortedBasins = getSortedSelectedBasins(selectedBasins);
  const currentBasin = sortedBasins[currentBasinIndex];
  const currentChartData = getChartDataForBasin(currentBasin);

  // Handle wheel scroll for navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (!containerRef.current?.contains(e.target)) return;

      e.preventDefault();

      if (isScrolling) return;

      setIsScrolling(true);

      const delta = e.deltaY;
      const threshold = 50;

      if (Math.abs(delta) > threshold) {
        if (delta > 0 && currentBasinIndex < sortedBasins.length - 1) {
          // Scroll down - next basin
          setCurrentBasinIndex((prev) => prev + 1);
        } else if (delta < 0 && currentBasinIndex > 0) {
          // Scroll up - previous basin
          setCurrentBasinIndex((prev) => prev - 1);
        }
      }

      // Reset scrolling flag after a delay
      setTimeout(() => setIsScrolling(false), 300);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [currentBasinIndex, sortedBasins.length, isScrolling]);

  // Prepare chart data
  const chartConfig = {
    labels:
      currentChartData?.labels.map((label) => getLandUseInfo(label).label) ||
      [],
    datasets: [
      {
        data: currentChartData?.data || [],
        backgroundColor: currentChartData?.colors || [],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverBorderWidth: 3,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      centerText: centerTextPlugin,
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  if (!currentChartData) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 right-2 left-2 sm:bottom-32 sm:right-4 sm:left-auto sm:w-96 z-[10000] bg-white bg-opacity-90 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base sm:text-lg text-[#8B6B55]">Statistics</h2>
          <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
            {currentBasin.replace("MA", "MA - ")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
        >
          <X size={18} className="text-gray-600 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Pie Chart - Top on mobile, Left on desktop */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            <div className="w-28 h-28 sm:w-36 sm:h-36">
              <Pie data={chartConfig} options={chartOptions} />
            </div>
          </div>

          {/* Legend - Bottom on mobile, Right on desktop */}
          <div className="flex-1 space-y-1 max-h-32 sm:max-h-48 overflow-y-auto custom-scrollbar">
            {currentChartData.labels.map((label, index) => {
              const landUseInfo = getLandUseInfo(label);
              const value = currentChartData.data[index];
              const total = currentChartData.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);

              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: landUseInfo.color }}
                  />
                  <div className="text-xs font-medium text-gray-900">
                    {landUseInfo.label} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basin Selection - Bottom */}
        {sortedBasins.length > 1 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <span className="text-sm font-medium text-gray-700 text-center sm:text-left">
                Select Basin:
              </span>
              <div className="flex gap-2 justify-center sm:justify-end">
                <button
                  onClick={() =>
                    setCurrentBasinIndex(Math.max(0, currentBasinIndex - 1))
                  }
                  disabled={currentBasinIndex === 0}
                  className="px-2 sm:px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-md transition-colors"
                >
                  ← Prev
                </button>
                <select
                  value={currentBasinIndex}
                  onChange={(e) =>
                    setCurrentBasinIndex(parseInt(e.target.value))
                  }
                  className="px-2 sm:px-3 py-1 text-xs border border-gray-300 rounded-md bg-white bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-[#8B6B55] focus:border-transparent min-w-0 flex-1 sm:flex-none"
                >
                  {sortedBasins.map((basin, index) => (
                    <option key={basin} value={index}>
                      {basin.replace("MA", "MA - ")}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setCurrentBasinIndex(
                      Math.min(sortedBasins.length - 1, currentBasinIndex + 1)
                    )
                  }
                  disabled={currentBasinIndex === sortedBasins.length - 1}
                  className="px-2 sm:px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-md transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {currentBasinIndex + 1} of {sortedBasins.length} basins
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
