import { configureStore } from "@reduxjs/toolkit";
import currentPathReducer from "../features/currentPath/currentPathSlice";

export const store = configureStore({
  reducer: {
    currentPath: currentPathReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
