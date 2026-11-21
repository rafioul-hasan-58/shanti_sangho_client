"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MOBILE_BOTTOM_NAV_ITEMS,
  isAdminPathActive,
  withLocaleHref,
} from "@/lib/config/adminNav";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { normalizeRole, hasDashboardAccess } from "@/lib/authRole";
import UserAvatar from "@/components/layout/UserAvatar";

interface MobileBottomNavProps {
  locale: string;
}

/**
 * Mobile bottom navigation bar (`< md`) with 4 primary tabs:
 * 1. Dashboard (/admin/dashboard or /dashboard)
 * 2. Finance (/admin/finance)
 * 3. User (/admin/members)
 * 4. Profile (/admin/profile or /dashboard?tab=profile) with round avatar icon
 */
export default function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname() || "";
  const { user } = useAuth();
  const { role } = useRole();
  const resolvedRole = normalizeRole(user?.role ?? role);
  const isAdmin = hasDashboardAccess(resolvedRole);

  const isBn = locale === "bn";
  const primaryTabs = MOBILE_BOTTOM_NAV_ITEMS;

  const isProfileActive =
    isAdminPathActive(pathname, "/admin/profile") ||
    (pathname.includes("/dashboard") &&
      typeof window !== "undefined" &&
      window.location.search.includes("tab=profile"));

  const isUserActive =
    isAdminPathActive(pathname, "/admin/members") ||
    (pathname.includes("/dashboard") &&
      typeof window !== "undefined" &&
      (window.location.search.includes("tab=admin_users") ||
        window.location.search.includes("tab=members")));

  const isFinanceActive =
    isAdminPathActive(pathname, "/admin/finance") ||
    (pathname.includes("/dashboard") &&
      typeof window !== "undefined" &&
      window.location.search.includes("tab=admin_finance"));

  const isDashboardActive =
    (isAdminPathActive(pathname, "/admin/dashboard") ||
      pathname.endsWith("/dashboard") ||
      pathname.endsWith("/admin")) &&
    !isProfileActive &&
    !isUserActive &&
    !isFinanceActive;

  return (
    <nav
      aria-label="Mobile admin navigation"
      style={{
        background:
          "linear-gradient(90deg, #004d38 0%, #006a4e 50%, #004d38 100%)",
      }}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[#f2b705]/30 shadow-2xl"
    >
      <div className="grid grid-cols-4 h-16 px-1">
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const tabLabel = isBn
            ? item.shortLabelBn || item.labelBn
            : item.shortLabelEn || item.labelEn;

          let isTabActive = false;
          let targetHref = item.href || "/admin/dashboard";

          if (item.id === "dashboard") {
            isTabActive = isDashboardActive;
            targetHref = isAdmin ? "/admin/dashboard" : "/dashboard";
          } else if (item.id === "finance") {
            isTabActive = isFinanceActive;
            targetHref = "/admin/finance";
          } else if (item.id === "members") {
            isTabActive = isUserActive;
            targetHref = "/admin/members";
          } else if (item.id === "profile") {
            isTabActive = isProfileActive;
            targetHref = isAdmin ? "/admin/profile" : "/dashboard?tab=profile";
          } else if (item.href) {
            isTabActive = isAdminPathActive(pathname, item.href);
          }

          return (
            <Link
              key={item.id}
              href={withLocaleHref(targetHref, locale)}
              aria-current={isTabActive ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#f2b705] ${
                isTabActive
                  ? "bg-white/15 text-[#f2b705] font-extrabold"
                  : "text-[#f7f4ea]/85 hover:text-white font-semibold"
              }`}
            >
              {isTabActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full bg-[#f2b705]"
                />
              )}
              {item.id === "profile" ? (
                <div
                  className={`relative w-6 h-6 rounded-full overflow-hidden shrink-0 transition-transform ${
                    isTabActive
                      ? "ring-2 ring-[#f2b705] shadow-xs scale-105"
                      : "ring-1.5 ring-white/70"
                  }`}
                >
                  <UserAvatar
                    src={user?.profileImage || user?.picture}
                    name={user?.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Icon className="w-5 h-5 shrink-0" />
              )}
              <span className="text-[11px] truncate max-w-full px-1 leading-tight">
                {tabLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
