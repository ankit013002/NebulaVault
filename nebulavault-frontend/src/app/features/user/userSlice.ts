import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: "STARTER" | "PRO" | "TEAM" | string;
  quotaBytes: number;
  usedBytes: number;
  loaded: boolean;
};

const initialState: UserState = {
  id: "",
  email: "",
  name: null,
  avatarUrl: null,
  plan: "STARTER",
  quotaBytes: 0,
  usedBytes: 0,
  loaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, action.payload, { loaded: true });
    },
    updateUsedBytes(state, action: PayloadAction<number>) {
      state.usedBytes = action.payload;
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, updateUsedBytes, clearUser } = userSlice.actions;
export default userSlice.reducer;
