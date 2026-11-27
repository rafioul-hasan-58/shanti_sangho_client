"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/admin/MobileBottomNav";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { normalizeRole, hasDashboardAccess } from "@/lib/authRole";
import { BRAND_NAME_EN } from "@/lib/constants/site";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
}

export default function AdminLayoutClient({
  children,
  locale,
}: AdminLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const isBn = locale === "bn";
  const { user, logout } = useAuth();
  const { role } = useRole();
  const resolvedRole = normalizeRole(user?.role ?? role);
  const isAdmin = hasDashboardAccess(resolvedRole);
  const displayName = user?.name || (isBn ? "প্রশাসক" : "Admin");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Determine activeTab based on pathname
  const getActiveTab = (): string => {
    if (pathname.includes("/admin/finance")) return "admin_finance";
    if (pathname.includes("/admin/members")) return "admin_users";
    if (pathname.includes("/admin/profile")) return "profile";
    if (pathname.includes("/admin/committee")) return "leadership_committee";
    if (pathname.includes("/admin/pioneers")) return "leadership_pioneers";
    if (pathname.includes("/admin/admins")) return "leadership_admins";
    return "admin_finance";
  };

  const handleTabChange = (tab: string) => {
    setMobileSidebarOpen(false);
    if (tab === "admin_finance") {
      router.push(`/${locale}/admin/finance`);
    } else if (tab === "overview") {
      router.push(`/${locale}/dashboard`);
    } else if (tab === "profile") {
      router.push(`/${locale}/dashboard?tab=profile`);
    } else {
      router.push(`/${locale}/dashboard?tab=${tab}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f4ea] flex flex-col md:flex-row font-sans text-slate-800">
        {/* Unified Dashboard Sidebar for Desktop & Mobile Slide-Out Drawer */}
        <DashboardSidebar
          activeTab={getActiveTab()}
          setActiveTab={handleTabChange}
          locale={locale}
          user={user}
          isAdmin={Boolean(isAdmin)}
          displayName={displayName}
          pendingCount={0}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onLogout={logout}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col pb-24 md:pb-6 overflow-x-hidden">
          {/* Mobile Top Header matching Dashboard */}
          <header className="md:hidden sticky top-0 z-30 bg-[#006a4e] border-b border-white/20 px-4 py-2.5 flex items-center justify-between gap-4 shadow-md">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 select-none"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-2xl bg-[#e8f5ef] border border-[#c2e2d0] p-1.5 flex items-center justify-center shadow-xs">
                <Image
                  src="/logo.png"
                  alt={BRAND_NAME_EN}
                  fill
                  className="object-contain p-0.5 drop-shadow-xs"
                />
              </div>
              <div className="text-left">
                <h2 className="font-black text-sm text-white tracking-tight leading-tight">
                  {isBn ? "সাভারচালা শান্তি সংঘ" : BRAND_NAME_EN}
                </h2>
                <p className="text-[10px] font-bold text-white/80 leading-tight">
                  {isBn ? "ক্লাব পোর্টাল হাব" : "Club Portal Hub"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <LanguageSwitcher
                locale={locale as any}
                variant="toggle"
                className="!bg-white/15 hover:!bg-white/25 !text-white !border-white/20 shadow-2xs"
              />

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label={isBn ? "মেনু খুলুন" : "Open navigation drawer"}
                className="p-2 rounded-2xl text-white hover:bg-white/15 active:bg-white/20 transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav locale={locale} />
    </>
  );
}
