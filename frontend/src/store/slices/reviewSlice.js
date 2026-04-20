import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchReviews = createAsyncThunk(
  "reviews/fetchByRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reviews/restaurant/${restaurantId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch reviews.");
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ restaurantId, rating, comment, photos }, { rejectWithValue }) => {
    try {
      const res = await api.post("/reviews/async/create", {
        restaurant_id: Number(restaurantId),
        rating,
        comment,
        photos: photos || null,
      });
      return res.data; // returns { event_id, status: "queued" }
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to submit review.");
    }
  }
);

export const updateReview = createAsyncThunk(
  "reviews/update",
  async ({ reviewId, rating, comment, photos }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/reviews/async/update/${reviewId}`, {
        rating,
        comment,
        photos: photos || null,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to update review.");
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/async/delete/${reviewId}`);
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to delete review.");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    list: [],             // reviews for the currently viewed restaurant
    submitStatus: null,   // "queued" | "completed" | "failed" | null
    loading: false,
    error: null,
  },
  reducers: {
    clearReviews(state) {
      state.list = [];
      state.error = null;
    },
    clearSubmitStatus(state) {
      state.submitStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchReviews
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // submitReview
    builder
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitStatus = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.submitStatus = action.payload.status; // "queued"
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.submitStatus = "failed";
      });

    // updateReview
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.loading = false;
        state.submitStatus = "queued";
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteReview
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearSubmitStatus } = reviewSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectReviews = (state) => state.reviews.list;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;
export const selectSubmitStatus = (state) => state.reviews.submitStatus;

export default reviewSlice.reducer;
