"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MOBILE_BOTTOM_NAV_ITEMS,
  isAdminPathActive,
  withLocaleHref,
} from "@/lib/config/adminNav";

interface MobileBottomNavProps {
  locale: string;
}

/**
 * Mobile bottom navigation bar (`< md`) with 4 primary tabs:
 * 1. Dashboard (/admin/dashboard)
 * 2. Finance (/admin/finance)
 * 3. User (/admin/members)
 * 4. Profile (/admin/profile)
 */
export default function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname() || "";
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
          if (item.id === "dashboard") isTabActive = isDashboardActive;
          else if (item.id === "finance") isTabActive = isFinanceActive;
          else if (item.id === "members") isTabActive = isUserActive;
          else if (item.id === "profile") isTabActive = isProfileActive;
          else if (item.href) isTabActive = isAdminPathActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={withLocaleHref(item.href || "/admin/dashboard", locale)}
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
              <Icon className="w-5 h-5 shrink-0" />
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
