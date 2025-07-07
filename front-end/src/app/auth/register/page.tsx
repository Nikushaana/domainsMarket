"use client";

import { axiosFront } from "@/app/components/data/axios";
import InputCust from "@/app/components/input/inputCust";
import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function page() {
  const router = useRouter();

  const [registerValues, setRegisterValues] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [registerLoader, setRegisterLoader] = useState(false);
  const [registerError, setRegisterError] = useState<Record<string, string>>(
    {}
  );

  const registerSchema = Yup.object().shape({
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

  const handleRegisterValidation = () => {
    registerSchema
      .validate(registerValues, { abortEarly: false })
      .then(() => {
        setRegisterError({});
        handleRegister();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setRegisterError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleRegister = () => {
    setRegisterLoader(true);

    axiosFront
      .post(`user/register`, {
        email: registerValues.email,
        password: registerValues.password,
      })
      .then((res) => {
        router.push("/auth/login");
        toast.success("You Registered successfully!", {
          autoClose: 3000,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setRegisterLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[15px]">
      <InputCust
        title="Email"
        placeholder="Enter Your Email.."
        name="email"
        setAllValues={setRegisterValues}
        error={!!registerError.email}
        inputStyle={2}
      />
      <InputCust
        title="Password"
        placeholder="Enter Password.."
        name="password"
        setAllValues={setRegisterValues}
        error={!!registerError.password}
        inputStyle={2}
        isPassword={true}
      />
      <InputCust
        title="Repeat Password"
        placeholder="Repeat Your Password.."
        name="repeatPassword"
        setAllValues={setRegisterValues}
        error={!!registerError.repeatPassword}
        inputStyle={2}
        isPassword={true}
      />
      <LoadingButton
        onClick={handleRegisterValidation}
        loading={registerLoader}
        loadingPosition="end"
        variant="contained"
        sx={{
          marginTop: "25px",
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
        Register
      </LoadingButton>
    </div>
  );
}
