"use client";

import React, { useContext } from "react";
import animationData from "../lottieAnimations/Animation - 1736604317686.json";
import Link from "next/link";
import Lottie from "lottie-react";
import { usePathname } from "next/navigation";
import { userProviderContext } from "../data/user/userContext";
import UserNotificationsPupUp from "../notifications/userNotificationsPopUp";

export default function Header() {
  const pathname = usePathname();
  const { userData } = useContext(userProviderContext);

  if (pathname.split("/")[1] !== "admin")
    return (
      <div className="flex items-center justify-between px-[100px] h-[80px] max-lg:px-[50px] max-sm:px-[16px] z-[10] sticky top-0 backdrop-blur-lg border-b-[1px] border-gray-700">
        <div className="w-[80px]">
          <Link href="/">
            <Lottie
              animationData={animationData}
              loop={true}
              height={80}
              width={80}
            />
          </Link>
        </div>

        <div className="flex items-center gap-[20px]">
          {"id" in userData && userData?.id ? (
            <>
              <Link
                href="/user/profile"
                className={`duration-200 rounded-full px-[20px] h-[40px] flex gap-[10px] items-center justify-center group ${
                  pathname.split("/")[1] == "user"
                    ? "text-white shadow-myPurple bg-myPurple"
                    : "text-myPurple shadow shadow-myPurple bg-white hover:text-white hover:shadow-white hover:bg-myPurple"
                }`}
              >
                {Array.isArray(userData.images) && userData.images?.length > 0 && (
                  <div className="w-[30px] h-[30px] group-hover:w-[50px] group-hover:h-[50px] duration-300 relative">
                    {userData.images?.map((img: string, index: number) => (
                      <div
                        key={img}
                        data-index={index}
                        className={`w-full h-full rounded-full overflow-hidden absolute duration-500 top-[50%] translate-y-[-50%] right-0 shadow-md shadow-myLightPurple border-[1px] border-myPurple group-hover:rotate-[-360deg]`}
                      >
                        <img
                          src={process.env.NEXT_PUBLIC_API_URL + "/" + img}
                          alt="user"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p>{userData?.email}</p>
              </Link>
              <UserNotificationsPupUp />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`duration-200 rounded-full px-[20px] h-[40px] flex items-center justify-center ${
                  pathname.split("/")[2] == "login"
                    ? "text-white shadow-myPurple bg-myPurple"
                    : "text-myPurple shadow shadow-myPurple bg-white hover:text-white hover:shadow-white hover:bg-myPurple"
                }`}
              >
                <p>Login</p>
              </Link>
              <Link
                href="/auth/register"
                className={`duration-200 rounded-full px-[20px] h-[40px] flex items-center justify-center ${
                  pathname.split("/")[2] == "register"
                    ? "text-white shadow-myPurple bg-myPurple"
                    : "text-myPurple shadow shadow-myPurple bg-white hover:text-white hover:shadow-white hover:bg-myPurple"
                }`}
              >
                <p>Register</p>
              </Link>
            </>
          )}
        </div>
      </div>
    );
}
