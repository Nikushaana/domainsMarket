"use client";

import Card1 from "@/app/components/cards/card1";
import { axiosAdmin } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [adminDomains, setAdminDomains] = useState([]);
  const [renderAdminDomains, setRenderAdminDomains] = useState(0);
  const [adminDomainsStatus, setAdminDomainsStatus] = useState(1);

  useEffect(() => {
    axiosAdmin
      .get(`admin/domains?status=${adminDomainsStatus}`)
      .then(({ data }) => {
        setAdminDomains(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderAdminDomains, adminDomainsStatus]);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Added Domains</h1>
      <div className="flex items-center gap-[10px]">
        {[
          { id: 1, text: "Active" },
          { id: 0, text: "Waiting" },
        ].map((item) => (
          <h1
            key={item.id}
            onClick={() => {
              setAdminDomainsStatus(item.id);
            }}
            className={`shadow px-[15px] h-[30px] flex items-center cursor-pointer rounded-[10px] text-[14px] shadow-myLightPurple duration-100 ${
              adminDomainsStatus == item.id
                ? "bg-myPurple text-white"
                : "hover:bg-myLightPurple hover:text-white"
            }`}
          >
            {item.text}
          </h1>
        ))}
      </div>
      <p className="text-[13px] text-gray-600">
        The number of domains is{" "}
        <span className="text-[16px] text-black">{adminDomains.length}</span>
      </p>
      {adminDomains.length > 0 ? (
        adminDomains.map((item: Domain) => (
          <Card1
            key={item.id}
            item={item}
            role="admin"
            setRenderDomains={setRenderAdminDomains}
          />
        ))
      ) : (
        <p>You don't have any domains here yet..</p>
      )}
    </div>
  );
}
