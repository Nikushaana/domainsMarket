import { createSlice, PayloadAction } from "@reduxjs/toolkit";



const initialState: ForgotResetState = {
  email: "",
  code: "",
  newPassword: "",
  repeatNewPassword: "",
};

const forgotResetSlice = createSlice({
  name: "forgotReset",
  initialState,
  reducers: {
    setForgotResetValues(
      state,
      action: PayloadAction<Partial<ForgotResetState>>
    ) {
      return { ...state, ...action.payload };
    },
    clearForgotResetValues: () => initialState,
  },
});

export const { setForgotResetValues, clearForgotResetValues } =
  forgotResetSlice.actions;
export default forgotResetSlice.reducer;
