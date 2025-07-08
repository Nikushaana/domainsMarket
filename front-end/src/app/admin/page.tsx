"use client";

import { LoadingButton } from "@mui/lab";
import React, { useContext, useState } from "react";
import InputCust from "../components/input/inputCust";
import { toast } from "react-toastify";
import { axiosFront } from "../components/data/axios";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { adminProviderContext } from "../components/data/admin/adminContext";

export default function page() {
  const router = useRouter();

  const { HandleAdminToken } = useContext(adminProviderContext)!;

  const [adminLoginValues, setAdminLoginValues] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [adminLoginLoader, setAdminLoginLoader] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<
    Record<string, string>
  >({});

  const adminLoginSchema = Yup.object().shape({
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

  const handleAdminLoginValidation = () => {
    adminLoginSchema
      .validate(adminLoginValues, { abortEarly: false })
      .then(() => {
        setAdminLoginError({});
        handleAdminLogin();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setAdminLoginError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("An unexpected error occurred", { autoClose: 3000 });
        }
      });
  };

  const handleAdminLogin = () => {
    setAdminLoginLoader(true);

    axiosFront
      .post(`admin/login`, {
        email: adminLoginValues.email,
        password: adminLoginValues.password,
      })
      .then((res) => {
        HandleAdminToken(res.data.admin_token);

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
        setAdminLoginLoader(false);
      });
  };
  return (
    <div className="flex flex-col gap-y-[20px] max-sm:px-[16px] items-center justify-center h-[calc(100vh-81px)]">
      <h1 className="text-[25px]">Login as Admin</h1>
      <div className="w-[450px] max-sm:w-full bg-myPurple shadow-md shadow-myPurple rounded-[20px] px-[40px] max-sm:px-[15px] py-[30px] max-sm:py-[15px] flex flex-col gap-y-[15px]">
        <InputCust
          title="Email"
          placeholder="Enter Your Email.."
          name="email"
          setAllValues={setAdminLoginValues}
          error={!!adminLoginError.email}
          inputStyle={2}
        />
        <InputCust
          title="Password"
          placeholder="Enter Password.."
          name="password"
          setAllValues={setAdminLoginValues}
          error={!!adminLoginError.password}
          inputStyle={2}
          isPassword={true}
        />
        <InputCust
          title="Repeat Password"
          placeholder="Repeat Your Password.."
          name="repeatPassword"
          setAllValues={setAdminLoginValues}
          error={!!adminLoginError.repeatPassword}
          inputStyle={2}
          isPassword={true}
        />
        <LoadingButton
          onClick={handleAdminLoginValidation}
          loading={adminLoginLoader}
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
          Admin Login
        </LoadingButton>
      </div>
    </div>
  );
}
