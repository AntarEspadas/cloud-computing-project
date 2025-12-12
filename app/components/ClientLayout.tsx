"use client";

import { AuthProvider } from "../lib/auth-context";
import Header from "./Header";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
