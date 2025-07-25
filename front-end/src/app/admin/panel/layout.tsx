"use client";

import React, { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminProviderContext } from "@/app/components/data/admin/adminContext";
import AdminNotificationsPupUp from "@/app/components/notifications/adminNotificationsPopUp";
import MenuIcon from "@mui/icons-material/Menu";

export default function layout({ children }: { children: React.ReactNode }) {
  const { adminData, handleAdminLogOut } = useContext(adminProviderContext)!;
  const pathname = usePathname();
  const router = useRouter();

  const [adminBurgerMenu, setAdminBurgerMenu] = useState(false);

  const [adminRouter, setAdminRouter] = useState([
    {
      id: 1,
      title: "About My Profile",
      url: "profile",
    },
    {
      id: 2,
      title: "Uploaded Domains",
      url: "domains",
    },
    {
      id: 3,
      title: "Admins",
      url: "admins",
    },
    {
      id: 4,
      title: "Users",
      url: "users",
    },
    {
      id: 5,
      title: "User Tokens",
      url: "user-tokens",
    },
    {
      id: 6,
      title: "Admin Tokens",
      url: "admin-tokens",
    },
    {
      id: 7,
      title: "Notifications",
      url: "notifications",
    },
  ]);

  const [activeRoute, setActiveRoute] = useState(pathname.split("/")[3]);

  useEffect(() => {
    setActiveRoute(pathname.split("/")[3]);
  }, [pathname]);

  return (
    <div className="flex flex-col px-[100px] max-lg:px-[50px] max-sm:px-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[20px]">
          <div
            onClick={() => {
              setAdminBurgerMenu((prev) => !prev);
            }}
            className={`bg-myPurple text-white w-[40px] h-[40px] cursor-pointer hidden max-xl:flex items-center justify-center rounded-[10px] duration-300 ${
              adminBurgerMenu && "rotate-[360deg]"
            }`}
          >
            <MenuIcon />
          </div>
          <div className="h-[200px] max-sm:h-[140px] flex flex-col justify-center">
            <h1 className="text-[25px]">Admin panel</h1>
            <p>{adminData && "email" in adminData ? adminData.email : ""}</p>
          </div>
        </div>
        <AdminNotificationsPupUp />
      </div>
      <div className="flex gap-[50px] relative">
        <div
          className={`w-[300px] max-sm:w-full shrink-0 flex flex-col gap-y-[10px] 
        max-xl:absolute max-xl:top-[-50px] max-sm:top-0 max-xl:z-[2] max-xl:p-[10px] max-xl:bg-white max-xl:shadow-xl max-xl:shadow-myPurple max-xl:rounded-[10px] max-xl:duration-300 ${
          adminBurgerMenu
            ? "max-xl:left-[-10px] max-sm:left-0"
            : "max-xl:left-[-450px] max-sm:left-[-800px]"
        }`}
        >
          {adminRouter.map((route) => (
            <div
              key={route.id}
              onClick={() => {
                setActiveRoute(route.url);
                router.push(`/admin/panel/${route.url}`);
              }}
              className={`h-[40px] flex items-center gap-[10px] cursor-pointer group duration-100 rounded-[5px] ${
                activeRoute == route.url ? "bg-gray-300 " : "hover:bg-gray-200 "
              }`}
            >
              <div
                className={`w-[5px] h-full rounded-[5px] duration-100 ${
                  activeRoute == route.url
                    ? "bg-myPurple mr-[10px]"
                    : "group-hover:bg-myPurple group-hover:mr-[5px]"
                }`}
              ></div>
              <h1>{route.title}</h1>
            </div>
          ))}
          <h1
            onClick={() => {
              handleAdminLogOut();
            }}
            className="duration-200 rounded-full px-[20px] h-[40px] flex items-center justify-center cursor-pointer mt-[30px]
               text-white shadow-myPurple bg-myPurple hover:bg-myLightPurple
            "
          >
            Logout
          </h1>
        </div>
        <div className="w-full shadow-2xl rounded-[20px] p-[20px] max-sm:p-[10px] mb-[20px] border-t-[1px] border-myLightPurple">
          {children}
        </div>
      </div>
    </div>
  );
}
