import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./layoutSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import chatReducer from "@/pages/app/chat/store";

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    auth: authReducer,
    cart: cartReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
