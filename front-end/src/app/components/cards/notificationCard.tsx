"use client";

import React, { useContext, useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";
import { axiosAdmin, axiosUser } from "../data/axios";
import { adminProviderContext } from "../data/admin/adminContext";
import { userProviderContext } from "../data/user/userContext";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { useAppDispatch } from "@/store/hooks";
import { nextStepAdmin } from "@/store/slices/renderAdminNotificationsSlice";
import { nextStepUser } from "@/store/slices/renderUserNotificationsSlice";
dayjs.extend(utc);
dayjs.extend(timezone);

interface NotificationCardProps {
  item: Notification;
  lastItem?: boolean;
  eye?: boolean;
}

export default function NotificationCard({ item, lastItem, eye }: NotificationCardProps) {
  const { adminData } = useContext(adminProviderContext);

  const { userData } = useContext(userProviderContext);

  const dispatch = useAppDispatch();

  const [loaderOneNotification, setLoaderOneNotification] = useState(false);

  const handleReadNotification = () => {
    if (item.read) return;

    setLoaderOneNotification(true);

    if ("id" in adminData && adminData.id) {
      axiosAdmin
        .put(`notifications/${item.id}/read?role=admin`)
        .then((res) => {
          dispatch(nextStepAdmin());
          toast.success("Notification Seen!", {
            autoClose: 3000,
          });
        })
        .catch((err) => {
          toast.error("Notification didn't Seen!", {
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoaderOneNotification(false);
        });
    } else if ("id" in userData && userData.id) {
      axiosUser
        .put(`notifications/${item.id}/read?role=user`)
        .then((res) => {
          dispatch(nextStepUser());
          toast.success("Notification Seen!", {
            autoClose: 3000,
          });
        })
        .catch((err) => {
          toast.error("Notification didn't Seen!", {
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoaderOneNotification(false);
        });
    }
  };
  return (
    <div
      onClick={() => {
        handleReadNotification();
      }}
      className={`flex flex-col gap-y-[2px] duration-100 ${
        loaderOneNotification && "opacity-[0.5] pointer-events-none"
      }`}
    >
      <div
        className={`p-[5px] rounded-[5px] flex gap-[10px] duration-100 ${
          item.read
            ? "bg-gray-200 pointer-events-none"
            : "bg-myPurple text-white cursor-pointer"
        }`}
      >
        {eye && (
          <div
            className={`text-[20px] w-[30px] flex items-center justify-center cursor-pointer ${
              item.read && "text-gray-600"
            }`}
          >
            {item.read ? <RemoveRedEyeIcon /> : <VisibilityOffIcon />}
          </div>
        )}
        <div
          className={`flex flex-col gap-y-[5px] ${
            eye ? "w-[calc(100%-40px)]" : "w-full"
          }`}
        >
          <p className="text-[14px]">{item.message}</p>
          <p className="text-[12px] flex justify-end">
            {dayjs(item.created_at).format("HH:mm:ss YYYY-MM-DD")}
          </p>
        </div>
      </div>
      {!eye && lastItem && <hr className="border-dashed border-gray-400" />}
    </div>
  );
}
