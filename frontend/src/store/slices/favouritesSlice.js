import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchFavourites = createAsyncThunk(
  "favourites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/favorites/");
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch favourites.");
    }
  }
);

export const addFavourite = createAsyncThunk(
  "favourites/add",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const res = await api.post("/favorites/", { restaurant_id: restaurantId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to add favourite.");
    }
  }
);

export const removeFavourite = createAsyncThunk(
  "favourites/remove",
  async (restaurantId, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/${restaurantId}`);
      return restaurantId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to remove favourite.");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: {
    list: [],         // array of favourite objects { restaurant_id, ... }
    loading: false,
    error: null,
  },
  reducers: {
    clearFavourites(state) {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFavourites
    builder
      .addCase(fetchFavourites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFavourites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // addFavourite
    builder
      .addCase(addFavourite.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addFavourite.rejected, (state, action) => {
        state.error = action.payload;
      });

    // removeFavourite
    builder
      .addCase(removeFavourite.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f.restaurant_id !== action.payload);
      })
      .addCase(removeFavourite.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearFavourites } = favouritesSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectFavourites = (state) => state.favourites.list;
export const selectFavouriteIds = (state) =>
  state.favourites.list.map((f) => f.restaurant_id);
export const selectFavouritesLoading = (state) => state.favourites.loading;
export const selectIsFavourite = (restaurantId) => (state) =>
  state.favourites.list.some((f) => f.restaurant_id === restaurantId);

export default favouritesSlice.reducer;
