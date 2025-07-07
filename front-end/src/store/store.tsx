import { configureStore } from "@reduxjs/toolkit";
import forgotResetReducer from "./slices/forgotResetSlice";
import renderAdminNotificationsReducer from "./slices/renderAdminNotificationsSlice";
import renderUserNotificationsReducer from "./slices/renderUserNotificationsSlice";

export const store = configureStore({
  reducer: {
    forgotReset: forgotResetReducer,
    renderAdminNotifications: renderAdminNotificationsReducer,
    renderUserNotifications: renderUserNotificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
