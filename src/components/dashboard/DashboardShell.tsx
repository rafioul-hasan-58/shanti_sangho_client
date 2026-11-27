"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Dictionary } from "@/i18n/getDictionary";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import FeatureCooking from "@/components/common/FeatureCooking";
import MobileBottomNav from "@/components/admin/MobileBottomNav";
import { FinanceOverviewClient } from "@/app/[locale]/admin/finance/_components/finance-overview-client";
import DashboardSidebar from "./DashboardSidebar";
import AdminOverviewView from "./AdminOverviewView";
import AdminUsersView from "./AdminUsersView";
import MembersDirectory from "@/components/members/MembersDirectory";
import ProfileSettingsView from "./ProfileSettingsView";
import {
  getRoleDisplayMeta,
  hasDashboardAccess,
  isAdminVerified,
  normalizeRole,
} from "@/lib/authRole";
import { BRAND_NAME_EN } from "@/lib/constants/site";

interface Props {
  title?: string;
  stats?: string[];
  dict: Dictionary;
  locale?: string;
  embeddedInAdminLayout?: boolean;
  initialTab?: TabType;
}

type TabType =
  | "overview"
  | "profile"
  | "sports"
  | "members"
  | "committee"
  | "notices"
  | "leadership_pioneers"
  | "leadership_committee"
  | "leadership_admins"
  | "admin_users"
  | "admin_users_all"
  | "admin_users_pending"
  | "admin_members"
  | "admin_live"
  | "admin_finance"
  | "admin_expenses";

