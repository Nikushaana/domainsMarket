import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RenderUserNotificationsState {
  render: number;
}

const initialState: RenderUserNotificationsState = {
  render: 1,
};

const renderUserNotificationsSlice = createSlice({
  name: "renderUserNotifications",
  initialState,
  reducers: {
    nextStepUser(state) {
      state.render += 1;
    },
  },
});

export const { nextStepUser } = renderUserNotificationsSlice.actions;
export default renderUserNotificationsSlice.reducer;
