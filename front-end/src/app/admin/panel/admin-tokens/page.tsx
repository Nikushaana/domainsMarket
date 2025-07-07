"use client";

import Card1 from "@/app/components/cards/card1";
import Card3 from "@/app/components/cards/card3";
import { axiosAdmin } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [adminTokens, setAdminTokens] = useState([]);
  const [renderAdminTokens, setRenderAdminTokens] = useState(0);

  useEffect(() => {
    axiosAdmin
      .get("admin/adminTokens")
      .then(({ data }) => {
        setAdminTokens(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderAdminTokens]);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Admin Tokens</h1>
      {adminTokens.length > 0 && (
        <p className="text-[13px] text-gray-600">
          The number of Admin Tokens is{" "}
          <span className="text-[16px] text-black">{adminTokens.length}</span>
        </p>
      )}
      {adminTokens.length > 0 ? (
        adminTokens.map((item: AdminToken) => (
          <Card3
            key={item.id}
            item={item}
            role="adminTokens"
            setRender={setRenderAdminTokens}
          />
        ))
      ) : (
        <p>There is no Admin Tokens yet..</p>
      )}
    </div>
  );
}
