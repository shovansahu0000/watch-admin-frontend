import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  brands: [],
  coupons: [],
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
    setCoupons: (state, action) => {
      state.coupons = action.payload;
    },
  },
});

export const { setProducts, setBrands, setCoupons } = dataSlice.actions;
export default dataSlice.reducer;

