"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Coins,
  LayoutDashboard,
  FolderTree,
  FolderPlus,
  ArrowRight,
  HandCoins,
  ReceiptText,
} from "lucide-react";
import { useFinanceOverview } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import { hasDashboardAccess } from "@/lib/authRole";
import { formatMoney } from "@/lib/format";
import { withLocaleHref } from "@/lib/config/adminNav";
import { StatCard } from "./stat-card";
import { FundCard } from "./fund-card";
import { FundCharts } from "./fund-charts";
import { RecentActivity } from "./recent-activity";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { FundFormDialog } from "./fund-form-dialog";
import { FundsManagementTable } from "./funds-management-table";

interface FinanceOverviewClientProps {
  locale: string;
}

type FinanceTab = "overview" | "funds";

export function FinanceOverviewClient({ locale }: FinanceOverviewClientProps) {
  const router = useRouter();
  const isBn = locale === "bn";
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [contributionSheetOpen, setContributionSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  const { data: overview, isLoading, isError, refetch } = useFinanceOverview();

  // Role Access Guard
  useEffect(() => {
    if (!authLoading && user && !hasDashboardAccess(user.role)) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, user, locale, router]);

  if (authLoading || isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse" />
          <div className="h-10 w-64 bg-slate-200/80 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 sm:h-32 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse"
            />
          ))}
          <div className="col-span-2 md:col-span-1 h-28 sm:h-32 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 sm:h-44 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center space-y-4">
          <p className="text-sm font-bold text-rose-600">
            {isBn
              ? "ফাইন্যান্স ডাটা লোড করতে সমস্যা হয়েছে।"
              : "Failed to load financial data."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isBn ? "পুনরায় চেষ্টা করুন" : "Retry"}</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    totalRaised,
    totalSpent,
    totalRemaining,
    funds,
    monthlyFlow,
    recentActivity,
  } = overview;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Page Header with Title and Primary Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#006a4e] text-white shadow-xs shrink-0">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isBn ? "ফাইন্যান্স ও ফান্ড ব্যবস্থাপনা" : "Club Finance & Treasury"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isBn
                  ? "শান্তি সংঘের সকল ফান্ড, ডোনেশন ও ব্যয়ের পূর্ণাঙ্গ হিসাব লেজার"
                  : "Central treasury, contributions ledger, and fund balances"}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Add Fund, Add Contribution, Add Expense */}
        <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-2.5">
          {/* Add Fund */}
          <button
            type="button"
            onClick={() => setFundDialogOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-2 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-300/70 active:scale-95 text-[#006a4e] text-xs sm:text-sm font-black shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006a4e]"
          >
            <FolderPlus className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span className="truncate">{isBn ? "নতুন ফান্ড" : "Add Fund"}</span>
          </button>

          {/* Add Contribution */}
          <button
            type="button"
            onClick={() => setContributionSheetOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-2 sm:px-4 rounded-xl sm:rounded-2xl bg-[#006a4e] hover:bg-[#00543e] active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-[#006a4e]/20 border border-[#006a4e] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <HandCoins className="w-4 h-4 shrink-0 stroke-[2.2]" />
            <span className="truncate">{isBn ? "ডোনেশন জমা" : "Add Contribution"}</span>
          </button>

          {/* Add Expense */}
          <button
            type="button"
            onClick={() => setExpenseSheetOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-2 sm:px-4 rounded-xl sm:rounded-2xl bg-rose-50/90 hover:bg-rose-100 active:scale-95 text-[#f42a41] border border-rose-200/90 text-xs sm:text-sm font-black shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f42a41]"
          >
            <ReceiptText className="w-4 h-4 shrink-0 stroke-[2.2] text-[#f42a41]" />
            <span className="truncate">{isBn ? "ব্যয় যোগ" : "Add Expense"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Tab Switcher: Overview vs All Funds */}
      <div className="w-full sm:w-auto sm:inline-flex grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#006a4e] text-white shadow-md shadow-[#006a4e]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <LayoutDashboard
            className={`w-4 h-4 shrink-0 transition-colors ${
              activeTab === "overview" ? "text-white" : "text-slate-500"
            }`}
          />
          <span>{isBn ? "সামগ্রিক চিত্র" : "Overview"}</span>
        </button>

        <Link
          href={withLocaleHref("/admin/finance/funds", locale)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === "funds"
              ? "bg-[#006a4e] text-white shadow-md shadow-[#006a4e]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <FolderTree
            className={`w-4 h-4 shrink-0 transition-colors ${
              activeTab === "funds" ? "text-white" : "text-slate-500"
            }`}
          />
          <span>{isBn ? "সকল ফান্ড" : "All Funds"}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
              activeTab === "funds"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {funds.length}
          </span>
        </Link>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Row: 3 Stat Cards (2 per row on mobile, 3 on desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
            <StatCard
              title={isBn ? "মোট সংগৃহীত অর্থ" : "Total Raised"}
              amount={totalRaised}
              subtitle={
                isBn
                  ? "সকল ফান্ডের সম্মিলিত ডোনেশন ও স্পনসরশিপ"
                  : "Total contributions across all club funds"
              }
              type="raised"
              icon={ArrowUpRight}
            />

            <StatCard
              title={isBn ? "মোট ব্যয়িত অর্থ" : "Total Spent"}
              amount={totalSpent}
              subtitle={
                isBn
                  ? "ক্লাব কার্যক্রম ও রক্ষণাবেক্ষণে মোট খরচ"
                  : "All logged expenditures and operational costs"
              }
              type="spent"
              icon={ArrowDownRight}
            />

            <StatCard
              title={isBn ? "মোট অবশিষ্ট উদ্বৃত্ত" : "Total Remaining"}
              amount={totalRemaining}
              subtitle={
                isBn
                  ? "ক্লাবের ব্যাংকে ও ক্যাশে বর্তমান মোট স্থিতি"
                  : "Net available balance across all funds"
              }
              type="remaining"
              icon={Wallet}
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* Fund Grid: One card per fund (2 cards per line in mobile) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {isBn ? "সকল ফান্ড ও ব্যালেন্স" : "Club Funds & Balances"}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? "প্রতিটি ফান্ডের বর্তমান স্থিতি ও ব্যয়ের অনুপাত"
                    : "Active funds with remaining balances and progress"}
                </p>
              </div>
              <Link
                href={withLocaleHref("/admin/finance/funds", locale)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#006a4e] hover:underline cursor-pointer"
              >
                <span>{isBn ? "সকল ফান্ড দেখুন" : "View All Funds"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {funds.map((fund) => (
                <FundCard key={fund.id} fund={fund} locale={locale} />
              ))}
            </div>
          </div>

          {/* Charts: Spending by Fund & 6 Months In vs Out */}
          <FundCharts funds={funds} monthlyFlow={monthlyFlow} isBn={isBn} />

          {/* Recent Activity List (Last 8 merged & sorted) */}
          <RecentActivity activity={recentActivity} locale={locale} />
        </div>
      )}

      {/* TAB B: ALL FUNDS TABLE */}
      {activeTab === "funds" && (
        <div className="animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isBn ? "ক্লাবের সকল ফান্ড ব্যবস্থাপনা" : "All Club Funds"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "ফান্ড তৈরি, এডিট, স্থিতি পর্যবেক্ষণ ও পরিচালনা করুন"
                  : "Create, edit, archive, and monitor balances across all funds"}
              </p>
            </div>
          </div>
          <FundsManagementTable
            locale={locale}
            onAddFundClick={() => setFundDialogOpen(true)}
          />
        </div>
      )}

      {/* Fund Create/Edit Modal Dialog */}
      <FundFormDialog
        isOpen={fundDialogOpen}
        onClose={() => setFundDialogOpen(false)}
        isBn={isBn}
      />

      {/* Contribution Form Sheet */}
      <ContributionFormSheet
        isOpen={contributionSheetOpen}
        onClose={() => setContributionSheetOpen(false)}
        isBn={isBn}
      />

      {/* Expense Form Sheet */}
      <ExpenseFormSheet
        isOpen={expenseSheetOpen}
        onClose={() => setExpenseSheetOpen(false)}
        isBn={isBn}
      />
    </div>
  );
}
