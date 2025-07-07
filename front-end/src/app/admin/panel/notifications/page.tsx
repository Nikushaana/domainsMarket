"use client";

import { axiosAdmin } from "@/app/components/data/axios";
import React, { useContext, useEffect, useState } from "react";
import { adminProviderContext } from "@/app/components/data/admin/adminContext";
import NotificationCard from "@/app/components/cards/notificationCard";
import CustPagination from "@/app/components/pagination/custPagination";
import { toast } from "react-toastify";
import { nextStepAdmin } from "@/store/slices/renderAdminNotificationsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function page() {
  const { adminSocket } = useContext(adminProviderContext)!;

  const dispatch = useAppDispatch();
  const render = useAppSelector(
    (state) => state.renderAdminNotifications.render
  );

  const [adminNotifications, setAdminNotifications] =
    useState<NotificationsResponse>({
      currentPage: 1,
      data: [],
      limit: 9,
      totalItems: 0,
      totalPages: 0,
      unseenCount: 0,
    });

  const fetchAdminNotifications = async () => {
    axiosAdmin
      .get(
        `admin/notifications?page=${
          adminNotifications?.currentPage || 1
        }&limit=9`
      )
      .then(({ data }) => {
        setAdminNotifications(data);
      })
      .catch((error) => {})
      .finally(() => {});
  };

  useEffect(() => {
    if (!adminSocket) return;

    adminSocket.on("admin:domain_request", fetchAdminNotifications);
    adminSocket.on("admin:domain_updated_by_admin", fetchAdminNotifications);
    adminSocket.on("admin:domain_deleted_by_admin", fetchAdminNotifications);
    adminSocket.on("admin:domain_updated_by_user", fetchAdminNotifications);
    adminSocket.on("admin:domain_deleted_by_user", fetchAdminNotifications);

    return () => {
      adminSocket.off("admin:domain_request", fetchAdminNotifications);
      adminSocket.off("admin:domain_updated_by_admin", fetchAdminNotifications);
      adminSocket.off("admin:domain_deleted_by_admin", fetchAdminNotifications);
      adminSocket.on("admin:domain_updated_by_user", fetchAdminNotifications);
      adminSocket.on("admin:domain_deleted_by_user", fetchAdminNotifications);
    };
  }, [adminSocket]);

  useEffect(() => {
    fetchAdminNotifications();
  }, [adminNotifications?.currentPage, render]);

  const handleAdminClearNotifications = () => {
    axiosAdmin
      .delete(`admin/notifications`)
      .then((res) => {
        toast.success("Notifications cleared successfully!", {
          autoClose: 3000,
        });
        dispatch(nextStepAdmin());
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
      {adminNotifications?.totalItems > 0 && (
        <div className="flex justify-between max-sm:flex-col items-center gap-[10px]">
          <div className="flex items-center shrink-0 gap-[8px]">
            <p className="text-[13px] text-gray-600 shrink-0">
              The number of Notifications is
            </p>
            <h1 className="text-[16px] text-black">
              {adminNotifications?.totalItems}
            </h1>
            <p className="text-[13px] text-gray-600 shrink-0">and unread is</p>
            <h1 className="text-[16px] text-black">
              {adminNotifications?.unseenCount}.
            </h1>
          </div>

          <h1
            onClick={() => {
              handleAdminClearNotifications();
            }}
            className="duration-200 rounded-full px-[20px] h-[40px] flex items-center justify-center cursor-pointer 
               text-white shadow-myPurple bg-myPurple hover:bg-myLightPurple
            "
          >
            Clear All Notifications
          </h1>
        </div>
      )}
      {adminNotifications?.totalItems > 0 ? (
        <>
          {adminNotifications?.totalItems > 9 && (
            <div className="self-end">
              <CustPagination
                totalPages={adminNotifications?.totalPages}
                currentPage={adminNotifications?.currentPage}
                setCurrentPage={setAdminNotifications}
              />
            </div>
          )}
          {adminNotifications?.data?.map((item: Notification, index: number) => (
            <NotificationCard
              key={item.created_at + item.id + index}
              item={item}
              eye={true}
            />
          ))}
          {adminNotifications?.totalItems > 9 && (
            <div className="self-end">
              <CustPagination
                totalPages={adminNotifications?.totalPages}
                currentPage={adminNotifications?.currentPage}
                setCurrentPage={setAdminNotifications}
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
