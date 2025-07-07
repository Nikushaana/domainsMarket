"use client";

import { IconButton } from "@mui/material";
import React, { useContext, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { axiosAdmin, axiosUser } from "../data/axios";
import { adminProviderContext } from "../data/admin/adminContext";

interface BaseToken {
  id: number;
  token: string;
  created_at?: string;
}

interface UserToken extends BaseToken {
  user_id: number;
}

interface AdminToken extends BaseToken {
  admin_id: number;
}

interface Card3Props {
  item: UserToken | AdminToken;
  role: "userTokens" | "adminTokens";
  setRender: React.Dispatch<React.SetStateAction<number>>;
}

export default function Card3({ item, role, setRender }: Card3Props) {
  const { adminData } = useContext(adminProviderContext);
  const [oneDomainLoader, setOneDomainLoader] = useState(false);

  const handleRemove = () => {
    if ("id" in adminData && adminData.id) {
      setOneDomainLoader(true);
      role == "userTokens"
        ? axiosAdmin
            .delete(`admin/userTokens/${item.id}`)
            .then((res) => {
              setRender((prev: number) => prev + 1);
              toast.success("User Token removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneDomainLoader(false);
              toast.error("User Token doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {})
        : role == "adminTokens" &&
          axiosAdmin
            .delete(`admin/adminTokens/${item.id}`)
            .then((res) => {
              setRender((prev: number) => prev + 1);
              toast.success("Admin Token removed successfully!", {
                autoClose: 3000,
              });
            })
            .catch((error) => {
              setOneDomainLoader(false);
              toast.error("Admin Token doesn't removed!", {
                autoClose: 3000,
              });
            })
            .finally(() => {});
    }
  };

  return (
    <div
      className={`w-full overflow-hidden p-[15px] rounded-[14px] flex items-center justify-between gap-[10px] shadow-md hover:shadow-lg duration-100 bg-white ${
        oneDomainLoader && "opacity-[0.7] pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-y-[10px]">
        <div className="flex items-center gap-[20px]">
          <p className="">#{item.id}</p>

          <h1 className="break-words overflow-hidden w-[300px]">
            {item.token}
          </h1>
        </div>

        <div>
          <p className="text-[12px]">
            {role == "userTokens" ? "User" : "Admin"} ID:{" "}
            <span className="text-[14px]">
              {role == "userTokens" ? (item as UserToken).user_id : (item as AdminToken).admin_id}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center w-[40px]">
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
