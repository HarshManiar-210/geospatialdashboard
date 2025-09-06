// src/store/waterShadeBasinSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showWaterShadeBasinPopup: false,
  showStatisticsPopup: false,
  selectedBasins: [
    "MA1",
    "MA2",
    "MA3",
    "MA4",
    "MA5",
    "MA6",
    "MA7",
    "MA8",
    "MA9",
    "MA10",
  ], // All selected by default
  basins: [
    {
      id: "MA1",
      label: "Sub-Basin (MA - 1)",
      file: "MA1.geojson",
      visible: true,
    },
    {
      id: "MA2",
      label: "Sub-Basin (MA - 2)",
      file: "MA2.geojson",
      visible: true,
    },
    {
      id: "MA3",
      label: "Sub-Basin (MA - 3)",
      file: "MA3.geojson",
      visible: true,
    },
    {
      id: "MA4",
      label: "Sub-Basin (MA - 4)",
      file: "MA4.geojson",
      visible: true,
    },
    {
      id: "MA5",
      label: "Sub-Basin (MA - 5)",
      file: "MA5.geojson",
      visible: true,
    },
    {
      id: "MA6",
      label: "Sub-Basin (MA - 6)",
      file: "MA6.geojson",
      visible: true,
    },
    {
      id: "MA7",
      label: "Sub-Basin (MA - 7)",
      file: "MA7.geojson",
      visible: true,
    },
    {
      id: "MA8",
      label: "Sub-Basin (MA - 8)",
      file: "MA8.geojson",
      visible: true,
    },
    {
      id: "MA9",
      label: "Sub-Basin (MA - 9)",
      file: "MA9.geojson",
      visible: true,
    },
    {
      id: "MA10",
      label: "Sub-Basin (MA - 10)",
      file: "MA10.geojson",
      visible: true,
    },
  ],
  centroidsFile: "MahiBasinCentroids.geojson",
};

const waterShadeBasinSlice = createSlice({
  name: "waterShadeBasin",
  initialState,
  reducers: {
    toggleWaterShadeBasinPopup: (state) => {
      state.showWaterShadeBasinPopup = !state.showWaterShadeBasinPopup;
    },
    closeWaterShadeBasinPopup: (state) => {
      state.showWaterShadeBasinPopup = false;
    },
    toggleStatisticsPopup: (state) => {
      state.showStatisticsPopup = !state.showStatisticsPopup;
    },
    closeStatisticsPopup: (state) => {
      state.showStatisticsPopup = false;
    },
    toggleBasinVisibility: (state, action) => {
      const basinId = action.payload;
      const basin = state.basins.find((basin) => basin.id === basinId);
      if (basin) {
        basin.visible = !basin.visible;
        // Update selectedBasins array
        if (basin.visible) {
          if (!state.selectedBasins.includes(basinId)) {
            state.selectedBasins.push(basinId);
          }
        } else {
          state.selectedBasins = state.selectedBasins.filter(
            (id) => id !== basinId
          );
        }
      }
    },
    setBasinVisibility: (state, action) => {
      const { basinId, visible } = action.payload;
      const basin = state.basins.find((basin) => basin.id === basinId);
      if (basin) {
        basin.visible = visible;
        // Update selectedBasins array
        if (visible) {
          if (!state.selectedBasins.includes(basinId)) {
            state.selectedBasins.push(basinId);
          }
        } else {
          state.selectedBasins = state.selectedBasins.filter(
            (id) => id !== basinId
          );
        }
      }
    },
  },
});

export const {
  toggleWaterShadeBasinPopup,
  closeWaterShadeBasinPopup,
  toggleStatisticsPopup,
  closeStatisticsPopup,
  toggleBasinVisibility,
  setBasinVisibility,
} = waterShadeBasinSlice.actions;
export default waterShadeBasinSlice.reducer;
