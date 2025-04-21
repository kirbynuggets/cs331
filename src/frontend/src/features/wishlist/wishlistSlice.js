// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiService } from '../../services/apiClient';
// import { toast } from 'react-toastify';

// // Async thunks
// export const fetchWishlist = createAsyncThunk(
//   'wishlist/fetchWishlist',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await apiService.getWishlist();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { message: 'Failed to fetch wishlist' });
//     }
//   }
// );

// export const addToWishlist = createAsyncThunk(
//   'wishlist/addToWishlist',
//   async (productId, { rejectWithValue }) => {
//     try {
//       const response = await apiService.addToWishlist(productId);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { message: 'Failed to add item to wishlist' });
//     }
//   }
// );

// export const removeFromWishlist = createAsyncThunk(
//   'wishlist/removeFromWishlist',
//   async (productId, { rejectWithValue }) => {
//     try {
//       await apiService.removeFromWishlist(productId);
//       return { productId };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || { message: 'Failed to remove item from wishlist' });
//     }
//   }
// );

// // Initial state
// const initialState = {
//   items: [],
//   status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null,
// };

// // Wishlist slice
// const wishlistSlice = createSlice({
//   name: 'wishlist',
//   initialState,
//   reducers: {
//     // Local actions (not requiring API calls)
//     resetWishlistState: (state) => {
//       return initialState;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch wishlist
//       .addCase(fetchWishlist.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchWishlist.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.items = action.payload.items || [];
//       })
//       .addCase(fetchWishlist.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload?.message || 'Failed to fetch wishlist';
//       })
      
//       // Add to wishlist
//       .addCase(addToWishlist.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(addToWishlist.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         // Either replace the entire items array or add the new item
//         if (action.payload.items) {
//           state.items = action.payload.items;
//         } else if (action.payload.item) {
//           state.items.push(action.payload.item);
//         }
//         toast.success('Item added to wishlist');
//       })
//       .addCase(addToWishlist.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload?.message || 'Failed to add item to wishlist';
//         toast.error(state.error);
//       })
      
//       // Remove from wishlist
//       .addCase(removeFromWishlist.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(removeFromWishlist.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.items = state.items.filter(item => item.id !== action.payload.productId);
//         toast.success('Item removed from wishlist');
//       })
//       .addCase(removeFromWishlist.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload?.message || 'Failed to remove item from wishlist';
//         toast.error(state.error);
//       });
//   },
// });

// // Export actions and reducer
// export const { resetWishlistState } = wishlistSlice.actions;
// export default wishlistSlice.reducer;

// // Selectors
// export const selectWishlist = (state) => state.wishlist;
// export const selectWishlistItems = (state) => state.wishlist.items;
// export const selectWishlistStatus = (state) => state.wishlist.status;
// export const selectIsInWishlist = (state, productId) => 
//   state.wishlist.items.some(item => item.id === productId);

// wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiClient'; // Ensure this path is correct
import { toast } from 'react-toastify';

// Async thunks (Keep these as they are)
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWishlist();
      console.log(response.data);
      // Assuming backend returns { items: [{ id: db_id, productId: product_id }, ...] }
      return response.data;
    } catch (error) {
      console.error("fetchWishlist Error:", error); // Log error
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch wishlist' });
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      // Assuming backend returns { message: "...", item: { id: db_id, productId: product_id } } or just confirms success
      const response = await apiService.addToWishlist(productId);
      // Return the productId so reducer knows what was added
      return { productId, responseData: response.data };
    } catch (error) {
      console.error("addToWishlist Error:", error); // Log error
      return rejectWithValue(error.response?.data || { message: 'Failed to add item to wishlist' });
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await apiService.removeFromWishlist(productId);
      // Return the productId that was removed for the reducer
      return { productId };
    } catch (error) {
      console.error("removeFromWishlist Error:", error); // Log error
      return rejectWithValue(error.response?.data || { message: 'Failed to remove item from wishlist' });
    }
  }
);

// Initial state
const initialState = {
  items: [], // Should store objects like { id: wishlistItemId, productId: actualProductId }
  productIds: [], // Maintain a simple list of product IDs for quick lookups
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      return initialState;
    },
    // Optional: You could add optimistic updates here if needed
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
        // Update the helper list of productIds
        state.productIds = state.items.map(item => item.productId);
        state.error = null; // Clear previous error
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch wishlist';
      })

      // Add to wishlist
      .addCase(addToWishlist.pending, (state, action) => {
        state.status = 'loading';
        // Optional: Optimistically add productId
        // if (!state.productIds.includes(action.meta.arg)) {
        //   state.productIds.push(action.meta.arg);
        // }
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const addedProductId = action.payload.productId;
        // Add the productId if it's not already there (handles potential race conditions/backend delays)
        if (!state.productIds.includes(addedProductId)) {
          state.productIds.push(addedProductId);
          // If backend returns the actual item, add it to items array too
          if (action.payload.responseData?.item) {
             state.items.push(action.payload.responseData.item);
          } else {
             // If not, we might only have the ID. Add a placeholder or refetch?
             // For now, just ensuring productIds is updated might be enough for the selector
             // A full fetch might be needed later if you display the full wishlist item details
          }
        }
        toast.success('Added to Wishlist');
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to add item to wishlist';
        toast.error(state.error);
        // Optional: Rollback optimistic update if used
        // state.productIds = state.productIds.filter(id => id !== action.meta.arg);
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.status = 'loading';
         // Optional: Optimistically remove productId
        // state.productIds = state.productIds.filter(id => id !== action.meta.arg);
        // state.items = state.items.filter(item => item.productId !== action.meta.arg);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const removedProductId = action.payload.productId;
        // --- FIX: Filter based on productId ---
        state.items = state.items.filter(item => item.productId !== removedProductId);
        state.productIds = state.productIds.filter(id => id !== removedProductId);
        // ---------------------------------------
        toast.success('Removed from Wishlist');
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to remove item from wishlist';
        toast.error(state.error);
         // Optional: Rollback optimistic update if used
        // Consider refetching if optimistic update failed
      });
  },
});

// Export actions and reducer
export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;

// Selectors
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistProductIds = (state) => state.wishlist.productIds; // Use this for checks
export const selectWishlistStatus = (state) => state.wishlist.status;

// --- FIX: Selector checks productId against the productIds array ---
export const selectIsInWishlist = (state, productId) =>
  state.wishlist.productIds.includes(productId);
// --------------------------------------------------------------------