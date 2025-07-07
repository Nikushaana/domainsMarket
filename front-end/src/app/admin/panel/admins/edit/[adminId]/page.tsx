"use client";

import { axiosAdmin } from "@/app/components/data/axios";
import InputCust from "@/app/components/input/inputCust";
import { LoadingButton } from "@mui/lab";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function page({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = React.use(params);
  const [updateOneAdminValues, setUpdateOneAdminValues] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  const [updateOneAdminLoader, setUpdateOneAdminLoader] = useState(false);
  const [updateOneAdminError, setUpdateOneAdminError] = useState<
    Record<string, string>
  >({});

  //   get one admin

  const [oneAdmin, setOneAdmin] = useState<Admin>();

  useEffect(() => {
    axiosAdmin
      .get(`admin/admins/${adminId}`)
      .then(({ data }) => {
        setOneAdmin(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [adminId]);

  //   get one admin

  const updateOneAdminSchema = Yup.object().shape({
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

  const handleUpdateOneAdminValidation = () => {
    updateOneAdminSchema
      .validate(updateOneAdminValues, { abortEarly: false })
      .then(() => {
        setUpdateOneAdminError({});
        handleUpdateOneAdmin();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setUpdateOneAdminError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        }
      });
  };

  const handleUpdateOneAdmin = () => {
    setUpdateOneAdminLoader(true);

    axiosAdmin
      .put(`admin/admins/${adminId}`, {
        email: updateOneAdminValues.email,
        password: updateOneAdminValues.password,
      })
      .then((res) => {
        toast.success("Admin Updated successfully!", {
          autoClose: 3000,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setUpdateOneAdminLoader(false);
      });
  };
  return (
    <div className="flex flex-col gap-y-[20px] items-center justify-center ">
      <h1 className="text-[25px]">Update Admin N {adminId}</h1>
      <div className="w-[450px] max-sm:w-full bg-myPurple shadow-md shadow-myPurple rounded-[20px] px-[40px] max-sm:px-[15px] py-[30px] max-sm:py-[15px] flex flex-col gap-y-[15px]">
        <InputCust
          title="Email"
          placeholder="Enter Your Email.."
          name="email"
          firstValue={oneAdmin?.email}
          setAllValues={setUpdateOneAdminValues}
          error={!!updateOneAdminError.email}
          inputStyle={2}
        />
        <InputCust
          title="Password"
          placeholder="Enter Password.."
          name="password"
          setAllValues={setUpdateOneAdminValues}
          error={!!updateOneAdminError.password}
          inputStyle={2}
          isPassword={true}
        />
        <InputCust
          title="Repeat Password"
          placeholder="Repeat Your Password.."
          name="repeatPassword"
          setAllValues={setUpdateOneAdminValues}
          error={!!updateOneAdminError.repeatPassword}
          inputStyle={2}
          isPassword={true}
        />
        <LoadingButton
          onClick={handleUpdateOneAdminValidation}
          loading={updateOneAdminLoader}
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
          Update
        </LoadingButton>
      </div>
    </div>
  );
}
