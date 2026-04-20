import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetchAll",
  async ({ search = "", city = "" } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      const res = await api.get("/restaurants/", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch restaurants.");
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  "restaurants/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/restaurants/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Restaurant not found.");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState: {
    list: [],           // all restaurants from search
    selected: null,     // single restaurant detail view
    loading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearRestaurantError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchRestaurants
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchRestaurantById
    builder
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelected, clearRestaurantError } = restaurantSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectRestaurants = (state) => state.restaurants.list;
export const selectSelectedRestaurant = (state) => state.restaurants.selected;
export const selectRestaurantsLoading = (state) => state.restaurants.loading;
export const selectRestaurantsError = (state) => state.restaurants.error;

export default restaurantSlice.reducer;
