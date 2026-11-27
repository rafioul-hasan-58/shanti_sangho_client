"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
  Shield,
  User,
} from "lucide-react";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_UI_COPY,
  isAdminPathActive,
  withLocaleHref,
  type NavItem,
} from "@/lib/config/adminNav";
import type { Locale } from "@/i18n/config";

interface AdminMobileHeaderProps {
  locale: string;
}

export default function AdminMobileHeader({ locale }: AdminMobileHeaderProps) {
  const pathname = usePathname() || "";
  const isBn = locale === "bn";
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    committee: true,
    pioneers: false,
    admin: false,
  });

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Listen to open/toggle events from bottom nav or elsewhere
  useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    const handleToggle = () => setDrawerOpen((prev) => !prev);
    window.addEventListener("open-admin-mobile-menu", handleOpen);
    window.addEventListener("toggle-admin-mobile-menu", handleToggle);
    return () => {
      window.removeEventListener("open-admin-mobile-menu", handleOpen);
      window.removeEventListener("toggle-admin-mobile-menu", handleToggle);
    };
  }, []);

  // Broadcast drawer open state so bottom nav can highlight Menu tab
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("admin-mobile-drawer-state", {
        detail: { open: drawerOpen },
      })
    );
  }, [drawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  // Toggle accordion group in drawer
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <>
      {/* 1. Mobile Top Header Bar (< md) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#006a4e] border-b border-white/20 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-md">
        {/* Brand & Portal Title */}
        <Link
          href={withLocaleHref("/admin/dashboard", locale)}
          className="flex items-center gap-2.5 min-w-0 focus-visible:ring-2 focus-visible:ring-[#f2b705] rounded-xl"
        >
          <div className="relative h-8 w-8 shrink-0 rounded-xl bg-[#e8f5ef] border border-[#c2e2d0] p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logo.png"
              alt={ADMIN_UI_COPY.brandEn}
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-black text-white truncate leading-tight">
              {isBn ? ADMIN_UI_COPY.brandBn : ADMIN_UI_COPY.brandEn}
            </p>
            <p className="text-[10px] font-bold text-white/80 leading-tight">
              {isBn ? ADMIN_UI_COPY.portalBn : ADMIN_UI_COPY.portalEn}
            </p>
          </div>
        </Link>

        {/* Right Actions: Language Switcher + Hamburger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher
            locale={locale as Locale}
            variant="toggle"
            className="!bg-white/15 hover:!bg-white/25 !text-white !border-white/20 shadow-2xs"
          />

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={isBn ? "মেনু খুলুন" : "Open navigation menu"}
            className="p-2 rounded-xl text-white hover:bg-white/15 active:bg-white/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 2. Slide-Over Navigation Drawer with Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isBn ? "অ্যাডমিন মেনু" : "Admin navigation menu"}
            className="relative z-10 w-[84vw] max-w-[320px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideInLeft"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-transparent">
              <Link
                href={withLocaleHref("/admin/dashboard", locale)}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="relative h-9 w-9 shrink-0 rounded-xl bg-[#e8f5ef] border border-[#c2e2d0] p-1 flex items-center justify-center shadow-xs">
                  <Image
                    src="/logo.png"
                    alt={ADMIN_UI_COPY.brandEn}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900 leading-tight truncate">
                    {isBn ? "সাভারচালা শান্তি সংঘ" : ADMIN_UI_COPY.brandEn}
                  </h2>
                  <p className="text-[10px] font-bold text-[#006a4e] leading-tight">
                    {isBn ? "অ্যাডমিন কন্ট্রোল সেন্টার" : "Admin Control Center"}
                  </p>
                </div>
              </Link>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={isBn ? "বন্ধ করুন" : "Close menu"}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* User Profile Card (if authenticated) */}
            {user && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name || "User"}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <span>{(user.name || "A").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {user.name || "Admin User"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#006a4e]/10 text-[#006a4e]">
                      {user.role || "ADMIN"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Middle Nav Items */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              {/* Category 1: Leadership & Management (Executives, Pioneers, Admins) */}
              <div>
                <p className="px-2.5 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {isBn ? "নেতৃত্ব ও পরিষদ" : "Leadership & Management"}
                </p>

                <div className="space-y-1">
                  {ADMIN_NAV_ITEMS.filter((item) => item.children?.length).map(
                    (group) => {
                      const Icon = group.icon;
                      const isGroupOpen = Boolean(openGroups[group.id]);
                      const hasActiveChild = group.children?.some((c) =>
                        isAdminPathActive(pathname, c.href)
                      );

                      return (
                        <div key={group.id} className="space-y-0.5">
                          {/* Group Accordion Header */}
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              hasActiveChild
                                ? "bg-[#006a4e]/10 text-[#006a4e]"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4 shrink-0 text-[#006a4e]" />
                              <span className="truncate">
                                {isBn ? group.labelBn : group.labelEn}
                              </span>
                            </span>
                            {isGroupOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {/* Children Links */}
                          {isGroupOpen && group.children && (
                            <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4 animate-fadeIn">
                              {group.children.map((child) => {
                                const active = isAdminPathActive(pathname, child.href);

                                return (
                                  <Link
                                    key={child.href}
                                    href={withLocaleHref(child.href, locale)}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      active
                                        ? "bg-[#006a4e] text-white font-bold shadow-xs"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {isBn ? child.labelBn : child.labelEn}
                                    </span>
                                    {child.status === "cooking" && (
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                          active
                                            ? "bg-[#f2b705] text-slate-900"
                                            : "bg-amber-100 text-amber-800"
                                        }`}
                                      >
                                        {isBn ? "শীঘ্রই" : "Soon"}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Category 2: Direct Fast Links */}
              <div>
                <p className="px-2.5 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {isBn ? "প্রধান লিংকসমূহ" : "Quick Links"}
                </p>

                <div className="space-y-1">
                  {ADMIN_NAV_ITEMS.filter((item) => !item.children?.length).map(
                    (item) => {
                      const Icon = item.icon;
                      const active = item.href
                        ? isAdminPathActive(pathname, item.href)
                        : false;

                      return (
                        <Link
                          key={item.id}
                          href={withLocaleHref(item.href || "/admin/dashboard", locale)}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            active
                              ? "bg-[#006a4e] text-white shadow-xs font-black"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#f2b705]" : "text-[#006a4e]"}`} />
                          <span className="truncate">
                            {isBn ? item.labelBn : item.labelEn}
                          </span>
                        </Link>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions: Back to Website & Logout */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
              <Link
                href={`/${locale}`}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? "মূল ওয়েবসাইটে ফিরুন" : "Back to Website"}</span>
                </span>
                <span className="text-[10px] text-slate-400">↗</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#f42a41] border border-rose-200/60 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isBn ? "লগআউট" : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
