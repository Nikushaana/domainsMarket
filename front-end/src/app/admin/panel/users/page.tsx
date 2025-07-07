"use client";

import Card2 from "@/app/components/cards/card2";
import { axiosAdmin } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function page() {
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [renderUsers, setRenderUsers] = useState(0);

  useEffect(() => {
    axiosAdmin
      .get("admin/users")
      .then(({ data }) => {
        setUsers(data.users);
        setOnlineUserIds(data.onlineUsers);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderUsers]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { role: "admin" },
    });

    socket.on("user:connected", (userId) => {
      setOnlineUserIds((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("user:disconnected", (userId) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Users</h1>
      {users.length > 0 && (
        <p className="text-[13px] text-gray-600">
          The number of Users is{" "}
          <span className="text-[16px] text-black">{users.length}</span> |{" "}
          Online{" "}
          <span className="text-[16px] text-black">{onlineUserIds.length}</span>
        </p>
      )}
      {users.length > 0 ? (
        users.map((item: User) => (
          <Card2
            key={item.id}
            item={item}
            role="users"
            setRender={setRenderUsers}
            online={onlineUserIds.includes(item.id)}
          />
        ))
      ) : (
        <p>Users aren't added yet..</p>
      )}
    </div>
  );
}
