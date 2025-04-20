import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/apiClient';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

// Async thunks for addresses
export const fetchAddresses = createAsyncThunk(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserAddresses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch addresses' });
    }
  }
);

export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await apiService.addUserAddress(addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add address' });
    }
  }
);

export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUserAddress(id, addressData);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update address' });
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteUserAddress(id);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete address' });
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'user/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.setDefaultAddress(id);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to set default address' });
    }
  }
);

// Initial state
const initialState = {
  addresses: [
    // Providing some mock data for development - replace with API data in production
    {
      id: '1', // Using string IDs for flexibility
      fullName: 'Rahul Kumar',
      phone: '9876543210',
      pincode: '400001',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      addressType: 'home',
      isDefault: true
    },
    {
      id: '2',
      fullName: 'Rahul Kumar',
      phone: '9876543210',
      pincode: '400051',
      address: '456 Business Park, Block C',
      city: 'Mumbai',
      state: 'Maharashtra',
      addressType: 'work',
      isDefault: false
    }
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Mock implementations for development - replace with API calls in production
    addAddressMock: (state, action) => {
      const newAddress = {
        id: uuidv4(),
        ...action.payload,
      };
      
      // If this is the first address, or specified as default, update defaults
      if (state.addresses.length === 0 || newAddress.isDefault) {
        state.addresses = state.addresses.map(address => ({
          ...address,
          isDefault: false
        }));
      }
      
      state.addresses.push(newAddress);
    },
    updateAddressMock: (state, action) => {
      const { id, ...addressData } = action.payload;
      const addressIndex = state.addresses.findIndex(addr => addr.id === id);
      
      if (addressIndex >= 0) {
        // Handle making this address default
        if (addressData.isDefault && !state.addresses[addressIndex].isDefault) {
          state.addresses = state.addresses.map(address => ({
            ...address,
            isDefault: false
          }));
        }
        
        state.addresses[addressIndex] = {
          ...state.addresses[addressIndex],
          ...addressData
        };
      }
    },
    deleteAddressMock: (state, action) => {
      const id = action.payload;
      const address = state.addresses.find(addr => addr.id === id);
      
      // Don't allow deletion of default address
      if (address && !address.isDefault) {
        state.addresses = state.addresses.filter(addr => addr.id !== id);
      }
    },
    setDefaultAddressMock: (state, action) => {
      const id = action.payload;
      state.addresses = state.addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload.addresses || [];
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch addresses';
      })
      
      // Add address
      .addCase(addAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const newAddress = action.payload.address;
        
        // If this is the first address, or specified as default, update defaults
        if (state.addresses.length === 0 || newAddress.isDefault) {
          state.addresses = state.addresses.map(address => ({
            ...address,
            isDefault: false
          }));
        }
        
        state.addresses.push(newAddress);
        state.error = null;
        
        // Use mock implementation for now
        // state.addresses.push(action.payload.address);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to add address';
      })
      
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const updatedAddress = action.payload.address;
        const addressIndex = state.addresses.findIndex(addr => addr.id === updatedAddress.id);
        
        if (addressIndex >= 0) {
          // Handle making this address default
          if (updatedAddress.isDefault && !state.addresses[addressIndex].isDefault) {
            state.addresses = state.addresses.map(address => ({
              ...address,
              isDefault: false
            }));
          }
          
          state.addresses[addressIndex] = updatedAddress;
        }
        
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update address';
      })
      
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const id = action.payload.id;
        state.addresses = state.addresses.filter(addr => addr.id !== id);
        state.error = null;
        
        // If we deleted the default address and there are still addresses,
        // set the first one as default
        if (state.addresses.length > 0 && !state.addresses.some(addr => addr.isDefault)) {
          state.addresses[0].isDefault = true;
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to delete address';
      })
      
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const id = action.payload.id;
        state.addresses = state.addresses.map(address => ({
          ...address,
          isDefault: address.id === id
        }));
        
        state.error = null;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to set default address';
      });
  },
});

// Export actions and reducer
export const { 
  addAddressMock, 
  updateAddressMock, 
  deleteAddressMock, 
  setDefaultAddressMock 
} = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectAddresses = (state) => state.user.addresses;
export const selectDefaultAddress = (state) => state.user.addresses.find(addr => addr.isDefault);
export const selectAddressesStatus = (state) => state.user.status;
export const selectAddressesError = (state) => state.user.error;