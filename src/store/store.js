// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";
import layersReducer from "./layersSlice";
import themeReducer from "./themeSlice";
import waterShadeBasinReducer from "./waterShadeBasinSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    layers: layersReducer,
    theme: themeReducer,
    waterShadeBasin: waterShadeBasinReducer,
  },
});
