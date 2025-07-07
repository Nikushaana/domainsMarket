import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header/header";
import { ToastContainer } from "react-toastify";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "domains full stack",
  description: "domains full stack project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-[100vh] bg-gray-100">
            <Header />
            {children}
            <ToastContainer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
