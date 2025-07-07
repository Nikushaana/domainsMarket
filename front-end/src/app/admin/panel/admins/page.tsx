"use client";

import Card2 from "@/app/components/cards/card2";
import { axiosAdmin } from "@/app/components/data/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [admins, setAdmins] = useState([]);
  const [renderAdmins, setRenderAdmins] = useState(0);

  useEffect(() => {
    axiosAdmin
      .get("admin/admins")
      .then(({ data }) => {
        setAdmins(data);
      })
      .catch((error) => {})
      .finally(() => {});
  }, [renderAdmins]);

  return (
    <div className="flex flex-col gap-y-[20px]">
      <h1 className="text-[25px]">Admins</h1>
      {admins.length > 0 && (
        <p className="text-[13px] text-gray-600">
          The number of admins is{" "}
          <span className="text-[16px] text-black">{admins.length}</span>
        </p>
      )}
      {admins.length > 0 ? (
        admins.map((item: Admin) => (
          <Card2
            key={item.id}
            item={item}
            role="admins"
            setRender={setRenderAdmins}
          />
        ))
      ) : (
        <p>Admins aren't added yet..</p>
      )}
    </div>
  );
}
