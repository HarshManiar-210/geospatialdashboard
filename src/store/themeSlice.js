// src/store/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showThemePopup: false,
  selectedTheme: "landuse",
  selectedSubTheme: null,
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
      // Reset sub-theme when main theme changes
      state.selectedSubTheme = null;
    },
    setSelectedSubTheme: (state, action) => {
      state.selectedSubTheme = action.payload;
    },
  },
});

export const {
  toggleThemePopup,
  closeThemePopup,
  setSelectedTheme,
  setSelectedSubTheme,
} = themeSlice.actions;
export default themeSlice.reducer;
