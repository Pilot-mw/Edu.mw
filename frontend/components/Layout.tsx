"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isManagementPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/manage");

  return (
    <div className="min-h-screen relative">
      <main>{children}</main>
    </div>
  );
}
