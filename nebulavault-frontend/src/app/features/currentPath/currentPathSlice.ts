import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";

export interface CurrentPathState {
  path: string;
}

const initialState: CurrentPathState = { path: "" };

const normalize = (p: string) =>
  p.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

export const currentPathSlice = createSlice({
  name: "currentPath",
  initialState,
  reducers: {
    setPath(state, action: PayloadAction<string>) {
      state.path = normalize(action.payload);
    },
    enterFolder(state, action: PayloadAction<string>) {
      const child = normalize(action.payload);
      state.path = [state.path, child].filter(Boolean).join("/");
    },
    upDir(state) {
      state.path = state.path.split("/").slice(0, -1).join("/");
    },
    resetPath(state) {
      state.path = "";
    },
  },
});

export const { setPath, enterFolder, upDir, resetPath } =
  currentPathSlice.actions;

export const selectCurrentPath = (state: RootState) => state.currentPath.path;

export default currentPathSlice.reducer;
