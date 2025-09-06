// src/utils/dataFormatter.js

// Land use information mapping
export const landuseInfo = {
  1: { color: "#ff0000", label: "Builtup" },
  2: { color: "#013ddc", label: "Waterbodies" },
  3: { color: "#feff73", label: "Agriculture" },
  4: { color: "#7ac602", label: "Vegetation Patches" },
  5: { color: "#95e689", label: "Shrubland" },
  6: { color: "#dfaaf0", label: "Salineland" },
  7: { color: "#fe95e7", label: "Barrenland" },
  8: { color: "#fefeb4", label: "Fallowland" },
  9: { color: "#267300", label: "Forest Patches" },
};

// Chart data for all basins
export const chartData = {
  MA1: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0"],
    data: [
      35184067.84, 114602638.47, 2836033560.99, 1658631848.4, 3761984509.47,
      107928901.04, 45017608.19,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
    ],
  },
  MA2: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0"],
    data: [
      1395533.99, 10209576.98, 511467314.03, 105310335.3, 394788259.72,
      13988197.46, 36834247.99,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
    ],
  },
  MA3: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0"],
    data: [
      14634396.32, 38854988.51, 653344473.22, 8372291.22, 404835374.27,
      826915.5, 361834855.76,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
    ],
  },
  MA4: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0"],
    data: [
      37809022.55, 43937871.95, 1682449022.66, 241407300.41, 1119828862.06,
      57550945.49, 39517616.16,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
    ],
  },
  MA5: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0"],
    data: [
      66279193.71, 121298280.94, 2532718949.02, 6358852.39, 1225216777.73,
      30119.44, 571356.62, 786455050.36,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#dfaaf0",
      "#fe95e7",
      "#fefeb4",
    ],
  },
  MA6: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0", "9.0"],
    data: [
      5514595.4, 112920513.46, 1062583674.51, 114169101.09, 727862702.46,
      39002847.57, 11707334.51, 382186469.15,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
      "#267300",
    ],
  },
  MA7: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0", "9.0"],
    data: [
      49341116.69, 55447148.34, 2587329142.05, 53170848.95, 1594324108.85,
      196279254.28, 883509008.64, 261236843.53,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
      "#267300",
    ],
  },
  MA8: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "7.0", "8.0", "9.0"],
    data: [
      4747918.78, 57414951.66, 982575493.05, 236263265.38, 746691915.14,
      26527011.02, 8930869.9, 660050155.51,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#fe95e7",
      "#fefeb4",
      "#267300",
    ],
  },
  MA9: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0"],
    data: [
      76006859.67, 67531432.19, 2384695598.94, 257031987.36, 639581715.2,
      1955938.09, 45093363.14, 148761732.69, 405690583.79,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#dfaaf0",
      "#fe95e7",
      "#fefeb4",
      "#267300",
    ],
  },
  MA10: {
    labels: ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0"],
    data: [
      277507729.35, 224528549.56, 3650695009.25, 573368236.63, 432528829.01,
      192809129.87, 29941460.1, 598471419.64, 83711959.69,
    ],
    colors: [
      "#ff0000",
      "#013ddc",
      "#feff73",
      "#7ac602",
      "#95e689",
      "#dfaaf0",
      "#fe95e7",
      "#fefeb4",
      "#267300",
    ],
  },
};

// Format large numbers to readable format
export const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(2);
};

// Get sorted selected basins
export const getSortedSelectedBasins = (selectedBasins) => {
  return [...selectedBasins].sort((a, b) => {
    const aNum = parseInt(a.replace("MA", ""));
    const bNum = parseInt(b.replace("MA", ""));
    return aNum - bNum;
  });
};

// Get chart data for a specific basin
export const getChartDataForBasin = (basinId) => {
  return chartData[basinId] || null;
};

// Get land use info for a specific label
export const getLandUseInfo = (label) => {
  const numLabel = parseFloat(label);
  return landuseInfo[numLabel] || { color: "#000000", label: "Unknown" };
};
