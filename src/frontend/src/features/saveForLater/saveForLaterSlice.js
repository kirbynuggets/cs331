import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/apiClient';
import { toast } from 'react-toastify';

// Async thunks
export const fetchSaveForLater = createAsyncThunk(
  'saveForLater/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSaveForLater();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch saved items' });
    }
  }
);

export const addToSaveForLater = createAsyncThunk(
  'saveForLater/addItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await apiService.addToSaveForLater(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save item for later' });
    }
  }
);

export const moveToCart = createAsyncThunk(
  'saveForLater/moveToCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await apiService.moveToCart(itemId);
      return { ...response.data, itemId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to move item to cart' });
    }
  }
);

export const removeSaveForLaterItem = createAsyncThunk(
  'saveForLater/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await apiService.removeSaveForLaterItem(itemId);
      return { itemId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove saved item' });
    }
  }
);

// Initial state
const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// SaveForLater slice
const saveForLaterSlice = createSlice({
  name: 'saveForLater',
  initialState,
  reducers: {
    // Local actions (not requiring API calls)
    resetSaveForLaterState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch saved items
      .addCase(fetchSaveForLater.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSaveForLater.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
      })
      .addCase(fetchSaveForLater.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch saved items';
      })
      
      // Add to save for later
      .addCase(addToSaveForLater.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToSaveForLater.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Either replace the entire items array or add the new item
        if (action.payload.items) {
          state.items = action.payload.items;
        } else if (action.payload.item) {
          state.items.push(action.payload.item);
        }
        toast.success('Item saved for later');
      })
      .addCase(addToSaveForLater.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to save item for later';
        toast.error(state.error);
      })
      
      // Move to cart
      .addCase(moveToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.itemId);
        toast.success('Item moved to cart');
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to move item to cart';
        toast.error(state.error);
      })
      
      // Remove saved item
      .addCase(removeSaveForLaterItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeSaveForLaterItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.itemId);
        toast.success('Item removed from saved items');
      })
      .addCase(removeSaveForLaterItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to remove saved item';
        toast.error(state.error);
      });
  },
});

// Export actions and reducer
export const { resetSaveForLaterState } = saveForLaterSlice.actions;
export default saveForLaterSlice.reducer;

// Selectors
export const selectSaveForLater = (state) => state.saveForLater;
export const selectSaveForLaterItems = (state) => state.saveForLater.items;
export const selectSaveForLaterStatus = (state) => state.saveForLater.status;