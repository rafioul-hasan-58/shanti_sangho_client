"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  LayoutDashboard,
  FolderPlus,
  ArrowLeft,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useFunds } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import { hasDashboardAccess } from "@/lib/authRole";
import { withLocaleHref } from "@/lib/config/adminNav";
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
  const { data: funds = [], isLoading } = useFunds();

  // Role Access Guard
  useEffect(() => {
    if (!authLoading && user && !hasDashboardAccess(user.role)) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, user, locale, router]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Back link to Finance Overview */}
      <div>
        <Link
          href={withLocaleHref("/admin/finance", locale)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors group mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>
            {isBn ? "ফাইন্যান্স ওভারভিউতে ফিরুন" : "Back to Finance Overview"}
          </span>
        </Link>
      </div>

      {/* 2. Page Header with Title and Add Fund Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#006a4e] text-white shadow-xs shrink-0">
            <FolderTree className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isBn ? "ক্লাবের সকল ফান্ড ব্যবস্থাপনা" : "All Club Funds"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isBn
                ? "ফান্ড তৈরি, এডিট, স্থিতি পর্যবেক্ষণ ও পূর্ণাঙ্গ পরিচালনা"
                : "Create, edit, archive, and monitor balances across all funds"}
            </p>
          </div>
        </div>

        {/* Action Button: Add Fund */}
        <div>
          <button
            type="button"
            onClick={() => setFundDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-4 rounded-xl sm:rounded-2xl bg-[#006a4e] hover:bg-[#00543e] active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-[#006a4e]/20 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span>{isBn ? "নতুন ফান্ড তৈরি করুন" : "Create New Fund"}</span>
          </button>
        </div>
      </div>

      {/* 3. Top-Level Tab Switcher: Overview vs All Funds (Synced across routes) */}
      <div className="w-full sm:w-auto sm:inline-flex grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1.5 select-none">
        <Link
          href={withLocaleHref("/admin/finance", locale)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-500" />
          <span>{isBn ? "সামগ্রিক চিত্র" : "Overview"}</span>
        </Link>

        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#006a4e] text-white shadow-md shadow-[#006a4e]/20">
          <FolderTree className="w-4 h-4 shrink-0 text-white" />
          <span>{isBn ? "সকল ফান্ড" : "All Funds"}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
            {funds.length}
          </span>
        </div>
      </div>

      {/* 4. Funds Management Table (Card in mobile mode, Table in desktop, with pagination) */}
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
