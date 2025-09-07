// src/utils/riverUtils.js

export const defaultStyleOptionsRiver = {
  radius: 5,
  circleFillColor: "blue",
  circleStrokeColor: "white",
  circleStrokeWidth: 2,
  lineStrokeColor: "blue",
  lineStrokeWidth: 1,
  fillColor: "rgba(0, 255, 0, 0.3)",
};

// Function to get river style based on order
export const getRiverStyle = (orderId) => {
  const thicknessMap = {
    "1-2": 1, // Thinnest - smallest order
    "2-3": 1.5,
    "3-4": 2,
    "4-5": 2.5,
    "5-6": 3,
    "6-7": 3.5, // Thickest - largest order
  };

  return {
    color: "blue", // Blue color for rivers
    weight: thicknessMap[orderId] || 1,
    opacity: 0.8,
    fillOpacity: 0,
  };
};

// Function to filter river features by basin
export const filterRiversByBasin = (geoJsonData, selectedBasins) => {
  if (!geoJsonData || !geoJsonData.features) {
    return geoJsonData;
  }

  const filteredFeatures = geoJsonData.features.filter((feature) => {
    const basin = feature.properties?.BASIN;
    if (!basin) {
      return false;
    }

    // Convert basin number to basin ID (e.g., 1 -> "MA1")
    const basinId = `MA${basin}`;
    return selectedBasins.includes(basinId);
  });

  return {
    ...geoJsonData,
    features: filteredFeatures,
  };
};
