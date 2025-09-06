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
    console.log("❌ No GeoJSON data or features to filter");
    return geoJsonData;
  }

  console.log("🔍 Filtering rivers by basin:", {
    totalFeatures: geoJsonData.features.length,
    selectedBasins,
    firstFeatureBasin: geoJsonData.features[0]?.properties?.BASIN,
    sampleBasins: geoJsonData.features
      .slice(0, 5)
      .map((f) => f.properties?.BASIN),
  });

  const filteredFeatures = geoJsonData.features.filter((feature, index) => {
    const basin = feature.properties?.BASIN;
    if (!basin) {
      console.log(
        `❌ Feature ${index} has no BASIN property:`,
        feature.properties
      );
      return false;
    }

    // Convert basin number to basin ID (e.g., 1 -> "MA1")
    const basinId = `MA${basin}`;
    const isSelected = selectedBasins.includes(basinId);

    if (index < 3) {
      // Log first few features for debugging
      console.log(`🔍 Feature ${index}:`, {
        basin,
        basinId,
        isSelected,
        selectedBasins,
      });
    }

    return isSelected;
  });

  console.log("✅ Basin filtering complete:", {
    originalFeatures: geoJsonData.features.length,
    filteredFeatures: filteredFeatures.length,
    selectedBasins,
  });

  return {
    ...geoJsonData,
    features: filteredFeatures,
  };
};
