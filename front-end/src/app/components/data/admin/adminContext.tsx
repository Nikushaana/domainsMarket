"use client";

import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { axiosAdmin, axiosUser } from "../axios";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface AdminProviderContextType {
  adminData: Admin | {};
  setAdminNewRender: React.Dispatch<React.SetStateAction<number>>;
  HandleAdminToken: (token: string) => void;
  handleAdminLogOut: () => void;
  adminSocket: Socket | null;
}

const defaultContext: AdminProviderContextType = {
  adminData: {} as Admin,
  setAdminNewRender: () => {},
  HandleAdminToken: () => {},
  handleAdminLogOut: () => {},
  adminSocket: null,
};

export const adminProviderContext = createContext<AdminProviderContextType>(defaultContext);

interface Props {
  children: ReactNode;
}

const AdminContext = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [adminSocket, setAdminSocket] = useState<Socket | null>(null);

  const [adminData, setAdminData] = useState<Admin | {}>({});
  const [adminNewRender, setAdminNewRender] = useState(0);
  const [adminToken, setAdminToken] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("fullstack-admin-token")
      : null
  );

  const HandleAdminToken = (newAdminToken: string) => {
    setAdminToken(newAdminToken);
    if (newAdminToken) {
      localStorage.setItem("fullstack-admin-token", newAdminToken);
    } else {
      localStorage.removeItem("fullstack-admin-token");
      setAdminData({});
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname.split("/")[1] == "admin" && adminToken) {
        axiosAdmin
          .get("admin")
          .then(({ data }) => {
            setAdminData(data);
            if (pathname == "/admin") {
              router.push("/admin/panel/profile");
            }
          })
          .catch((error) => {
            if (pathname.split("/")[1] == "admin") {
              router.push("/admin");
            }
            if (error.response.data.error == "Invalid token") {
              localStorage.removeItem("fullstack-admin-token");
            }
          })
          .finally(() => {});
      } else {
        if (pathname.split("/")[1] == "admin") {
          router.push("/admin");
        }
      }
    }
  }, [adminToken, adminNewRender]);

  useEffect(() => {
    if (!("id" in adminData)) {
      setAdminSocket(null);
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { role: "admin" },
    });

    setAdminSocket(socket);

    socket.on("admin:domain_request", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("admin:domain_updated_by_admin", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("admin:domain_deleted_by_admin", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("admin:domain_updated_by_user", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("admin:domain_deleted_by_user", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });

    return () => {
      socket.disconnect();
      setAdminSocket(null);
    };
  }, [adminData]);

  const handleAdminLogOut = () => {
    if (adminToken) {
      axiosAdmin
        .post(`admin/logout`)
        .then((res) => {
          HandleAdminToken("");

          toast.success("Admin Logged out successfully!", {
            autoClose: 3000,
          });
        })
        .catch((error) => {
          toast.error("Something went wrong! Please try again.", {
            autoClose: 3000,
          });
        })
        .finally(() => {});
    }
  };

  return (
    <adminProviderContext.Provider
      value={{
        adminData,
        setAdminNewRender,
        HandleAdminToken,
        handleAdminLogOut,

        adminSocket,
      }}
    >
      {children}
    </adminProviderContext.Provider>
  );
};

export default AdminContext;
