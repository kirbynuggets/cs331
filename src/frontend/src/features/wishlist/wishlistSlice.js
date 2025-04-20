import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/apiClient';
import { toast } from 'react-toastify';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWishlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch wishlist' });
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiService.addToWishlist(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add item to wishlist' });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await apiService.removeFromWishlist(productId);
      return { productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove item from wishlist' });
    }
  }
);

// Initial state
const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Local actions (not requiring API calls)
    resetWishlistState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch wishlist';
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Either replace the entire items array or add the new item
        if (action.payload.items) {
          state.items = action.payload.items;
        } else if (action.payload.item) {
          state.items.push(action.payload.item);
        }
        toast.success('Item added to wishlist');
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to add item to wishlist';
        toast.error(state.error);
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.productId);
        toast.success('Item removed from wishlist');
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to remove item from wishlist';
        toast.error(state.error);
      });
  },
});

// Export actions and reducer
export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;

// Selectors
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistStatus = (state) => state.wishlist.status;
export const selectIsInWishlist = (state, productId) => 
  state.wishlist.items.some(item => item.id === productId);