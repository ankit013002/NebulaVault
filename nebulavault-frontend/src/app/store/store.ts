import { configureStore } from "@reduxjs/toolkit";
import currentPathReducer from "../features/currentPath/currentPathSlice";
import userReducer from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    currentPath: currentPathReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
