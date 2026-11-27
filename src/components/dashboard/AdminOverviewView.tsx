"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatCard from "@/components/dashboard/StatCard";
import UserAvatar from "@/components/layout/UserAvatar";

// Dynamically import ExpenseChart with SSR disabled so Recharts is never evaluated during SSR
const ExpenseChart = dynamic(
  () => import("@/components/dashboard/ExpenseChart"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-full mb-6" />
        <div className="h-72 w-full bg-slate-100 rounded-xl" />
      </div>
    ),
  }
);
import { getDashboardStats } from "@/lib/api/dashboard";
import {
  fetchMembers,
  updateMemberById,
  deleteMemberById,
} from "@/lib/api/memberService";
import type { DashboardStats, ManagedUser } from "@/lib/types/dashboard";
import { formatBDT } from "@/lib/constants/categories";
import { formatBloodGroupDisplay } from "@/lib/bloodGroup";
import { formatRegistrationTime } from "@/lib/format";

interface AdminOverviewViewProps {
  adminName?: string;
  adminVerified?: boolean;
  locale?: string;
  onReviewPending?: () => void;
}

const MAX_OVERVIEW_PENDING = 6;

export default function AdminOverviewView({
  adminName = "Admin",
  adminVerified = false,
  locale = "en",
  onReviewPending,
}: AdminOverviewViewProps) {
  const isBn = locale === "bn";
  const admin = { name: adminName || "Admin" };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<ManagedUser[]>([]);
  const [totalPendingCount, setTotalPendingCount] = useState<number | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const handleApproveUser = async (userId: string) => {
    try {
      setBusyUserId(userId);
      await updateMemberById(userId, { adminVerified: true, status: "ACTIVE" });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalPendingCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
      setStats((prev) =>
        prev ? { ...prev, pendingMembers: Math.max(0, prev.pendingMembers - 1) } : null
      );
    } catch (err) {
      console.error("Failed to approve user:", err);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    const confirmed = window.confirm(
      isBn
        ? "আপনি কি নিশ্চিতভাবে এই ইউজারকে তালিকা থেকে মুছে ফেলতে চান?"
        : "Are you sure you want to remove this user?"
    );
    if (!confirmed) return;

    try {
      setBusyUserId(userId);
      await deleteMemberById(userId);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalPendingCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
      setStats((prev) =>
        prev ? { ...prev, pendingMembers: Math.max(0, prev.pendingMembers - 1) } : null
      );
    } catch (err) {
      console.error("Failed to remove user:", err);
    } finally {
      setBusyUserId(null);
    }
  };

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoading(false));

    fetchMembers({ page: 1, limit: 50, sortOrder: "desc" })
      .then((res) => {
        const filtered = res.users.filter((u) => !u.adminVerified);
        setTotalPendingCount(filtered.length);
        setPendingUsers(filtered.slice(0, MAX_OVERVIEW_PENDING));
      })
      .catch((err) => console.error("Error loading pending users:", err))
      .finally(() => setPendingLoading(false));
  }, []);

  const displayedPendingCount =
    totalPendingCount !== null
      ? totalPendingCount
      : (stats?.pendingMembers ?? 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. WELCOME SECTION */}
      <section aria-label="Welcome section">
        <WelcomeCard
          adminName={admin.name}
          isVerified={adminVerified}
          locale={locale}
        />
      </section>

      {/* 2. STAT CARDS ROW (2 per row on mobile, 4 per row on xl) */}
      <section aria-label="Key statistics">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          {/* Card 1: Total Members */}
          <StatCard
            variant="primary"
            title={isBn ? "মোট ক্লাব সদস্য" : "Total Members"}
            value={loading ? "..." : (stats?.totalMembers ?? 248)}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />

          {/* Card 2: Pending Members */}
          <StatCard
            variant="accent"
            title={isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Members"}
            value={loading && pendingLoading ? "..." : displayedPendingCount}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          {/* Card 3: Total Monthly Spent */}
          <StatCard
            variant="secondary"
            title={isBn ? "মাসিক মোট ব্যয়" : "Total Monthly Spent"}
            value={loading ? "..." : formatBDT(stats?.monthlySpent ?? 105400)}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Card 4: Yearly Spent */}
          <StatCard
            variant="teal"
            title={isBn ? "বাৎসরিক মোট ব্যয়" : "Yearly Spent"}
            value={loading ? "..." : formatBDT(stats?.yearlySpent ?? 1422000)}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* 3. EXPENDITURE OVERVIEW & CATEGORY SHARE */}
      <section aria-label="Expenditure analysis and charts">
        <ExpenseChart locale={locale} />
      </section>

      {/* 4. PENDING USERS PREVIEW (After Expenditure Overview • Max 6: Table on Desktop, Cards on Mobile) */}
      <section aria-label="Pending user requests">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#006a4e]/15 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse shrink-0" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {isBn ? "সাম্প্রতিক পেন্ডিং ইউজার" : "Recent Pending Users"}
              </h3>
            </div>

            {onReviewPending && (
              <button
                type="button"
                onClick={onReviewPending}
                className="group inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 active:scale-95 text-[#006a4e] border border-emerald-200/90 text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <span>
                  {isBn ? "সব পেন্ডিং ইউজার দেখুন" : "View All Pending Users"}
                </span>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
                </svg>
              </button>
            )}
          </div>

          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-16 rounded-2xl bg-[#f7f4ea]/70 border border-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="rounded-2xl bg-[#f7f4ea]/70 border border-[#006a4e]/10 py-10 px-4 text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="text-sm font-bold text-[#12231d]">
                {isBn
                  ? "কোনো পেন্ডিংইউজার নেই!"
                  : "No pending users right now!"}
              </p>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "সব সাম্প্রতিক ইউজার অনুমোদিত ও সক্রিয় রয়েছে।"
                  : "All recent registrations have been reviewed and verified."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#f7f4ea]/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">{isBn ? "সদস্য" : "User"}</th>
                      <th className="py-3.5 px-4">{isBn ? "যোগাযোগ" : "Contact"}</th>
                      <th className="py-3.5 px-4">{isBn ? "রক্ত ও এলাকা" : "Blood & Area"}</th>
                      <th className="py-3.5 px-4">{isBn ? "অবস্থা" : "Status"}</th>
                      <th className="py-3.5 px-4">{isBn ? "নিবন্ধন সময়" : "Registered"}</th>
                      <th className="py-3.5 px-4 text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pendingUsers.map((pendingUser) => (
                      <tr
                        key={pendingUser.id}
                        className="hover:bg-[#f7f4ea]/55 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              src={pendingUser.profileImage || pendingUser.picture}
                              name={pendingUser.fullName}
                              className="h-9 w-9 shrink-0 ring-1 ring-[#006a4e]/20"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#12231d] truncate max-w-[200px]">
                                {pendingUser.fullName}
                              </p>
                              {pendingUser.profession && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                  {pendingUser.profession}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <p className="font-semibold text-slate-700 truncate max-w-[210px]">
                            {pendingUser.email || "—"}
                          </p>
                          {pendingUser.phoneNumber && (
                            <p className="text-slate-400 mt-0.5">
                              {pendingUser.phoneNumber}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {pendingUser.bloodGroup &&
                              pendingUser.bloodGroup !== "UNKNOWN" && (
                                <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                  🩸 {formatBloodGroupDisplay(pendingUser.bloodGroup)}
                                </span>
                              )}
                            <span className="text-slate-600 font-medium truncate max-w-[150px]">
                              {pendingUser.village ||
                                pendingUser.currentLocation ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-[#006a4e] border border-emerald-200/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>{isBn ? "অনুমোদন প্রয়োজন" : "Approval Needed"}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5 text-slate-400 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                              />
                            </svg>
                            <span>
                              {formatRegistrationTime(
                                pendingUser.createdAt || pendingUser.joinedAt,
                                isBn
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tick Button (Approve) */}
                            <button
                              type="button"
                              title={isBn ? "অনুমোদন করুন" : "Approve Member"}
                              aria-label={isBn ? "অনুমোদন করুন" : "Approve Member"}
                              disabled={busyUserId === pendingUser.id}
                              onClick={() => handleApproveUser(pendingUser.id)}
                              className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              {busyUserId === pendingUser.id ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>

                            {/* Cross Button (Remove) */}
                            <button
                              type="button"
                              title={isBn ? "মুছে ফেলুন" : "Remove Member"}
                              aria-label={isBn ? "মুছে ফেলুন" : "Remove Member"}
                              disabled={busyUserId === pendingUser.id}
                              onClick={() => handleRemoveUser(pendingUser.id)}
                              className="h-8 w-8 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200/90 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-[#eafaf2] p-3.5 sm:p-4 space-y-3 shadow-2xs transition-all"
                  >
                    {/* Line 1: Profile avatar, name, and full email (break-all, no overflow) */}
                    <div className="flex items-start gap-3 min-w-0">
                      <UserAvatar
                        src={pendingUser.profileImage || pendingUser.picture}
                        name={pendingUser.fullName}
                        className="h-10 w-10 shrink-0 ring-2 ring-emerald-200 shadow-2xs mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {pendingUser.fullName}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium break-all mt-0.5 leading-snug">
                          {pendingUser.email || pendingUser.phoneNumber || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Line 2: Approval Needed status & Registration time on left, Approve / Remove action buttons on right */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-emerald-100">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2.5 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100/60 text-[#006a4e] border border-emerald-300/70 shrink-0 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                          <span>{isBn ? "অনুমোদন প্রয়োজন" : "Approval Needed"}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800/80 whitespace-nowrap">
                          <svg
                            className="w-3.5 h-3.5 text-emerald-600/70 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                            />
                          </svg>
                          <span>
                            {formatRegistrationTime(
                              pendingUser.createdAt || pendingUser.joinedAt,
                              isBn
                            )}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Tick Button (Approve) */}
                        <button
                          type="button"
                          title={isBn ? "অনুমোদন করুন" : "Approve Member"}
                          aria-label={isBn ? "অনুমোদন করুন" : "Approve Member"}
                          disabled={busyUserId === pendingUser.id}
                          onClick={() => handleApproveUser(pendingUser.id)}
                          className="h-8 w-8 rounded-xl bg-[#006a4e] hover:bg-[#00523c] active:scale-95 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {busyUserId === pendingUser.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Cross Button (Remove) */}
                        <button
                          type="button"
                          title={isBn ? "মুছে ফেলুন" : "Remove Member"}
                          aria-label={isBn ? "মুছে ফেলুন" : "Remove Member"}
                          disabled={busyUserId === pendingUser.id}
                          onClick={() => handleRemoveUser(pendingUser.id)}
                          className="h-8 w-8 rounded-xl bg-white hover:bg-rose-50 active:scale-95 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
