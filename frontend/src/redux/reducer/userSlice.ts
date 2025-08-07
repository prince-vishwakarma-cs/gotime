import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types/types";
import { authAPI } from "../api/authAPI";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      authAPI.endpoints.loginUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user ?? null;
        state.isAuthenticated = !!payload.user;
      }
    );
    builder.addMatcher(
      authAPI.endpoints.getMyProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user ?? null;
        state.isAuthenticated = !!payload.user;
      }
    );
    builder.addMatcher(authAPI.endpoints.logoutUser.matchFulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addMatcher(
      authAPI.endpoints.getMyProfile.matchRejected,
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
      }
    );
  },
});

export default authSlice.reducer;
