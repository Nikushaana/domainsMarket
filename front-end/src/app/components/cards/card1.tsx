"use client";

import { IconButton } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { toast } from "react-toastify";
import InputCust from "../input/inputCust";
import * as Yup from "yup";
import { axiosAdmin, axiosUser } from "../data/axios";
import { userProviderContext } from "../data/user/userContext";
import { adminProviderContext } from "../data/admin/adminContext";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
dayjs.extend(utc);
dayjs.extend(timezone);

interface Card1Props {
  item: Domain;
  role?: "admin" | "user";
  setRenderDomains?: React.Dispatch<React.SetStateAction<number>>;
}

export default function Card1({ item, role, setRenderDomains }: Card1Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useContext(userProviderContext);
  const { adminData } = useContext(adminProviderContext);
  const [oneDomainLoader, setOneDomainLoader] = useState(false);

  const [domainValues, setDomainValues] = useState<{
    name: string;
    description: string;
    status: number;
    deleteImage: boolean;
    image: string | File;
    deleteVideo: boolean;
    video: string | File;
  }>({
    name: "",
    description: "",
    status: 0,
    deleteImage: false,
    image: "",
    deleteVideo: false,
    video: "",
  });

  useEffect(() => {
    setDomainValues((prev) => ({
      ...prev,
      status: item.status,
      image: item.image,
      video: item.video,
    }));
  }, [item]);

  const [domainError, setDomainError] = useState<Record<string, string>>({});

  const domainSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters"),
    description: Yup.string()
      .notRequired()
      .test(
        "min-if-not-empty",
        "Description must be at least 10 characters",
        (value) => !value || value.length === 0 || value.length >= 10
      ),
    status: Yup.number(),
  });

  const handleChange = () => {
    if (
      role && role == "user"
        ? "id" in userData && userData?.id
        : role == "admin" && "id" in adminData && adminData.id
    ) {
      setOneDomainLoader(true);
      setDomainError({});

      try {
        domainSchema.validateSync(domainValues, { abortEarly: false });

        const formData = new FormData();

        formData.append("name", domainValues.name);
        formData.append("description", domainValues.description);
        if (domainValues.image instanceof File) {
          formData.append("image", domainValues.image);
        }
        if (domainValues.video instanceof File) {
          formData.append("video", domainValues.video);
        }

        formData.append(
          "deleteImage",
          domainValues.deleteImage ? "true" : "false"
        );
        formData.append(
          "deleteVideo",
          domainValues.deleteVideo ? "true" : "false"
        );

        if (role == "user") {
          axiosUser
            .put(`user/domains/${item.id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              toast.success("Domain updated successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              toast.error("Domain doesn't updated!", {
                autoClose: 3000,
              });
            })
            .finally(() => {
              setOneDomainLoader(false);
            });
        } else if (role == "admin") {
          formData.append("status", domainValues.status.toString());

          axiosAdmin
            .put(`admin/domains/${item.id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              if (setRenderDomains)
                setRenderDomains((prev: number) => prev + 1);
              toast.success("Domain updated successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              toast.error("Domain doesn't updated!", {
                autoClose: 3000,
              });
            })
            .finally(() => {
              setOneDomainLoader(false);
            });
        }
      } catch (validationError) {
        if (validationError instanceof Yup.ValidationError) {
          const errors: Record<string, string> = {};
          if (validationError.inner && validationError.inner.length > 0) {
            validationError.inner.forEach((err) => {
              if (err.path) {
                errors[err.path] = err.message;
              }
            });
          } else if (validationError.path) {
            errors[validationError.path] = validationError.message;
          }

          setDomainError(errors);

          Object.values(errors).forEach((msg) => {
            toast.error(msg, { autoClose: 3000 });
          });
        } else {
          toast.error("Unexpected validation error", { autoClose: 3000 });
        }
        setOneDomainLoader(false);
      }
    }
  };

  const handleRemove = () => {
    if (
      role && role == "user"
        ? "id" in userData && userData?.id
        : role == "admin" && "id" in adminData && adminData.id
    ) {
      setOneDomainLoader(true);
      role == "user"
        ? axiosUser
            .delete(`user/domains/${item.id}`)
            .then((res) => {
              if (setRenderDomains)
                setRenderDomains((prev: number) => prev + 1);
              toast.success("Domain removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneDomainLoader(false);
              toast.error("Domain doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {})
        : role == "admin" &&
          axiosAdmin
            .delete(`admin/domains/${item.id}`)
            .then((res) => {
              if (setRenderDomains)
                setRenderDomains((prev: number) => prev + 1);
              toast.success("Domain removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneDomainLoader(false);
              toast.error("Domain doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {});
    }
  };

  return (
    <div
      className={`w-full p-[15px] rounded-[14px] flex max-sm:flex-col items-center justify-between gap-[10px] shadow-md hover:shadow-lg duration-100 bg-white ${
        oneDomainLoader && "opacity-[0.7] pointer-events-none"
      }`}
    >
      <div className="flex max-sm:flex-col gap-[20px] w-full">
        <div className="flex gap-[20px] max-sm:w-full">
          <div className="w-[150px] max-sm:w-[calc(50%-10px)] h-[130px] shrink-0 rounded-[5px] relative overflow-hidden">
            {domainValues.image ? (
              <>
                {role && (
                  <h1
                    onClick={() => {
                      setDomainValues((prev) => ({
                        ...prev,
                        image: "",
                        deleteImage: true,
                      }));
                    }}
                    className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
                  >
                    Delete Image
                  </h1>
                )}

                <img
                  src={
                    typeof domainValues.image === "string"
                      ? domainValues.image
                      : URL.createObjectURL(domainValues.image)
                  }
                  alt="domain"
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 text-myPurple flex items-center justify-center">
                {role && (
                  <>
                    <h1
                      onClick={() => imageInputRef.current?.click()}
                      className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-green-400 hover:bg-green-500 text-white duration-100"
                    >
                      Add Image
                    </h1>

                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={imageInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setDomainValues((prev) => ({
                            ...prev,
                            image: e.target.files![0],
                            deleteImage: false,
                          }));
                        }
                      }}
                    />
                  </>
                )}
                {role ? (
                  <AddPhotoAlternateIcon style={{ fontSize: 35 }} />
                ) : (
                  <ImageIcon style={{ fontSize: 35 }} />
                )}
              </div>
            )}
          </div>

          <div
            className={`w-[150px] max-sm:w-[calc(50%-10px)] h-[130px] shrink-0 rounded-[5px] relative overflow-hidden`}
          >
            {domainValues.video ? (
              <>
                {role && (
                  <h1
                    onClick={() => {
                      setDomainValues((prev) => ({
                        ...prev,
                        video: "",
                        deleteVideo: true,
                      }));
                    }}
                    className="absolute z-1 bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-red-400 hover:bg-red-500 text-white duration-100"
                  >
                    Delete Video
                  </h1>
                )}

                <video
                  controls={role ? false : true}
                  src={
                    typeof domainValues.video === "string"
                      ? domainValues.video
                      : URL.createObjectURL(domainValues.video)
                  }
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 text-myPurple flex items-center justify-center">
                {role && (
                  <>
                    <h1
                      onClick={() => videoInputRef.current?.click()}
                      className="absolute bottom-[10px] right-0 cursor-pointer w-full h-[40px] flex items-center justify-center bg-green-400 hover:bg-green-500 text-white duration-100"
                    >
                      Add Video
                    </h1>

                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: "none" }}
                      ref={videoInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setDomainValues((prev) => ({
                            ...prev,
                            video: e.target.files![0],
                            deleteVideo: false,
                          }));
                        }
                      }}
                    />
                  </>
                )}
                {role ? (
                  <VideoCallIcon style={{ fontSize: 35 }} />
                ) : (
                  <VideocamIcon style={{ fontSize: 35 }} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-[10px]">
          <div className="flex items-center gap-[20px]">
            <p className="">#{item.id}</p>
            {role ? (
              <InputCust
                firstValue={item.name}
                name="name"
                setAllValues={setDomainValues}
                error={!!domainError.name}
                inputStyle={1}
              />
            ) : (
              <h1 className="">{item.name}</h1>
            )}
          </div>
          {role ? (
            <InputCust
              firstValue={item.description}
              name="description"
              setAllValues={setDomainValues}
              error={!!domainError.description}
              inputStyle={1}
            />
          ) : (
            item.description && (
              <p className="text-[15px]">{item.description}</p>
            )
          )}
          {role == "admin" && (
            <div className="flex items-center gap-[10px]">
              <p>Status:</p>
              <div className="flex items-center gap-[10px]">
                {[
                  { id: 1, text: "Active" },
                  { id: 0, text: "Waiting" },
                ].map((item) => (
                  <h1
                    key={item.id}
                    onClick={() => {
                      setDomainValues((prev) => ({
                        ...prev,
                        status: item.id,
                      }));
                    }}
                    className={`shadow px-[10px] h-[25px] flex items-center cursor-pointer rounded-[10px] text-[14px] shadow-myLightPurple duration-100 ${
                      domainValues.status == item.id
                        ? "bg-myPurple text-white"
                        : "hover:bg-myLightPurple hover:text-white"
                    }`}
                  >
                    {item.text}
                  </h1>
                ))}
              </div>
            </div>
          )}
          <hr className="border-gray-300" />

          <div>
            <p className="text-[12px]">
              Created:{" "}
              <span className="text-[14px]">
                {dayjs(item.created_at).format("HH:mm:ss YYYY-MM-DD")}
              </span>
            </p>
            <p className="text-[12px]">
              Updated:{" "}
              <span className="text-[14px]">
                {dayjs(item.updated_at).format("HH:mm:ss YYYY-MM-DD")}
              </span>
            </p>
            {role !== "user" && (
              <div className="flex items-center gap-[5px]">
                <p className="text-[12px]">
                  Added By:{" "}
                  <span className="text-[14px]">
                    {item.user ? `User ${item.user.email}` : "Guest"}
                  </span>
                </p>
                {item.user?.images?.map((img: string) => (
                  <div
                    key={img}
                    className={`w-[30px] h-[30px] shrink-0 rounded-full overflow-hidden`}
                  >
                    <img
                      src={img}
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {role && (
        <div className="flex items-center gap-[10px] shrink-0">
          <IconButton
            onClick={() => {
              handleChange();
            }}
          >
            <h1 className="text-[15px]">update</h1>
          </IconButton>
          <IconButton
            onClick={() => {
              handleRemove();
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
