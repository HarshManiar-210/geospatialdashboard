// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";
import layersReducer from "./layersSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    layers: layersReducer,
  },
});
