// src/store/riverSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  riverData: {}, // Store loaded river GeoJSON data
  selectedRiverOrders: [], // Array of selected river order IDs
  selectedBasins: [], // Array of selected basin IDs for filtering
  isLoading: false,
  loadingMessage: "",
};

const riverSlice = createSlice({
  name: "river",
  initialState,
  reducers: {
    setRiverData: (state, action) => {
      const { orderId, data } = action.payload;
      state.riverData[orderId] = data;
    },
    setSelectedRiverOrders: (state, action) => {
      state.selectedRiverOrders = action.payload;
    },
    setRiverSelectedBasins: (state, action) => {
      state.selectedBasins = action.payload;
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
    setLoading: (state, action) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || "";
    },
    clearRiverData: (state) => {
      state.riverData = {};
    },
  },
});

export const {
  setRiverData,
  setSelectedRiverOrders,
  setRiverSelectedBasins,
  toggleRiverOrder,
  setLoading,
  clearRiverData,
} = riverSlice.actions;

export default riverSlice.reducer;
