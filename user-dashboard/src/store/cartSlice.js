import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  items: [],
  totalPrice: 0,
  filters: {
    search: "",
    category: "all",
    brand: "",
  },
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
        toast.success("Quantity Updated");
      } else {
        state.items.push({ ...product, quantity: 1 });
        toast.success("Product Added to Cart");
      }
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      toast.error("Product Removed from Cart");
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
    updateSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    updateCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    updateBrandsFilter: (state, action) => {
      state.filters.brand = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  updateSearchFilter,
  updateCategoryFilter,
  updateBrandsFilter,
} = cartSlice.actions;

export default cartSlice.reducer;
