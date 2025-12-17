"use client";

import { AuthProvider } from "../lib/auth-context";
import Header from "./Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
