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
  const { email } = useAppSelector((state) => state.forgotReset);

  const [forgotPasswordLoader, setForgotPasswordLoader] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<
    Record<string, string>
  >({});

  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/,
        "Please enter valid Email"
      ),
  });

  const handleForgotPasswordValidation = () => {
    forgotPasswordSchema
      .validate({ email }, { abortEarly: false })
      .then(() => {
        setForgotPasswordError({});
        handleForgotPassword();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setForgotPasswordError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleForgotPassword = () => {
    setForgotPasswordLoader(true);

    axiosFront
      .post(`user/forgotPassword`, {
        email: email,
      })
      .then((res) => {
        router.push("/auth/reset-password");
        toast.success("Code Sent on your Email successfully!", {
          autoClose: 3000,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setForgotPasswordLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[15px]">
      <InputCust
        title="Email"
        placeholder="Enter Your Email.."
        name="email"
        setAllValues={(val) => {
          const currentState = { email };
          const resolvedVal =
            typeof val === "function" ? val(currentState) : val;

          dispatch(setForgotResetValues(resolvedVal));
        }}
        error={!!forgotPasswordError.email}
        inputStyle={2}
      />

      <LoadingButton
        onClick={handleForgotPasswordValidation}
        loading={forgotPasswordLoader}
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
        Send Code
      </LoadingButton>
    </div>
  );
}
