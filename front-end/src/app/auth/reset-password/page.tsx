"use client";

import { axiosFront } from "@/app/components/data/axios";
import { userProviderContext } from "@/app/components/data/user/userContext";
import InputCust from "@/app/components/input/inputCust";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setForgotResetValues } from "@/store/slices/forgotResetSlice";
import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function page() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { email, code, newPassword, repeatNewPassword } = useAppSelector(
    (state) => state.forgotReset
  );

  const [resetPasswordLoader, setResetPasswordLoader] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<
    Record<string, string>
  >({});

  const resetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/,
        "Please enter valid Email"
      ),
    code: Yup.string().required("Code is required"),
    newPassword: Yup.string().required("New Password is required").min(6),
    repeatNewPassword: Yup.string()
      .required("Repeated New Password is required")
      .min(6)
      .oneOf([Yup.ref("newPassword")], "New Passwords must be same"),
  });

  const handleResetPasswordValidation = () => {
    resetPasswordSchema
      .validate(
        { email, code, newPassword, repeatNewPassword },
        { abortEarly: false }
      )
      .then(() => {
        setResetPasswordError({});
        handleResetPassword();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setResetPasswordError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleResetPassword = () => {
    setResetPasswordLoader(true);

    axiosFront
      .post(`user/resetPassword`, {
        email: email,
        code: code,
        newPassword: newPassword,
      })
      .then((res) => {
        router.push("/auth/login");
        toast.success("Password Reseted successfully!", {
          autoClose: 3000,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setResetPasswordLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[15px]">
      <InputCust
        title="Code"
        placeholder="Enter Code From Email.."
        name="code"
        setAllValues={(val) => {
          const currentState = { code };
          const resolvedVal =
            typeof val === "function" ? val(currentState) : val;

          dispatch(setForgotResetValues(resolvedVal));
        }}
        error={!!resetPasswordError.code}
        inputStyle={2}
      />
      <InputCust
        title="New Password"
        placeholder="Enter New Password.."
        name="newPassword"
        setAllValues={(val) => {
          const currentState = { code };
          const resolvedVal =
            typeof val === "function" ? val(currentState) : val;

          dispatch(setForgotResetValues(resolvedVal));
        }}
        error={!!resetPasswordError.newPassword}
        inputStyle={2}
        isPassword={true}
      />
      <InputCust
        title="Repeat New Password"
        placeholder="Repeat Your New Password.."
        name="repeatNewPassword"
        setAllValues={(val) => {
          const currentState = { code };
          const resolvedVal =
            typeof val === "function" ? val(currentState) : val;

          dispatch(setForgotResetValues(resolvedVal));
        }}
        error={!!resetPasswordError.repeatNewPassword}
        inputStyle={2}
        isPassword={true}
      />
      <p
        onClick={() => {
          router.push("/auth/login");
        }}
        className="self-end text-gray-400 hover:text-gray-100 duration-100 cursor-pointer"
      >
        Back to Login
      </p>
      <LoadingButton
        onClick={handleResetPasswordValidation}
        loading={resetPasswordLoader}
        loadingPosition="end"
        variant="contained"
        sx={{
          borderRadius: "10px",
          height: "50px",
          width: "full",
          fontSize: "20px",
          backgroundColor: "#4CAF50",
          "&:hover": {
            backgroundColor: "#45A049",
          },
        }}
      >
        Reset
      </LoadingButton>
    </div>
  );
}
