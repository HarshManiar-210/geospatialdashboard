// src/store/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showThemePopup: false,
  selectedTheme: "landuse",
  selectedSubTheme: "elevation", // Set elevation as default sub-theme
  selectedRiverOrders: [], // Array of selected river order IDs
  themes: [
    {
      id: "landuse",
      label: "Landuse",
      image: "Landuse_Edge.png",
      icon: "TreePine",
      isDefault: true,
    },
    {
      id: "hydrology",
      label: "Hydrology",
      image: null,
      icon: "Droplets",
      isDefault: false,
      subThemes: [
        {
          id: "1-2",
          label: "1-2",
          file: "order1.geojson",
        },
        {
          id: "2-3",
          label: "2-3",
          file: "order2.geojson",
        },
        {
          id: "3-4",
          label: "3-4",
          file: "order3.geojson",
        },
        {
          id: "4-5",
          label: "4-5",
          file: "order4.geojson",
        },
        {
          id: "5-6",
          label: "5-6",
          file: "order5.geojson",
        },
        {
          id: "6-7",
          label: "6-7",
          file: "order6.geojson",
        },
      ],
    },
    {
      id: "terrain",
      label: "Terrain",
      image: null,
      icon: "Mountain",
      isDefault: false,
      subThemes: [
        {
          id: "elevation",
          label: "Elevation",
          image: "Elevation_Edge.png",
        },
        {
          id: "aspect",
          label: "Aspect",
          image: "Aspect_Edge.png",
        },
        {
          id: "slope",
          label: "Slope",
          image: "Slope_Edge.png",
        },
      ],
    },
  ],
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleThemePopup: (state) => {
      state.showThemePopup = !state.showThemePopup;
    },
    closeThemePopup: (state) => {
      state.showThemePopup = false;
    },
    setSelectedTheme: (state, action) => {
      state.selectedTheme = action.payload;
      // Set elevation as default sub-theme when terrain is selected, otherwise reset to null
      state.selectedSubTheme =
        action.payload === "terrain" ? "elevation" : null;
    },
    setSelectedSubTheme: (state, action) => {
      state.selectedSubTheme = action.payload;
    },
    toggleRiverOrder: (state, action) => {
      const orderId = action.payload;
      const index = state.selectedRiverOrders.indexOf(orderId);
      if (index > -1) {
        state.selectedRiverOrders.splice(index, 1);
      } else {
        state.selectedRiverOrders.push(orderId);
      }
    },
    setRiverOrderVisibility: (state, action) => {
      const { orderId, visible } = action.payload;
      if (visible && !state.selectedRiverOrders.includes(orderId)) {
        state.selectedRiverOrders.push(orderId);
      } else if (!visible) {
        state.selectedRiverOrders = state.selectedRiverOrders.filter(
          (id) => id !== orderId
        );
      }
    },
  },
});

export const {
  toggleThemePopup,
  closeThemePopup,
  setSelectedTheme,
  setSelectedSubTheme,
  toggleRiverOrder,
  setRiverOrderVisibility,
} = themeSlice.actions;
export default themeSlice.reducer;
