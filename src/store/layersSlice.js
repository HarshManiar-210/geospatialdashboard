// src/store/layersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showLayersPopup: false,
  isLoading: false,
  loadingMessage: "",
  layers: [
    {
      id: "district",
      label: "District",
      file: "DistrictBoundary.geojson",
      centroidsFile: "DitsrictCentroids.geojson",
      visible: false,
    },
    {
      id: "talukas",
      label: "Talukas",
      file: "TalukaBoundary.geojson",
      centroidsFile: "TalukaCentroids.geojson",
      visible: false,
    },
    { id: "road", label: "Road", file: "Roads_layer.geojson", visible: false },
    {
      id: "railways",
      label: "Railways",
      file: "Railway.geojson",
      visible: false,
    },
    { id: "canal", label: "Canal", file: "Canals.geojson", visible: false },
  ],
};

const layersSlice = createSlice({
  name: "layers",
  initialState,
  reducers: {
    toggleLayersPopup: (state) => {
      state.showLayersPopup = !state.showLayersPopup;
    },
    closeLayersPopup: (state) => {
      state.showLayersPopup = false;
    },
    toggleLayerVisibility: (state, action) => {
      const layerId = action.payload;
      const layer = state.layers.find((layer) => layer.id === layerId);
      if (layer) {
        layer.visible = !layer.visible;
      }
    },
    setLayerVisibility: (state, action) => {
      const { layerId, visible } = action.payload;
      const layer = state.layers.find((layer) => layer.id === layerId);
      if (layer) {
        layer.visible = visible;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || "";
    },
  },
});

export const {
  toggleLayersPopup,
  closeLayersPopup,
  toggleLayerVisibility,
  setLayerVisibility,
  setLoading,
} = layersSlice.actions;
export default layersSlice.reducer;
