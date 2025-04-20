import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import orderReducer from '../features/orders/orderSlice';
import productReducer from '../features/products/productSlice';
import saveForLaterReducer from '../features/saveForLater/saveForLaterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    products: productReducer,
    saveForLater: saveForLaterReducer,
  },
});