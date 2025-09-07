// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";
import layersReducer from "./layersSlice";
import themeReducer from "./themeSlice";
import waterShadeBasinReducer from "./waterShadeBasinSlice";
import riverReducer from "./riverSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    layers: layersReducer,
    theme: themeReducer,
    waterShadeBasin: waterShadeBasinReducer,
    river: riverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["river/setRiverData"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.data"],
        // Ignore these paths in the state
        ignoredPaths: ["river.riverData"],
      },
    }),
});
