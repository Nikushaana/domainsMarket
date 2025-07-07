"use client";

import Card1 from "@/app/components/cards/card1";
import { axiosUser } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [userDomains, setUserDomains] = useState([]);
  const [renderUserDomains, setRenderUserDomains] = useState(0);
  const [userDomainsStatus, setUserDomainsStatus] = useState(1);

  useEffect(() => {
    axiosUser
      .get(`user/domains?status=${userDomainsStatus}`)
      .then(({ data }) => {
        setUserDomains(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderUserDomains, userDomainsStatus]);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Your Added Domains</h1>
      <div className="flex items-center gap-[10px]">
        {[
          { id: 1, text: "Active" },
          { id: 0, text: "Waiting" },
        ].map((item) => (
          <h1
            key={item.id}
            onClick={() => {
              setUserDomainsStatus(item.id);
            }}
            className={`shadow px-[15px] h-[30px] flex items-center cursor-pointer rounded-[10px] text-[14px] shadow-myLightPurple duration-100 ${
              userDomainsStatus == item.id
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
        <span className="text-[16px] text-black">{userDomains.length}</span>
      </p>
      {userDomains.length > 0 ? (
        userDomains.map((item: Domain) => (
          <Card1
            key={item.id}
            item={item}
            role="user"
            setRenderDomains={setRenderUserDomains}
          />
        ))
      ) : (
        <p>You don't have any domains here yet..</p>
      )}
    </div>
  );
}
