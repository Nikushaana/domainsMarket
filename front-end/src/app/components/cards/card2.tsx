"use client";

import { IconButton } from "@mui/material";
import React, { useContext, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";
import { axiosAdmin } from "../data/axios";
import { adminProviderContext } from "../data/admin/adminContext";
import { useRouter } from "next/navigation";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
dayjs.extend(utc);
dayjs.extend(timezone);
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Card2Props = {
  item: User;
  role: "users" | "admins";
  setRender: React.Dispatch<React.SetStateAction<number>>;
  online?: boolean;
};

export default function Card2({ item, role, setRender, online }: Card2Props) {
  const router = useRouter();
  const { adminData } = useContext(adminProviderContext);
  const [oneAdminLoader, setOneAdminLoader] = useState(false);

  const handleRemove = () => {
    if ("id" in adminData && adminData.id) {
      setOneAdminLoader(true);

      role == "admins"
        ? axiosAdmin
            .delete(`admin/admins/${item.id}`)
            .then((res) => {
              setRender((prev: number) => prev + 1);
              toast.success("Admin removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneAdminLoader(false);
              toast.error("Admin doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {})
        : role == "users" &&
          axiosAdmin
            .delete(`admin/users/${item.id}`)
            .then((res) => {
              setRender((prev: number) => prev + 1);
              toast.success("User removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneAdminLoader(false);
              toast.error("User doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {});
    }
  };

  return (
    <div
      className={`w-full p-[15px] rounded-[14px] flex max-sm:flex-col items-center justify-between gap-[10px] shadow-md hover:shadow-lg duration-100 bg-white ${
        oneAdminLoader && "opacity-[0.7] pointer-events-none"
      }`}
    >
      <div className="w-full flex flex-col gap-y-[10px]">
        <div className="flex max-sm:flex-wrap items-center gap-[20px]">
          <p className="">#{item.id}</p>
          {role == "users" && (
            <div
              className={`w-[20px] h-[20px] shrink-0 rounded-full ${
                online ? "bg-[green]" : "bg-red-500"
              }`}
            ></div>
          )}
          <h1 className="">{item.email}</h1>

          <div className="flex gap-[5px]">
            {item.images &&
              item.images?.length > 0 &&
              item.images?.map((img: string) => (
                <div
                  key={img}
                  className="w-[40px] h-[40px] rounded-full overflow-hidden"
                >
                  <img
                    src={img}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

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
          {role == "users" && (
            <>
              {!online && (
                <p className="text-[12px]">
                  Last seen:{" "}
                  <span className="text-[14px]">
                    {dayjs(item.last_seen).fromNow()}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-[10px] shrink-0">
        <IconButton
          onClick={() => {
            router.push(`/admin/panel/${role}/edit/${item.id}`);
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            handleRemove();
          }}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
}
