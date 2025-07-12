"use client";

import { axiosAdmin } from "@/app/components/data/axios";
import InputCust from "@/app/components/input/inputCust";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { LoadingButton } from "@mui/lab";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import * as Yup from "yup";

export default function page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { userId } = React.use(params);
  const [updateOneUserValues, setUpdateOneUserValues] =
    useState<UpdateOneUserValues>({
      email: "",
      password: "",
      repeatPassword: "",
      images: [],
      videos: [],
      newImages: [],
      newVideos: [],
    });

  const [updateOneUserLoader, setUpdateOneUserLoader] = useState(false);
  const [updateOneUserError, setUpdateOneUserError] = useState<
    Record<string, string>
  >({});
  const [updateOneUserRender, setUpdateOneUserRender] = useState<number>(1);

  //   get one User

  const [oneUser, setOneUser] = useState<AdminUser>();

  useEffect(() => {
    axiosAdmin
      .get(`admin/users/${userId}`)
      .then(({ data }) => {
        setOneUser(data);
        setUpdateOneUserValues((prev) => ({
          ...prev,
          images: data.images,
          videos: data.videos,
        }));
      })
      .catch((error) => {})
      .finally(() => {});
  }, [userId, updateOneUserRender]);

  //   get one User

  const updateOneUserSchema = Yup.object().shape({
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

  const handleUpdateOneUserValidation = () => {
    updateOneUserSchema
      .validate(updateOneUserValues, { abortEarly: false })
      .then(() => {
        setUpdateOneUserError({});
        handleUpdateOneUser();
      })
      .catch((err) => {
        if (err instanceof Yup.ValidationError) {
          const newErrors: Record<string, string> = {};
          err.inner?.forEach((error) => {
            if (error.path) {
              newErrors[error.path] = error.message;
            }
          });
          setUpdateOneUserError(newErrors);

          Object.values(newErrors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
      });
  };

  const handleUpdateOneUser = () => {
    setUpdateOneUserLoader(true);

    const formData = new FormData();
    formData.append("email", updateOneUserValues.email);
    formData.append("password", updateOneUserValues.password);
    formData.append(
      "deletedImages",
      JSON.stringify(
        (oneUser?.images || []).filter(
          (prevImage: string) => !updateOneUserValues.images.includes(prevImage)
        )
      )
    );
    formData.append(
      "deletedVideos",
      JSON.stringify(
        (oneUser?.videos || []).filter(
          (prevVideo: string) => !updateOneUserValues.videos.includes(prevVideo)
        )
      )
    );
    if (updateOneUserValues.newImages) {
      updateOneUserValues.newImages?.forEach((image: File) => {
        formData.append("images", image);
      });
    }
    if (updateOneUserValues.newVideos) {
      updateOneUserValues.newVideos?.forEach((video: File) => {
        formData.append("videos", video);
      });
    }

    axiosAdmin
      .put(`admin/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setUpdateOneUserRender((prev) => prev + 1);
        toast.success("User Updated successfully!", {
          autoClose: 3000,
        });
        setUpdateOneUserValues((prev) => ({
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
        setUpdateOneUserLoader(false);
      });
  };

  return (
    <div className="flex flex-col gap-y-[20px] items-center justify-center ">
      <h1 className="text-[25px]">Update User N {userId}</h1>
      <div className="flex flex-wrap justify-center gap-[10px]">
        {updateOneUserValues.images?.map((img) => (
          <div
            key={img}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateOneUserValues((prev) => ({
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
        {updateOneUserValues.newImages?.map((img1) => (
          <div
            key={img1.name}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateOneUserValues((prev) => ({
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

        <div className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] bg-gray-300 text-myPurple relative flex items-center justify-center overflow-hidden">
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
                setUpdateOneUserValues((prev) => ({
                  ...prev,
                  newImages: fileArray,
                }));
              }
            }}
          />
          <AddPhotoAlternateIcon style={{ fontSize: 35 }} />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-[10px]">
        {updateOneUserValues.videos?.map((vid) => (
          <div
            key={vid}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateOneUserValues((prev) => ({
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
        {updateOneUserValues.newVideos?.map((vid1) => (
          <div
            key={vid1.name}
            className="w-[200px] max-sm:w-[calc(50%-5px)] h-[130px] rounded-[5px] relative overflow-hidden"
          >
            <h1
              onClick={() => {
                setUpdateOneUserValues((prev) => ({
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
                setUpdateOneUserValues((prev) => ({
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
          name="email"
          firstValue={oneUser?.email}
          setAllValues={setUpdateOneUserValues}
          error={!!updateOneUserError.email}
          inputStyle={2}
        />
        <InputCust
          title="Password"
          placeholder="Enter Password.."
          name="password"
          setAllValues={setUpdateOneUserValues}
          error={!!updateOneUserError.password}
          inputStyle={2}
          isPassword={true}
        />
        <InputCust
          title="Repeat Password"
          placeholder="Repeat Your Password.."
          name="repeatPassword"
          setAllValues={setUpdateOneUserValues}
          error={!!updateOneUserError.repeatPassword}
          inputStyle={2}
          isPassword={true}
        />
        <LoadingButton
          onClick={handleUpdateOneUserValidation}
          loading={updateOneUserLoader}
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
