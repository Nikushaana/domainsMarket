"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { axiosAdmin } from "../data/axios";
import { useRouter } from "next/navigation";
import { adminProviderContext } from "../data/admin/adminContext";
import NotificationCard from "../cards/notificationCard";
import { useAppSelector } from "@/store/hooks";

export default function AdminNotificationsPupUp() {
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { adminSocket } = useContext(adminProviderContext)!;

  const render = useAppSelector(
    (state) => state.renderAdminNotifications.render
  );

  const [notificationsPopUpStatus, setNotificationsPopUpStatus] =
    useState(false);

  const [adminNotificationsData, setAdminNotificationsData] =
    useState<NotificationsResponse>({
      totalItems: 0,
      unseenCount: 0,
      data: [],
      currentPage: 0,
      limit: 0,
      totalPages: 0,
    });

  const fetchSomeAdminNotifications = async () => {
    axiosAdmin
      .get(`admin/notifications?page=1&limit=5`)
      .then(({ data }) => {
        setAdminNotificationsData(data);
      })
      .catch((error) => {})
      .finally(() => {});
  };

  useEffect(() => {
    if (!adminSocket) return;

    adminSocket.on("admin:domain_request", fetchSomeAdminNotifications);
    adminSocket.on(
      "admin:domain_updated_by_admin",
      fetchSomeAdminNotifications
    );
    adminSocket.on(
      "admin:domain_deleted_by_admin",
      fetchSomeAdminNotifications
    );
    adminSocket.on("admin:domain_updated_by_user", fetchSomeAdminNotifications);
    adminSocket.on("admin:domain_deleted_by_user", fetchSomeAdminNotifications);

    return () => {
      adminSocket.off("admin:domain_request", fetchSomeAdminNotifications);
      adminSocket.off(
        "admin:domain_updated_by_admin",
        fetchSomeAdminNotifications
      );
      adminSocket.off(
        "admin:domain_deleted_by_admin",
        fetchSomeAdminNotifications
      );
      adminSocket.off(
        "admin:domain_updated_by_user",
        fetchSomeAdminNotifications
      );
      adminSocket.off(
        "admin:domain_deleted_by_user",
        fetchSomeAdminNotifications
      );
    };
  }, [adminSocket]);

  useEffect(() => {
    fetchSomeAdminNotifications();
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
          if (adminNotificationsData?.totalItems > 0) {
            setNotificationsPopUpStatus((prev) => !prev);
          }
        }}
        className={`flex items-center justify-center cursor-pointer select-none rounded-[10px] shadow duration-200 ${
          notificationsPopUpStatus
            ? `bg-myPurple text-white shadow-myLightPurple w-[160px] h-[50px] mr-[190px]`
            : `shadow-myPurple w-[150px] h-[40px] ${
                adminNotificationsData.unseenCount > 0 && "bg-myLightPurple"
              }`
        }`}
      >
        <h1>Notifications </h1>
        <div className="relative">
          <NotificationsIcon style={{ fontSize: 24 }} />
          {adminNotificationsData.unseenCount > 0 && (
            <p className="text-[10px] absolute top-[0] right-[-10px]">
              ({adminNotificationsData.unseenCount})
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
          {adminNotificationsData?.data?.map((item: Notification, index: number) => (
            <NotificationCard
              key={item.created_at + item.id + index}
              item={item}
              lastItem={adminNotificationsData?.data?.length - 1 !== index}
            />
          ))}
        </div>
        {adminNotificationsData.totalItems > 5 && (
          <p
            onClick={() => {
              router.push("/admin/panel/notifications");
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
