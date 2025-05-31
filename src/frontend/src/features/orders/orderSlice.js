import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiClient';
import { toast } from 'react-toastify';
import { clearCart } from '../cart/cartSlice';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiService.createOrder(orderData);
      
      // Clear cart on successful order
      if (response.data.success) {
        dispatch(clearCart());
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create order' });
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'orders/getOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrderDetails(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch order details' });
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  'orders/getPaymentStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrderPaymentStatus(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch payment status' });
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  paymentStatus: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  orderCreationSuccess: false,
};

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      return initialState;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.paymentStatus = null;
    },
    clearOrderCreationStatus: (state) => {
      state.orderCreationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
        state.orderCreationSuccess = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload.order;
        state.orderCreationSuccess = true;
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create order';
        state.orderCreationSuccess = false;
        toast.error(state.error);
      })
      
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.orders || [];
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch orders';
        toast.error(state.error);
      })
      
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload.order;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch order details';
        toast.error(state.error);
      })
      
      // Get payment status
      .addCase(getPaymentStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.paymentStatus = action.payload.paymentStatus;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch payment status';
        toast.error(state.error);
      });
  },
});

// Export actions and reducer
export const { resetOrderState, clearCurrentOrder, clearOrderCreationStatus } = orderSlice.actions;
export default orderSlice.reducer;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectPaymentStatus = (state) => state.orders.paymentStatus;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;
export const selectOrderCreationSuccess = (state) => state.orders.orderCreationSuccess;