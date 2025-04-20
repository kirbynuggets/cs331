import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/apiClient';
import { toast } from 'react-toastify';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user data' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user data' });
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePassword(passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update password' });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to process forgot password request' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reset password' });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('token');
    // Reset other state slices as needed
    dispatch({ type: 'cart/resetCartState' });
    dispatch({ type: 'wishlist/resetWishlistState' });
    dispatch({ type: 'saveForLater/resetSaveForLaterState' });
    return { success: true };
  }
);

// Check if token exists in localStorage
const token = localStorage.getItem('token');

// Initial state
const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  status: 'idle',
  error: null,
  passwordResetStatus: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Local actions
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success('Login successful');
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed';
        toast.error(state.error);
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success('Registration successful');
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Registration failed';
        toast.error(state.error);
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        // If token is invalid, logout
        if (action.payload?.statusCode === 401) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          localStorage.removeItem('token');
        }
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        toast.success('Profile updated successfully');
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update profile';
        toast.error(state.error);
      })
      
      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        toast.success('Password updated successfully');
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update password';
        toast.error(state.error);
      })
      
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.passwordResetStatus = 'emailSent';
        toast.success('Password reset email sent');
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to process forgot password request';
        toast.error(state.error);
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.passwordResetStatus = 'reset';
        toast.success('Password has been reset successfully');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to reset password';
        toast.error(state.error);
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        toast.success('Logged out successfully');
      });
  },
});

// Export actions and reducer
export const { clearError, clearPasswordResetStatus } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectPasswordResetStatus = (state) => state.auth.passwordResetStatus;