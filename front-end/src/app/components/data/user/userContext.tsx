"use client";

import { createContext, useEffect, useRef, useState } from "react";
import { axiosUser } from "../axios";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface UserProviderContextType {
  userData: User | {};
  setUserNewRender: React.Dispatch<React.SetStateAction<number>>;
  HandleUserToken: (token: string) => void;
  handleUserLogOut: () => void;
  userSocket: Socket | null;
}

const defaultUserContext: UserProviderContextType = {
  userData: {} as User, 
  setUserNewRender: () => {},
  HandleUserToken: () => {},
  handleUserLogOut: () => {},
  userSocket: null,
};

export const userProviderContext =
  createContext<UserProviderContextType>(defaultUserContext);

interface Props {
  children: React.ReactNode;
}

const UserContext = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [userSocket, setUserSocket] = useState<Socket | null>(null);

  const [userData, setUserData] = useState<User>({} as User);
  const [userNewRender, setUserNewRender] = useState(0);
  const [userToken, setUserToken] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("fullstack-user-token")
      : null
  );

  const HandleUserToken = (newUserToken: string) => {
    setUserToken(newUserToken);
    if (newUserToken) {
      localStorage.setItem("fullstack-user-token", newUserToken);
    } else {
      localStorage.removeItem("fullstack-user-token");
      setUserData({} as User);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname.split("/")[1] !== "admin" && userToken) {
        axiosUser
          .get("user")
          .then(({ data }) => {
            setUserData(data);
          })
          .catch((error) => {
            if (pathname.split("/")[1] == "user") {
              router.push("/auth/login");
            }
            if (
              error.response.data?.error == "Invalid token" ||
              error.response.data?.error == "Token is expired or logged out"
            ) {
              localStorage.removeItem("fullstack-user-token");
            }
          })
          .finally(() => {});
      } else {
        if (pathname.split("/")[1] == "user") {
          router.push("/");
        }
      }
    }
  }, [userToken, userNewRender]);

  useEffect(() => {
    if (!("id" in userData)) {
      setUserSocket(null);
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { role: `user`, userId: userData.id },
    });

    setUserSocket(socket);

    socket.on("user:domain_requested", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("user:domain_updated_by_admin", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("user:domain_deleted_by_admin", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("user:domain_updated_by_user", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });
    socket.on("user:domain_deleted_by_user", (data) => {
      toast.info(data.message, { autoClose: 3000 });
    });

    return () => {
      socket.disconnect();
      setUserSocket(null);
    };
  }, [userData]);

  const handleUserLogOut = () => {
    if (userToken) {
      axiosUser
        .post(`user/logout`)
        .then((res) => {
          HandleUserToken("");

          toast.success("User Logged out successfully!", {
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
    <userProviderContext.Provider
      value={{
        userData,
        setUserNewRender,
        HandleUserToken,
        handleUserLogOut,

        userSocket,
      }}
    >
      {children}
    </userProviderContext.Provider>
  );
};

export default UserContext;
