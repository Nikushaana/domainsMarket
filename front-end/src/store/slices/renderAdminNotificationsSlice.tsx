import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RenderAdminNotificationsState {
  render: number;
}

const initialState: RenderAdminNotificationsState = {
  render: 1,
};

const renderAdminNotificationsSlice = createSlice({
  name: "renderAdminNotifications",
  initialState,
  reducers: {
    nextStepAdmin(state) {
      state.render += 1;
    },
  },
});

export const { nextStepAdmin } = renderAdminNotificationsSlice.actions;
export default renderAdminNotificationsSlice.reducer;
