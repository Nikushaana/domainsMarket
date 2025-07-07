"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { axiosAdmin, axiosUser } from "../data/axios";
import { usePathname, useRouter } from "next/navigation";
import { adminProviderContext } from "../data/admin/adminContext";
import NotificationCard from "../cards/notificationCard";
import { userProviderContext } from "../data/user/userContext";
import { useAppSelector } from "@/store/hooks";

export default function UserNotificationsPupUp() {
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { userSocket } = useContext(userProviderContext)!;

  const render = useAppSelector(
    (state) => state.renderUserNotifications.render
  );

  const [notificationsPopUpStatus, setNotificationsPopUpStatus] =
    useState(false);

  const [userNotificationsData, setUserNotificationsData] =
    useState<NotificationsResponse>({
      totalItems: 0,
      unseenCount: 0,
      data: [],
      currentPage: 0,
      limit: 0,
      totalPages: 0,
    });

  const fetchSomeUserNotifications = async () => {
    axiosUser
      .get(`user/notifications?page=1&limit=5`)
      .then(({ data }) => {
        setUserNotificationsData(data);
      })
      .catch((error) => {})
      .finally(() => {});
  };

  useEffect(() => {
    if (!userSocket) return;

    userSocket.on("user:domain_requested", fetchSomeUserNotifications);
    userSocket.on("user:domain_updated_by_admin", fetchSomeUserNotifications);
    userSocket.on("user:domain_deleted_by_admin", fetchSomeUserNotifications);
    userSocket.on("user:domain_updated_by_user", fetchSomeUserNotifications);
    userSocket.on("user:domain_deleted_by_user", fetchSomeUserNotifications);

    return () => {
      userSocket.off("user:domain_requested", fetchSomeUserNotifications);
      userSocket.off(
        "user:domain_updated_by_admin",
        fetchSomeUserNotifications
      );
      userSocket.off(
        "user:domain_deleted_by_admin",
        fetchSomeUserNotifications
      );
      userSocket.off("user:domain_updated_by_user", fetchSomeUserNotifications);
      userSocket.off("user:domain_deleted_by_user", fetchSomeUserNotifications);
    };
  }, [userSocket]);

  useEffect(() => {
    fetchSomeUserNotifications();
  }, [render]);

  //   click outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationsRef.current &&
      !(notificationsRef.current as HTMLDivElement).contains(
        event.target as Node
      )
    ) {
      setNotificationsPopUpStatus(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={notificationsRef} className="relative max-sm:hidden">
      <div
        onClick={() => {
          if (userNotificationsData.totalItems > 0) {
            setNotificationsPopUpStatus((prev) => !prev);
          }
        }}
        className={`duration-200 rounded-full px-[20px] h-[40px] flex gap-[10px] items-center justify-center group cursor-pointer ${
          pathname.split("/")[1] == "user"
            ? "text-white shadow-myPurple bg-myPurple"
            : "text-myPurple shadow shadow-myPurple bg-white hover:text-white hover:shadow-white hover:bg-myPurple"
        }`}
      >
        <div className="relative">
          <NotificationsIcon style={{ fontSize: 24 }} />
          {userNotificationsData.unseenCount > 0 && (
            <p className="text-[10px] absolute top-[0] right-[-10px]">
              ({userNotificationsData.unseenCount})
            </p>
          )}
        </div>
      </div>

      <div
        className={`absolute z-[2] bg-white shadow-xl flex flex-col gap-y-[15px] justify-between shadow-myPurple rounded-[10px] top-[60px] right-0 duration-300 
          w-[350px] p-[10px]
         ${notificationsPopUpStatus ? "" : "opacity-0 pointer-events-none"}`}
      >
        <div className={`h-[calc(100%-35px)] flex flex-col gap-y-[2px]`}>
          {userNotificationsData?.data?.map((item: Notification, index: number) => (
            <NotificationCard
              key={item.created_at + item.id + index}
              item={item}
              lastItem={userNotificationsData?.data?.length - 1 !== index}
            />
          ))}
        </div>
        {userNotificationsData.totalItems > 5 && (
          <p
            onClick={() => {
              router.push("/user/notifications");
              setNotificationsPopUpStatus((prev) => !prev);
            }}
            className="text-[14px] h-[20px] cursor-pointer underline flex self-center items-center"
          >
            Show More
          </p>
        )}
      </div>
    </div>
  );
}