export default function DashboardShell({
  dict,
  locale = "bn",
  embeddedInAdminLayout = false,
  initialTab,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, updateProfile } = useAuth();
  const { role, setRole } = useRole();
  const isBn = locale === "bn";

  // Role & dashboard access logic:
  // USER sees member view; MODERATOR, ADMIN, and SUPER_ADMIN get management/dashboard access.
  const isAdminRoute = pathname?.includes("/admin");
  const resolvedRole = user
    ? normalizeRole(user.role)
    : isAdminRoute || role === "admin"
      ? "ADMIN"
      : "USER";
  const roleMeta = getRoleDisplayMeta(resolvedRole);
  const isAdmin = hasDashboardAccess(resolvedRole);

  const resolveTab = (tab: string | null | undefined): TabType => {
    if (
      tab &&
      [
        "overview",
        "profile",
        "sports",
        "members",
        "committee",
        "notices",
        "leadership_pioneers",
        "leadership_committee",
        "leadership_admins",
        "admin_users",
        "admin_users_all",
        "admin_users_pending",
        "admin_members",
        "admin_live",
        "admin_finance",
        "admin_expenses",
      ].includes(tab)
    ) {
      if (tab === "overview" && !isAdmin) {
        return "members";
      }
      if (tab === "members" && isAdmin) {
        return "admin_users";
      }
      return tab as TabType;
    }
    return isAdmin ? "overview" : "members";
  };

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTab) return resolveTab(initialTab);
    const queryTab = searchParams?.get("tab");
    if (queryTab) return resolveTab(queryTab);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.role && hasDashboardAccess(parsed.role)) {
            return "overview";
          }
        }
      } catch {
        // fallback
      }
    }
    return isAdmin ? "overview" : "members";
  });

  // Keep activeTab reactive whenever URL search param changes (e.g. mobile bottom nav clicks)
  useEffect(() => {
    const queryTab = searchParams?.get("tab");
    if (queryTab) {
      const resolved = resolveTab(queryTab);
      setActiveTab(resolved);
    } else if (!initialTab) {
      setActiveTab(isAdmin ? "overview" : "members");
    }
  }, [searchParams, isAdmin, initialTab]);

  const handleTabChange = (nextTab: TabType) => {
    setActiveTab(nextTab);
    if (!embeddedInAdminLayout) {
      const targetUrl =
        nextTab === "overview"
          ? `/${locale}/dashboard`
          : `/${locale}/dashboard?tab=${nextTab}`;
      router.replace(targetUrl, { scroll: false });
    }
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const displayName = user?.name || (isBn ? "রাফিউল হাসান" : "Rafioul Hasan");

  // Mock pending members for Admin
  const [pendingMembers, setPendingMembers] = useState([
    { id: "1", name: "তানভীর আহমেদ", email: "tanvir.ahmed@example.com", phone: "+880 1712-345678", date: "Nov 9, 2026", status: "pending" },
    { id: "2", name: "মাহমুদুল হাসান", email: "mahmud.h@example.com", phone: "+880 1823-456789", date: "Nov 8, 2026", status: "pending" },
    { id: "3", name: "শাকিল হোসেন", email: "shakil.h@example.com", phone: "+880 1934-567890", date: "Nov 7, 2026", status: "pending" },
  ]);

  const handleApprove = (id: string) => {
    setPendingMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <div
        className={`${embeddedInAdminLayout
            ? "w-full"
            : "min-h-screen bg-[#f7f4ea] flex flex-col md:flex-row"
          } font-sans text-slate-800`}
      >
        {/* MODULAR DASHBOARD SIDEBAR (Skipped when rendered inside AdminLayout) */}
        {!embeddedInAdminLayout && (
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            locale={locale}
            user={user}
            isAdmin={Boolean(isAdmin)}
            displayName={displayName}
            pendingCount={pendingMembers.length}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            onLogout={logout}
          />
        )}

        {/* ======================================================== */}
        {/* MAIN CONTENT AREA                                         */}
        {/* ======================================================== */}
        <div className={`flex-1 min-w-0 flex flex-col ${!embeddedInAdminLayout ? "pb-24 md:pb-6" : ""}`}>
          {/* Mobile Top Header (Skipped when rendered inside AdminLayout) */}
          {!embeddedInAdminLayout && (
            <header className="md:hidden sticky top-0 z-30 bg-gradient-to-r from-[#E8F5EF] to-[#DCEFE5] backdrop-blur-md border-b border-[#D1E5D9] px-4 py-2.5 flex items-center justify-between gap-4 shadow-2xs">
              {/* Left: Brand Logo + Club Name + Subtitle (Current Theme Green) */}
              <Link href={`/${locale}`} className="flex items-center gap-2.5 select-none">
                <div className="relative h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-tr from-[#006a4e] to-[#059669] p-1.5 flex items-center justify-center shadow-xs">
                  <Image
                    src="/logo.png"
                    alt={BRAND_NAME_EN}
                    fill
                    className="object-contain p-0.5 drop-shadow-xs"
                  />
                </div>
                <div className="text-left">
                  <h2 className="font-black text-sm text-[#064E3B] tracking-tight leading-tight">
                    {isBn ? "সাভারচালা শান্তি সংঘ" : BRAND_NAME_EN}
                  </h2>
                  <p className="text-[10px] font-bold text-[#064E3B]/80 leading-tight">
                    {isBn ? "ক্লাব পোর্টাল হাব" : "Club Portal Hub"}
                  </p>
                </div>
              </Link>

              {/* Right: Language Switcher + Hamburger Drawer Button */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher
                  locale={locale as any}
                  variant="toggle"
                  className="!bg-[#F4FAF6] hover:!bg-[#E8F5EF] !text-[#064E3B] !border-[#C2E2D0] shadow-2xs"
                />

                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open navigation drawer"
                  className="p-2 rounded-2xl text-[#064E3B] hover:bg-[#064E3B]/10 active:bg-[#064E3B]/15 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </header>
          )}

          {/* Dashboard Main Body */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* ===================================================== */}
            {/* TAB 1: OVERVIEW (Admin Only)                          */}
            {/* ===================================================== */}
            {activeTab === "overview" && isAdmin && (
              <AdminOverviewView
                adminName={user?.name || "Admin"}
                adminVerified={isAdminVerified(user?.adminVerified)}
                locale={locale}
                onReviewPending={() => setActiveTab("admin_users_pending")}
              />
            )}

            {/* ===================================================== */}
            {/* TAB: MEMBERS DIRECTORY (Read-only for regular members)*/}
            {/* ===================================================== */}
            {activeTab === "members" && !isAdmin && (
              <MembersDirectory locale={locale as any} inDashboard />
            )}

            {/* ===================================================== */}
            {/* TAB 2: PROFILE & SETTINGS                             */}
            {/* ===================================================== */}
            {activeTab === "profile" && (
              <ProfileSettingsView locale={locale} />
            )}

            {/* ===================================================== */}
            {/* TAB 3: SPORTS & SPL (Cooking)                        */}
            {/* ===================================================== */}
            {activeTab === "sports" && (
              <FeatureCooking
                featureNameEn="Sports & SPL"
                featureNameBn="স্পোর্টস ও এসপিএল"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {/* ===================================================== */}
            {/* TAB 4A: ADMIN: USER MANAGEMENT (All & Pending Sub-tabs) */}
            {/* ===================================================== */}
            {(activeTab === "admin_users" ||
              activeTab === "admin_users_all" ||
              activeTab === "admin_users_pending") &&
              isAdmin && (
                <AdminUsersView
                  locale={locale}
                  currentUserId={user?.id}
                  subTab={activeTab === "admin_users_pending" ? "pending" : "all"}
                  onSubTabChange={(next) =>
                    setActiveTab(
                      next === "pending" ? "admin_users_pending" : "admin_users"
                    )
                  }
                />
              )}

            {/* ===================================================== */}
            {/* TAB 4: ADMIN: MEMBER APPROVALS (Admin Only)          */}
            {/* ===================================================== */}
            {activeTab === "admin_members" && isAdmin && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mb-1">
                      <span>👑</span>
                      <span>{isBn ? "অ্যাডমিন ম্যানেজমেন্ট" : "Admin Management"}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isBn ? "নতুন সদস্য রেজিস্ট্রেশন অনুমোদন" : "Pending Member Registrations"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBn ? "আবেদনকারীদের যাচাই করে ক্লাবের সদস্য তালিকায় যুক্ত করুন" : "Review and approve new club membership registrations"}
                    </p>
                  </div>

                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-auto">
                    {pendingMembers.length} {isBn ? "টি আবেদন অপেক্ষমাণ" : "Pending Applications"}
                  </span>
                </div>

                {pendingMembers.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <p className="text-3xl mb-2">🎉</p>
                    <p>{isBn ? "কোনো নতুন আবেদন পেন্ডিংনেই!" : "No pending registration requests!"}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                          <p className="text-xs text-slate-500">{member.email} • {member.phone}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{isBn ? "আবেদনের তারিখ:" : "Date:"} {member.date}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(member.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            {isBn ? "✓ অনুমোদন করুন" : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(member.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                          >
                            {isBn ? "বাতিল" : "Decline"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* TAB 5: ADMIN: LIVE SCORE (Cooking)                   */}
            {/* ===================================================== */}
            {activeTab === "admin_live" && isAdmin && (
              <FeatureCooking
                featureNameEn="Live Score"
                featureNameBn="লাইভ স্কোর"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {/* ===================================================== */}
            {/* TAB 6: ADMIN: CLUB FINANCE                           */}
            {/* ===================================================== */}
            {activeTab === "admin_finance" && isAdmin && (
              <div className="py-2">
                <FinanceOverviewClient locale={locale} />
              </div>
            )}

            {/* ===================================================== */}
            {/* COOKING FEATURE TABS (Leadership / Notices / Expenses) */}
            {/* ===================================================== */}
            {activeTab === "leadership_pioneers" && (
              <FeatureCooking
                featureNameEn="Pioneers"
                featureNameBn="অগ্রপথিক"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {activeTab === "leadership_committee" && (
              <FeatureCooking
                featureNameEn="Committee"
                featureNameBn="কমিটি"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {activeTab === "committee" && (
              <FeatureCooking
                featureNameEn="Committees"
                featureNameBn="কমিটি"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {activeTab === "leadership_admins" && (
              <FeatureCooking
                featureNameEn="Admins"
                featureNameBn="অ্যাডমিন"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {activeTab === "notices" && (
              <FeatureCooking
                featureNameEn="Notices & Welfare"
                featureNameBn="নোটিশ ও কল্যাণ"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}

            {activeTab === "admin_expenses" && isAdmin && (
              <FeatureCooking
                featureNameEn="Expenses"
                featureNameBn="ব্যয় হিসাব"
                locale={locale}
                onDashboardClick={() => setActiveTab(isAdmin ? "overview" : "members")}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation when directly on user dashboard */}
      {!embeddedInAdminLayout && <MobileBottomNav locale={locale} />}
    </>
  );
}
