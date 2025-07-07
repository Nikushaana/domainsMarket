"use client";

import { axiosFront } from "@/app/components/data/axios";
import { userProviderContext } from "@/app/components/data/user/userContext";
import InputCust from "@/app/components/input/inputCust";
import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function page() {
  const router = useRouter();

  const { HandleUserToken } = useContext(userProviderContext)!;

  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [loginLoader, setLoginLoader] = useState(false);
  const [loginError, setLoginError] = useState<Record<string, string>>({});

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/,
        "Please enter valid Email"
      ),
    password: Yup.string().required("Password is required").min(6),
    repeatPassword: Yup.string()
      .required("Repeated Password is required")
      .min(6)
      .oneOf([Yup.ref("password")], "Passwords must be same"),
  });

  const handleLoginValidation = () => {
    loginSchema
      .validate(loginValues, { abortEarly: false })
      .then(() => {
        setLoginError({});
        handleLogin();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setLoginError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleLogin = () => {
    setLoginLoader(true);

    axiosFront
      .post(`user/login`, {
        email: loginValues.email,
        password: loginValues.password,
      })
      .then((res) => {
        HandleUserToken(res.data.user_token);

        router.push("/");
        toast.success("You Logged in successfully!", {
          autoClose: 3000,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setLoginLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[15px]">
      <InputCust
        title="Email"
        placeholder="Enter Your Email.."
        name="email"
        setAllValues={setLoginValues}
        error={!!loginError.email}
        inputStyle={2}
      />
      <InputCust
        title="Password"
        placeholder="Enter Password.."
        name="password"
        setAllValues={setLoginValues}
        error={!!loginError.password}
        inputStyle={2}
        isPassword={true}
      />
      <InputCust
        title="Repeat Password"
        placeholder="Repeat Your Password.."
        name="repeatPassword"
        setAllValues={setLoginValues}
        error={!!loginError.repeatPassword}
        inputStyle={2}
        isPassword={true}
      />
      <p
        onClick={() => {
          router.push("/auth/forgot-password");
        }}
        className="self-end text-gray-400 hover:text-gray-100 duration-100 cursor-pointer"
      >
        Forgot password?
      </p>
      <LoadingButton
        onClick={handleLoginValidation}
        loading={loginLoader}
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
        Login
      </LoadingButton>
    </div>
  );
}
