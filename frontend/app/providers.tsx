"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SessionProvider>
        {children}
        <Toaster position="bottom-center" />
      </SessionProvider>
    </div>
  );
}
