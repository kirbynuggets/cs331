import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiClient';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await apiService.getProducts(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getProduct(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch product details' });
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFeaturedProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch featured products' });
    }
  }
);

export const fetchRandomProducts = createAsyncThunk(
  'products/fetchRandomProducts',
  async ({ limit = 8, gender = null }, { rejectWithValue }) => {
    try {
      const response = await apiService.getRandomProducts(limit, gender);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch random products' });
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await apiService.searchProducts(searchTerm);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Search failed' });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch categories' });
    }
  }
);

export const fetchPriceRange = createAsyncThunk(
  'products/fetchPriceRange',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPriceRange();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch price range' });
    }
  }
);

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  randomProducts: [],
  searchResults: [],
  categories: {
    gender: [],
    masterCategory: [],
    subCategory: [],
    articleType: [],
    baseColour: [],
    season: [],
    usage: []
  },
  priceRange: {
    min_price: 0,
    max_price: 10000
  },
  filters: {
    gender: null,
    masterCategory: null,
    subCategory: null,
    articleType: null,
    baseColour: null,
    season: null,
    usage: null,
    price_min: null,
    price_max: null
  },
  sort: {
    sort_by: 'id',
    sort_direction: 'asc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
      state.pagination.currentPage = 1;
    },
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearProductDetail: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products || [];
        
        // Update pagination if available in response
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination
          };
        }
        
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch products';
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload.product || null;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch product details';
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.featuredProducts = action.payload.products || [];
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch featured products';
      })
      
      // Fetch random products
      .addCase(fetchRandomProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRandomProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.randomProducts = action.payload.products || [];
        state.error = null;
      })
      .addCase(fetchRandomProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch random products';
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload.products || [];
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Search failed';
      })
      
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload || initialState.categories;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch categories';
      })
      
      // Fetch price range
      .addCase(fetchPriceRange.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPriceRange.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.priceRange = action.payload || initialState.priceRange;
        state.error = null;
      })
      .addCase(fetchPriceRange.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch price range';
      });
  },
});

// Export actions and reducer
export const { 
  setFilters, 
  resetFilters, 
  setSort, 
  setPage,
  clearProductDetail
} = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectRandomProducts = (state) => state.products.randomProducts;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectCategories = (state) => state.products.categories;
export const selectPriceRange = (state) => state.products.priceRange;
export const selectProductFilters = (state) => state.products.filters;
export const selectProductSort = (state) => state.products.sort;
export const selectProductPagination = (state) => state.products.pagination;
export const selectProductStatus = (state) => state.products.status;
export const selectProductError = (state) => state.products.error;