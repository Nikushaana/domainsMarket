"use client";

import { Provider } from "react-redux";
import UserContext from "./components/data/user/userContext";
import AdminContext from "./components/data/admin/adminContext";
import { store } from "@/store/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <UserContext>
        <AdminContext>{children}</AdminContext>
      </UserContext>
    </Provider>
  );
}
