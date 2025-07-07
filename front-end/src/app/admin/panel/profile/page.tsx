"use client";

import InputCust from "@/app/components/input/inputCust";
import React, { useContext, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { adminProviderContext } from "@/app/components/data/admin/adminContext";
import { axiosAdmin } from "@/app/components/data/axios";

export default function page() {
  const { adminData, setAdminNewRender } = useContext(adminProviderContext)!;
  const [updateAdminValues, setUpdateAdminValues] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [updateAdminLoader, setUpdateAdminLoader] = useState(false);
  const [updateAdminError, setUpdateAdminError] = useState<
    Record<string, string>
  >({});

  const updateAdminSchema = Yup.object().shape({
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

  const handleUpdateAdminValidation = () => {
    updateAdminSchema
      .validate(updateAdminValues, { abortEarly: false })
      .then(() => {
        setUpdateAdminError({});
        handleUpdateAdmin();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setUpdateAdminError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleUpdateAdmin = () => {
    setUpdateAdminLoader(true);

    axiosAdmin
      .put(`admin`, {
        email: updateAdminValues.email,
        password: updateAdminValues.password,
      })
      .then((res) => {
        toast.success("Admin Updated successfully!", {
          autoClose: 3000,
        });
        setAdminNewRender((prev: number) => prev + 1);
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setUpdateAdminLoader(false);
      });
  };

  return (
    <div className="flex justify-center">
      <div className="w-[450px] max-sm:w-full bg-myPurple shadow-md shadow-myPurple rounded-[20px] px-[40px] max-sm:px-[15px] py-[30px] max-sm:py-[15px] flex flex-col gap-y-[15px]">
        <InputCust
          title="Email"
          placeholder="Enter Your Email.."
          firstValue={adminData && "email" in adminData ? adminData.email : ""}
          name="email"
          setAllValues={setUpdateAdminValues}
          error={!!updateAdminError.email}
          inputStyle={2}
        />
        <InputCust
          title="Password"
          placeholder="Enter Password.."
          name="password"
          setAllValues={setUpdateAdminValues}
          error={!!updateAdminError.password}
          inputStyle={2}
          isPassword={true}
        />
        <InputCust
          title="Repeat Password"
          placeholder="Repeat Your Password.."
          name="repeatPassword"
          setAllValues={setUpdateAdminValues}
          error={!!updateAdminError.repeatPassword}
          inputStyle={2}
          isPassword={true}
        />
        <LoadingButton
          onClick={handleUpdateAdminValidation}
          loading={updateAdminLoader}
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
          update
        </LoadingButton>
      </div>
    </div>
  );
}
