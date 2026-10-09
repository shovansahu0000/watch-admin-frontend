import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  brands: [],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setBrands: (state, action) => {
      state.brands = action.payload;
    },
  },
});

export const { setProducts, setBrands } = dataSlice.actions;
export default dataSlice.reducer;
