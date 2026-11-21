"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MOBILE_BOTTOM_NAV_ITEMS,
  isAdminPathActive,
  withLocaleHref,
  type NavItem,
} from "@/lib/config/adminNav";

interface MobileBottomNavProps {
  locale: string;
}

/**
 * Mobile bottom navigation bar (`< md`) with 5 primary slots:
 * 1. Dashboard (/admin/dashboard)
 * 2. Finance (/admin/finance)
 * 3. User (/admin/members)
 * 4. Profile (/admin/profile)
 * 5. Menu (Opens mobile navigation drawer with Leadership, Pioneers, Admins, etc.)
 */
export default function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname() || "";
  const isBn = locale === "bn";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Synchronize state with top header drawer
  useEffect(() => {
    const handleDrawerState = (e: Event) => {
      const custom = e as CustomEvent<{ open: boolean }>;
      setIsDrawerOpen(Boolean(custom.detail?.open));
    };
    window.addEventListener("admin-mobile-drawer-state", handleDrawerState);
    return () => {
      window.removeEventListener("admin-mobile-drawer-state", handleDrawerState);
    };
  }, []);

  const primaryTabs = MOBILE_BOTTOM_NAV_ITEMS;

  return (
    <nav
      aria-label="Mobile admin navigation"
      style={{
        background:
          "linear-gradient(90deg, #004d38 0%, #006a4e 50%, #004d38 100%)",
      }}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#f2b705]/30 shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 px-1">
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const tabLabel = isBn
            ? item.shortLabelBn || item.labelBn
            : item.shortLabelEn || item.labelEn;

          const isMenuTab = item.id === "menu";
          const isTabActive = isMenuTab
            ? isDrawerOpen
            : item.href
            ? isAdminPathActive(pathname, item.href)
            : false;

          // Slot 5: Menu button toggles the mobile drawer
          if (isMenuTab) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("toggle-admin-mobile-menu")
                  );
                }}
                aria-expanded={isDrawerOpen}
                aria-label={isBn ? "মেনু খুলুন" : "Open menu"}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f2b705] ${
                  isTabActive
                    ? "bg-white/15 text-[#f2b705] font-extrabold"
                    : "text-[#f7f4ea]/85 hover:text-white font-semibold"
                }`}
              >
                {isTabActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-2 right-2 h-0.5 rounded-b-full bg-[#f2b705]"
                  />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] sm:text-[11px] truncate max-w-full px-0.5 leading-tight">
                  {tabLabel}
                </span>
              </button>
            );
          }

          // Slots 1 to 4: Direct Page Links
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
                  className="absolute top-0 left-2 right-2 h-0.5 rounded-b-full bg-[#f2b705]"
                />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] sm:text-[11px] truncate max-w-full px-0.5 leading-tight">
                {tabLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
