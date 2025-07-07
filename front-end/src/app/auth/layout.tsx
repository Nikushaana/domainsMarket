"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-y-[20px] max-sm:px-[16px] items-center justify-center h-[calc(100vh-81px)]">
      <h1 className="text-[25px]">
        {pathname.split("/")[2] == "login" ||
        pathname.split("/")[2] == "register"
          ? `Try ${pathname.split("/")[2]} as User`
          : pathname.split("/")[2] == "forgot-password"
          ? "Send Code to Email"
          : pathname.split("/")[2] == "reset-password" && "Reset Password"}
      </h1>
      <div className="w-[450px] max-sm:w-full bg-myPurple shadow-md shadow-myPurple rounded-[20px] px-[40px] max-sm:px-[15px] py-[30px] max-sm:py-[15px]">
        {children}
      </div>
    </div>
  );
}
