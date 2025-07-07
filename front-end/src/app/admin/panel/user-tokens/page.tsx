"use client";

import Card1 from "@/app/components/cards/card1";
import Card3 from "@/app/components/cards/card3";
import { axiosAdmin } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [userTokens, setUserTokens] = useState([]);
  const [renderUserTokens, setRenderUserTokens] = useState(0);

  useEffect(() => {
    axiosAdmin
      .get("admin/userTokens")
      .then(({ data }) => {
        setUserTokens(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderUserTokens]);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">User Tokens</h1>
      {userTokens.length > 0 && (
        <p className="text-[13px] text-gray-600">
          The number of User Tokens is{" "}
          <span className="text-[16px] text-black">{userTokens.length}</span>
        </p>
      )}
      {userTokens.length > 0 ? (
        userTokens.map((item: UserToken) => (
          <Card3
            key={item.id}
            item={item}
            role="userTokens"
            setRender={setRenderUserTokens}
          />
        ))
      ) : (
        <p>There is no User Tokens yet..</p>
      )}
    </div>
  );
}
