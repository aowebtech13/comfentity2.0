import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axios";
import authService from "@/services/authService";

// Initial state from localStorage if available
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

let parsedUser = null;
if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser);
  } catch (e) {
    parsedUser = null;
  }
}

const initialState = {
  user: parsedUser,
  isAuth: !!storedToken,
  token: storedToken || null,
  loading: false,
  error: null,
};

// Async thunk for login via axios
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const data = response.data;
      if (data.access_token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.access_token);
      }
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.email?.[0] ||
        "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Async thunk for registration via axios
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      const data = response.data;
      if (data.access_token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.access_token);
      }
      return data;
    } catch (error) {
      const errorData = error?.response?.data;
      const message =
        errorData?.message ||
        Object.values(errorData?.errors || {}).flat()[0] ||
        "An error occurred. Please try again later.";
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logout — revoke the token on the server,
// then always clear local auth state even if the API call fails.
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      // Best-effort: ignore server errors (e.g. token already expired/revoked).
      // Local state is cleared regardless.
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return {};
  }
);

// Async thunk for fetching profile via axios
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/profile");
      const data = response.data;
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload;
      state.user = payload.user || payload;
      state.isAuth = true;
      state.token = payload.access_token || state.token;
      if (payload.access_token) {
        localStorage.setItem("token", payload.access_token);
      }
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logOut: (state) => {
      state.user = null;
      state.isAuth = false;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuth = true;
        state.token = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuth = true;
        state.token = action.payload.access_token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
        state.token = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setUser, logOut, updateUser } = authSlice.actions;

export default authSlice.reducer;
