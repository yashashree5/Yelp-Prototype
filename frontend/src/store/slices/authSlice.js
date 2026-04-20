import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/user/login", { email, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("role", "user");
      // Fetch profile immediately after login
      const profile = await api.get("/users/me");
      return {
        token,
        role: "user",
        email,
        name: profile.data.name,
        profile_pic: profile.data.profile_pic,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Invalid email or password.");
    }
  }
);

export const loginOwner = createAsyncThunk(
  "auth/loginOwner",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/owner/login", { email, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("role", "owner");
      return { token, role: "owner", email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Invalid email or password.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    const { role } = getState().auth;
    try {
      const endpoint = role === "owner" ? "/users/owner/me" : "/users/me";
      const res = await api.get(endpoint);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch user.");
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const token = localStorage.getItem("token");
const role = localStorage.getItem("role") || "user";

const initialState = {
  token: token || null,
  role: token ? role : null,
  loggedIn: !!token,
  user: null,        // { name, email, profile_pic }
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.loggedIn = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedIn = true;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.user = {
          email: action.payload.email,
          name: action.payload.name,
          profile_pic: action.payload.profile_pic,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // loginOwner
    builder
      .addCase(loginOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedIn = true;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.user = { email: action.payload.email };
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          name: action.payload.name,
          profile_pic: action.payload.profile_pic,
          email: action.payload.email,
        };
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectIsLoggedIn = (state) => state.auth.loggedIn;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
