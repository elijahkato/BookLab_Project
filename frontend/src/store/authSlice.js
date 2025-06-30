import { createSlice } from "@reduxjs/toolkit";

// Validate localStorage values to ensure they are strings or null
const getValidatedItem = (key) => {
  const item = localStorage.getItem(key);
  return typeof item === "string" && item !== "null" && item !== "undefined"
    ? item
    : null;
};

/**
 * Redux slice for managing authentication state
 * @type {import("@reduxjs/toolkit").Slice}
 */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: getValidatedItem("token"),
    username: getValidatedItem("username"),
  },
  reducers: {
    /**
     * Sets authentication credentials
     * @param {Object} state - Current state
     * @param {Object} action - Action with payload { token: string, username: string }
     */
    setCredentials: (state, action) => {
      const { token, username } = action.payload;
      if (typeof token === "string" && typeof username === "string") {
        state.token = token;
        state.username = username;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
      }
    },
    /**
     * Clears authentication state and localStorage
     * @param {Object} state - Current state
     */
    clearAuth: (state) => {
      state.token = null;
      state.username = null;
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
