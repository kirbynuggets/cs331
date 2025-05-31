import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiClient.js';
import { toast } from 'react-toastify';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch cart' });
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity, price, size, color }, { rejectWithValue }) => {
    try {
      console.log('Thunk: Attempting apiService.addToCart call...'); // Added log
      const response = await apiService.addToCart(productId, quantity, price, size, color);
      console.log('Thunk: apiService.addToCart call succeeded. Response data:', response.data);
      return response.data;
    } catch (error) {

      console.error('addItemToCart CATCH block triggered!');
      console.error('>>> Full Error Object:', error);
      console.error('>>> error.response:', error.response);
      console.error('>>> error.response?.data:', error.response?.data);
      console.error('>>> error.message:', error.message);
      console.error('>>> error.config:', error.config); // Shows the request config 

      return rejectWithValue(error.response?.data || { message: 'Failed to add item to cart' });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateCartItem(itemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update cart item' });
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await apiService.removeCartItem(itemId);
      return { itemId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove cart item' });
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.clearCart();
      return {};
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to clear cart' });
    }
  }
);

export const saveShippingInfo = createAsyncThunk(
  'cart/saveShippingInfo',
  async (shippingInfo, { rejectWithValue }) => {
    try {
      const response = await apiService.saveShippingInfo(shippingInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save shipping information' });
    }
  }
);

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  shippingInfo: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  let totalQuantity = 0;
  let totalPrice = 0;
  
  items.forEach(item => {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;
  });
  
  return { totalQuantity, totalPrice };
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local actions (not requiring API calls)
    resetCartState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalPrice = totalPrice;
        state.shippingInfo = action.payload.shippingInfo || null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch cart';
      })
      
      // Add item to cart
    //   .addCase(addItemToCart.pending, (state) => {
    //     state.status = 'loading';
    //   })
    //   // .addCase(addItemToCart.fulfilled, (state, action) => {
    //   //   state.status = 'succeeded';
    //   //   state.items = action.payload.items;
    //   //   const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
    //   //   state.totalQuantity = totalQuantity;
    //   //   state.totalPrice = totalPrice;
    //   //   toast.success('Item added to cart');
    //   // })
    //       .addCase(addItemToCart.fulfilled, (state, action) => {
    //   console.log('addItemToCart fulfilled. Payload:', action.payload); // Log payload from backend
    //   state.status = 'succeeded';
    //   state.items = action.payload.items; // Ensure payload.items is the array
    //   const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
    //   console.log('Calculated totals:', { totalQuantity, totalPrice }); // Log calculated totals
    //   state.totalQuantity = totalQuantity;
    //   state.totalPrice = totalPrice;
    //   toast.success('Item added to cart');
    //   console.log('New cart state:', JSON.parse(JSON.stringify(state))); // Log the entire new state
    // })
    //   .addCase(addItemToCart.rejected, (state, action) => {
    //     state.status = 'failed';
    //     state.error = action.payload?.message || 'Failed to add item to cart';
    //     toast.error(state.error);
    //   })

      // Add item to cart
      .addCase(addItemToCart.pending, (state) => {
        console.log("addItemToCart pending..."); // Optional: Log pending state
        state.status = 'loading';
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        // This part isn't running, which is the problem symptom
        console.log('addItemToCart fulfilled. Payload:', action.payload);
        state.status = 'succeeded';
        state.items = action.payload.items;
        const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
        console.log('Calculated totals:', { totalQuantity, totalPrice });
        state.totalQuantity = totalQuantity;
        state.totalPrice = totalPrice;
        toast.success('Item added to cart');
        console.log('New cart state:', JSON.parse(JSON.stringify(state)));
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        // --- ADD DETAILED LOGGING HERE ---
        console.error('addItemToCart REJECTED!');
        console.error('Action Payload (from rejectWithValue):', action.payload);
        console.error('Action Error (if any):', action.error);
        // --- END OF ADDED LOGGING ---

        state.status = 'failed';
        // Prioritize payload message, then action error message
        state.error = action.payload?.message || action.error?.message || 'Unknown error adding item';
        toast.error(`Failed to add item: ${state.error}`); // Show more specific error
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalPrice = totalPrice;
        toast.success('Cart updated');
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update cart';
        toast.error(state.error);
      })
      
      // Remove cart item
      .addCase(removeCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.itemId);
        const { totalQuantity, totalPrice } = calculateCartTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalPrice = totalPrice;
        toast.success('Item removed from cart');
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to remove item from cart';
        toast.error(state.error);
      })
      
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
        toast.success('Cart cleared');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to clear cart';
        toast.error(state.error);
      })
      
      // Save shipping info
      .addCase(saveShippingInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveShippingInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shippingInfo = action.payload.shippingInfo;
        toast.success('Shipping information saved');
      })
      .addCase(saveShippingInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to save shipping information';
        toast.error(state.error);
      });
  },
});

// Export actions and reducer
export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalPrice = (state) => state.cart.totalPrice;
export const selectShippingInfo = (state) => state.cart.shippingInfo;
export const selectCartStatus = (state) => state.cart.status;