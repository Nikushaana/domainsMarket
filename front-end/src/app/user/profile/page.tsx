"use client";

import InputCust from "@/app/components/input/inputCust";
import React, { useContext, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { axiosUser } from "@/app/components/data/axios";
import { LoadingButton } from "@mui/lab";
import { userProviderContext } from "@/app/components/data/user/userContext";

export default function page() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { userData, setUserNewRender } = useContext(userProviderContext) as {
    userData: User;
    setUserNewRender: React.Dispatch<React.SetStateAction<number>>;
  };

  const [updateUserValues, setUpdateUserValues] = useState<{
    email: string;
    password: string;
    repeatPassword: string;
    images: string[];
    videos: string[];
    newImages: [] | File[];
    newVideos: [] | File[];
  }>({
    email: "",
    password: "",
    repeatPassword: "",
    images: [],
    videos: [],
    newImages: [],
    newVideos: [],
  });

  useEffect(() => {
    setUpdateUserValues((prev) => ({
      ...prev,
      images: userData?.images || [],
      videos: userData?.videos || [],
    }));
  }, [userData]);

  const [updateUserLoader, setUpdateUserLoader] = useState(false);
  const [updateUserError, setUpdateUserError] = useState<
    Record<string, string>
  >({});

  const updateUserSchema = Yup.object().shape({
    newImages: Yup.array().max(3, "Pick just 3 images max"),
    newVideos: Yup.array().max(2, "Pick just 2 videos max"),

    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/,
        "Please enter valid Email"
      ),

    password: Yup.string()
      .notRequired()
      .test(
        "min-if-not-empty",
        "Password is required",
        (value) => !value || value.length === 0 || value.length >= 6
      ),
    repeatPassword: Yup.string()
      .notRequired()
      .test(
        "min-if-not-empty",
        "Repeated Password is required",
        (value) => !value || value.length === 0 || value.length >= 6
      )
      .oneOf([Yup.ref("password")], "Passwords must be same"),
  });

  const handleUpdateUserValidation = () => {
    updateUserSchema
      .validate(updateUserValues, { abortEarly: false })
      .then(() => {
        setUpdateUserError({});
        handleUpdateUser();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setUpdateUserError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("An unexpected error occurred", { autoClose: 3000 });
        }
      });
  };

  const handleUpdateUser = () => {
    setUpdateUserLoader(true);

    const formData = new FormData();
    formData.append("email", updateUserValues.email);
    formData.append("password", updateUserValues.password);
    formData.append(
      "deletedImages",
      JSON.stringify(
        (userData.images || []).filter(
          (prevImage: string) => !updateUserValues.images.includes(prevImage)
        )
      )
    );
    formData.append(
      "deletedVideos",
      JSON.stringify(
        (userData.videos || []).filter(
          (prevVideo: string) => !updateUserValues.videos.includes(prevVideo)
        )
      )
    );
    if (updateUserValues.newImages) {
      updateUserValues.newImages?.forEach((image: File) => {
        formData.append("images", image);
      });
    }
    if (updateUserValues.newVideos) {
      updateUserValues.newVideos?.forEach((video: File) => {
        formData.append("videos", video);
      });
    }

    axiosUser
      .put(`user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        toast.success("User Updated successfully!", {
          autoClose: 3000,
        });
        setUserNewRender((prev: number) => prev + 1);
        setUpdateUserValues((prev) => ({
          ...prev,
          newImages: [],
          newVideos: [],
        }));
      })
      .catch((error) => {
        toast.error(error.response.data.message, {
          autoClose: 3000,
        });
      })
      .finally(() => {
        setUpdateUserLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[20px] items-center">
      <div className="flex flex-wrap justify-center gap-[10px] w-full">
        {updateUserValues.images?.map((img) => (
          <div
            key={img}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateUserValues((prev) => ({
                  ...prev,
                  images: prev.images.filter((image: string) => image !== img),
                }));
              }}
              className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
            >
              Delete Image
            </h1>
            <img
              src={img}
              alt="domain"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {updateUserValues.newImages?.map((img1) => (
          <div
            key={img1.name}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateUserValues((prev) => ({
                  ...prev,
                  newImages: prev.newImages.filter(
                    (image1: File) => image1 !== img1
                  ),
                }));
              }}
              className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
            >
              Delete New Image
            </h1>
            <img
              src={URL.createObjectURL(img1)}
              alt="domain"
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden">
          <div className="w-full h-full bg-gray-300 text-myPurple flex items-center justify-center">
            <h1
              onClick={() => imageInputRef.current?.click()}
              className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-green-400 hover:bg-green-500 text-white duration-100"
            >
              Add Image
            </h1>

            <input
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              ref={imageInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const fileArray = Array.from(e.target.files);
                  setUpdateUserValues((prev) => ({
                    ...prev,
                    newImages: fileArray,
                  }));
                }
              }}
            />
            <AddPhotoAlternateIcon style={{ fontSize: 35 }} />
          </div>
        </div>
      </div>
      <hr className="w-full border-gray-200" />
      <div className="flex flex-wrap justify-center gap-[10px] w-full">
        {updateUserValues.videos?.map((vid) => (
          <div
            key={vid}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateUserValues((prev) => ({
                  ...prev,
                  videos: prev.videos.filter((video: string) => video !== vid),
                }));
              }}
              className="absolute top-[10px] right-0 z-[1] cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
            >
              Delete Video
            </h1>
            <video
              controls
              src={vid}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {updateUserValues.newVideos?.map((vid1) => (
          <div
            key={vid1.name}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateUserValues((prev) => ({
                  ...prev,
                  newVideos: prev.newVideos.filter(
                    (video1: File) => video1 !== vid1
                  ),
                }));
              }}
              className="absolute top-[10px] right-0 z-1 cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
            >
              Delete New Video
            </h1>
            <video
              controls
              src={URL.createObjectURL(vid1)}
              className="w-full h-full object-cover "
            />
          </div>
        ))}

        <div className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden bg-gray-300 text-myPurple flex items-center justify-center">
          <h1
            onClick={() => videoInputRef.current?.click()}
            className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-green-400 hover:bg-green-500 text-white duration-100"
          >
            Add Video
          </h1>

          <input
            type="file"
            multiple
            accept="video/*"
            style={{ display: "none" }}
            ref={videoInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const fileArray = Array.from(e.target.files);
                setUpdateUserValues((prev) => ({
                  ...prev,
                  newVideos: fileArray,
                }));
              }
            }}
          />
          <VideoCallIcon style={{ fontSize: 35 }} />
        </div>
      </div>
      <div className="w-[450px] max-sm:w-full bg-myPurple shadow-md shadow-myPurple rounded-[20px] px-[40px] max-sm:px-[15px] py-[30px] max-sm:py-[15px] flex flex-col gap-y-[15px]">
        <InputCust
          title="Email"
          placeholder="Enter Your Email.."
          firstValue={userData?.email}
          name="email"
          setAllValues={setUpdateUserValues}
          error={!!updateUserError.email}
          inputStyle={2}
        />
        <InputCust
          title="Password"
          placeholder="Enter Password.."
          name="password"
          setAllValues={setUpdateUserValues}
          error={!!updateUserError.password}
          inputStyle={2}
          isPassword={true}
        />
        <InputCust
          title="Repeat Password"
          placeholder="Repeat Your Password.."
          name="repeatPassword"
          setAllValues={setUpdateUserValues}
          error={!!updateUserError.repeatPassword}
          inputStyle={2}
          isPassword={true}
        />
        <LoadingButton
          onClick={handleUpdateUserValidation}
          loading={updateUserLoader}
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
