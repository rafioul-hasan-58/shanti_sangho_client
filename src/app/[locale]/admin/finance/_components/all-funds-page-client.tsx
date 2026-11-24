"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  ArrowLeft,
  FolderPlus,
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
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100/80 text-[#006a4e]">
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

      {/* 3. Quick Stats Summary Ribbon */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            {isBn ? "মোট ফান্ড" : "Total Funds"}
          </p>
          <p className="text-sm sm:text-lg font-black text-slate-900 mt-0.5">
            {funds.length} <span className="text-[11px] sm:text-xs font-semibold text-slate-400">({activeCount} {isBn ? "সক্রিয়" : "active"})</span>
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            {isBn ? "মোট সংগৃহীত" : "Total Raised"}
          </p>
          <p className="text-sm sm:text-lg font-black text-emerald-700 mt-0.5">
            + {formatMoney(totalRaised)}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
            {isBn ? "বর্তমান স্থিতি" : "Net Balance"}
          </p>
          <p className="text-sm sm:text-lg font-black text-slate-900 mt-0.5">
            {formatMoney(totalRemaining)}
          </p>
        </div>
      </div>

      {/* 4. Funds Management (Card in Mobile mode, Table in Desktop, with Pagination) */}
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
