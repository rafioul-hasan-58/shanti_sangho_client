"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  ArrowLeft,
  FolderPlus,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { useFunds } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import { hasDashboardAccess } from "@/lib/authRole";
import { withLocaleHref } from "@/lib/config/adminNav";
import { formatMoney } from "@/lib/format";
import { FundsManagementTable } from "./funds-management-table";
import { FundFormDialog } from "./fund-form-dialog";

interface AllFundsPageClientProps {
  locale: string;
}

export function AllFundsPageClient({ locale }: AllFundsPageClientProps) {
  const router = useRouter();
  const isBn = locale === "bn";
  const { user, loading: authLoading } = useAuth();

  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const { data: funds = [] } = useFunds();

  // Role Access Guard
  useEffect(() => {
    if (!authLoading && user && !hasDashboardAccess(user.role)) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, user, locale, router]);

  // Aggregate stats
  const totalRaised = funds.reduce((sum, f) => sum + (f.totalIn || 0), 0);
  const totalRemaining = funds.reduce((sum, f) => sum + (f.remaining || 0), 0);
  const activeCount = funds.filter((f) => f.isActive).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-7 animate-fadeIn">
      {/* 1. Breadcrumb Back Link */}
      <div>
        <Link
          href={withLocaleHref("/admin/finance", locale)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>
            {isBn ? "ফাইন্যান্স ওভারভিউতে ফিরুন" : "Back to Finance Overview"}
          </span>
        </Link>
      </div>

      {/* 2. Page Header with Title and Single Add Fund Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#006a4e] text-white shadow-xs shrink-0">
            <FolderTree className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {isBn ? "ক্লাবের সকল ফান্ড" : "All Club Funds"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100/90 text-[#006a4e]">
                {funds.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {isBn
                ? "ফান্ড তৈরি, এডিট, স্থিতি পর্যবেক্ষণ ও পূর্ণাঙ্গ পরিচালনা"
                : "Create, edit, archive, and monitor balances across all funds"}
            </p>
          </div>
        </div>

        {/* Desktop Quick Add Button */}
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={() => setFundDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#006a4e] hover:bg-[#00543e] active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-[#006a4e]/20 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>{isBn ? "নতুন ফান্ড তৈরি করুন" : "Create New Fund"}</span>
          </button>
        </div>
      </div>

      {/* 3. Colorful Quick Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Funds (Teal/Emerald Gradient) */}
        <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/95 via-white to-emerald-50/70 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-[#006a4e] to-emerald-400" />
          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-teal-800">
                {isBn ? "মোট ফান্ড" : "Total Funds"}
              </span>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-700/20 flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {funds.length}
              </span>
              <span className="text-xs font-bold text-teal-700">
                ({activeCount} {isBn ? "সক্রিয়" : "active"})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {isBn ? "ক্লাবের সকল সংরক্ষিত ফান্ড ও প্রজেক্ট" : "All registered club funds & projects"}
            </p>
          </div>
        </div>

        {/* Card 2: Total Raised (Emerald Gradient) */}
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-white to-emerald-100/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#004d38] via-[#006a4e] to-emerald-400" />
          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#004d38]">
                {isBn ? "মোট সংগৃহীত" : "Total Raised"}
              </span>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#006a4e] to-emerald-500 text-white shadow-md shadow-emerald-700/20 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl sm:text-3xl font-black text-[#006a4e] tracking-tight tabular-nums">
                + {formatMoney(totalRaised)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {isBn ? "সকল ফান্ডের সম্মিলিত জমা অনুদান" : "Cumulative contributions across all funds"}
            </p>
          </div>
        </div>

        {/* Card 3: Net Remaining (Gold/Amber/Emerald Gradient) */}
        <div className="rounded-2xl border border-amber-300/90 bg-gradient-to-br from-[#fbf8ee] via-white to-emerald-50/70 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#f2b705] via-amber-500 to-[#006a4e]" />
          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-900">
                {isBn ? "বর্তমান স্থিতি" : "Net Balance"}
              </span>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#f2b705] to-amber-500 text-[#12231d] shadow-md shadow-amber-600/20 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 stroke-[2.4]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                {formatMoney(totalRemaining)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {isBn ? "ক্লাবের ব্যাংকে ও ক্যাশে মোট অবশিষ্ট স্থিতি" : "Net available funds in bank and cash"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Funds Card Grid with Filters & Pagination (No table!) */}
      <FundsManagementTable
        locale={locale}
        pageSize={6}
        onAddFundClick={() => setFundDialogOpen(true)}
      />

      {/* Fund Create/Edit Modal Dialog */}
      <FundFormDialog
        isOpen={fundDialogOpen}
        onClose={() => setFundDialogOpen(false)}
        isBn={isBn}
      />
    </div>
  );
}
