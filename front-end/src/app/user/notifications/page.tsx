"use client";

import { axiosAdmin, axiosUser } from "@/app/components/data/axios";
import React, { useContext, useEffect, useState } from "react";
import { adminProviderContext } from "@/app/components/data/admin/adminContext";
import NotificationCard from "@/app/components/cards/notificationCard";
import CustPagination from "@/app/components/pagination/custPagination";
import { userProviderContext } from "@/app/components/data/user/userContext";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { nextStepUser } from "@/store/slices/renderUserNotificationsSlice";

export default function page() {
  const { userSocket } = useContext(userProviderContext)!;

  const dispatch = useAppDispatch();
  const render = useAppSelector(
    (state) => state.renderUserNotifications.render
  );

  const [userNotifications, setUserNotifications] =
    useState<NotificationsResponse>({
      currentPage: 1,
      data: [],
      limit: 0,
      totalItems: 0,
      totalPages: 1,
      unseenCount: 0,
    });

  const fetchAdminNotifications = async () => {
    axiosUser
      .get(
        `user/notifications?page=${userNotifications.currentPage || 1}&limit=9`
      )
      .then(({ data }) => {
        setUserNotifications(data);
      })
      .catch((error) => {})
      .finally(() => {});
  };

  useEffect(() => {
    if (!userSocket) return;

    userSocket.on("user:domain_requested", fetchAdminNotifications);
    userSocket.on("user:domain_updated_by_admin", fetchAdminNotifications);
    userSocket.on("user:domain_deleted_by_admin", fetchAdminNotifications);
    userSocket.on("user:domain_updated_by_user", fetchAdminNotifications);
    userSocket.on("user:domain_deleted_by_user", fetchAdminNotifications);

    return () => {
      userSocket.off("user:domain_requested", fetchAdminNotifications);
      userSocket.off("user:domain_updated_by_admin  ", fetchAdminNotifications);
      userSocket.off("user:domain_deleted_by_admin  ", fetchAdminNotifications);
      userSocket.on("user:domain_updated_by_user", fetchAdminNotifications);
      userSocket.on("user:domain_deleted_by_user", fetchAdminNotifications);
    };
  }, [userSocket]);

  useEffect(() => {
    fetchAdminNotifications();
  }, [userNotifications.currentPage, render]);

  const handleUserClearNotifications = () => {
    axiosUser
      .delete(`user/notifications`)
      .then((res) => {
        toast.success("Notifications cleared successfully!", {
          autoClose: 3000,
        });
        dispatch(nextStepUser());
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.", {
          autoClose: 3000,
        });
      })
      .finally(() => {});
  };

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Notifications</h1>
      {userNotifications.totalItems > 0 && (
        <div className="flex justify-between max-sm:flex-col items-center gap-[10px]">
          <div className="flex items-center shrink-0 gap-[8px]">
            <p className="text-[13px] text-gray-600 shrink-0">
              The number of Notifications is
            </p>
            <h1 className="text-[16px] text-black ">
              {userNotifications.totalItems}
            </h1>
            <p className="text-[13px] text-gray-600 shrink-0">and unread is</p>
            <h1 className="text-[16px] text-black">
              {userNotifications.unseenCount}.
            </h1>
          </div>
          <h1
            onClick={() => {
              handleUserClearNotifications();
            }}
            className="duration-200 rounded-full px-[20px] h-[40px] flex items-center justify-center cursor-pointer
               text-white shadow-myPurple bg-myPurple hover:bg-myLightPurple
            "
          >
            Clear All Notifications
          </h1>
        </div>
      )}
      {userNotifications.totalItems > 0 ? (
        <>
          {userNotifications.totalItems > 9 && (
            <div className="self-end">
              <CustPagination
                totalPages={userNotifications.totalPages}
                currentPage={userNotifications.currentPage}
                setCurrentPage={setUserNotifications}
              />
            </div>
          )}

          {userNotifications?.data?.map((item: Notification, index: number) => (
            <NotificationCard
              key={item.created_at + item.id + index}
              item={item}
              eye={true}
            />
          ))}

          {userNotifications.totalItems > 9 && (
            <div className="self-end">
              <CustPagination
                totalPages={userNotifications.totalPages}
                currentPage={userNotifications.currentPage}
                setCurrentPage={setUserNotifications}
              />
            </div>
          )}
        </>
      ) : (
        <p>There is no Notification yet..</p>
      )}
    </div>
  );
}
