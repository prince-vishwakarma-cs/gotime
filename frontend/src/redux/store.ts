import { configureStore } from "@reduxjs/toolkit";
import { authSlice} from "./reducer/userSlice";
import { authAPI } from "./api/authAPI";
import { eventApi } from "./api/eventAPI";
import { uiSlice } from "./reducer/uiSlice";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [authSlice.reducerPath]:authSlice.reducer,
    [eventApi.reducerPath]:eventApi.reducer,
    [uiSlice.reducerPath]:uiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authAPI.middleware).concat(eventApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
 