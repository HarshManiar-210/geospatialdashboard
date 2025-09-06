// src/store/mapSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showMapPopup: false,
  activeLayer: "osm", // default OpenStreetMap
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    toggleMapPopup: (state) => {
      state.showMapPopup = !state.showMapPopup;
    },
    closeMapPopup: (state) => {
      state.showMapPopup = false;
    },
    setActiveLayer: (state, action) => {
      state.activeLayer = action.payload;
    },
  },
});

export const { toggleMapPopup, closeMapPopup, setActiveLayer } =
  mapSlice.actions;
export default mapSlice.reducer;
