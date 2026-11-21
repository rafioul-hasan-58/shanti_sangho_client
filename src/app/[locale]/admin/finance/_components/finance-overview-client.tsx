"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Receipt,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Coins,
  LayoutDashboard,
  FolderTree,
  FileSpreadsheet,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import { useFinanceOverview } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import { hasDashboardAccess } from "@/lib/authRole";
import { formatMoney } from "@/lib/format";
import { StatCard } from "./stat-card";
import { FundCard } from "./fund-card";
import { FundCharts } from "./fund-charts";
import { RecentActivity } from "./recent-activity";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { FundFormDialog } from "./fund-form-dialog";
import { FundsManagementTable } from "./funds-management-table";
import { ContributionsTable } from "./contributions-table";
import { ExpensesTable } from "./expenses-table";

interface FinanceOverviewClientProps {
  locale: string;
}

type FinanceTab = "overview" | "funds" | "contributions" | "expenses";

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
                {isBn ? "ফাইন্যান্স ও তহবিল ব্যবস্থাপনা" : "Club Finance & Treasury"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isBn
                  ? "শান্তি সংঘের সকল তহবিল, অনুদান ও ব্যয়ের পূর্ণাঙ্গ হিসাব লেজার"
                  : "Central treasury, contributions ledger, and fund balances"}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Add Fund, Add Contribution, Add Expense */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Add Fund */}
          <button
            type="button"
            onClick={() => setFundDialogOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 active:scale-95 text-[#006a4e] text-xs sm:text-sm font-black shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006a4e]"
          >
            <FolderPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? "নতুন তহবিল" : "Add Fund"}</span>
          </button>

          {/* Add Contribution */}
          <button
            type="button"
            onClick={() => setContributionSheetOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-[#006a4e]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? "অনুদান জমা" : "Add Contribution"}</span>
          </button>

          {/* Add Expense */}
          <button
            type="button"
            onClick={() => setExpenseSheetOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-800 text-xs sm:text-sm font-black shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Receipt className="w-4 h-4 text-[#f42a41] stroke-[2.5]" />
            <span>{isBn ? "ব্যয় যোগ" : "Add Expense"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl w-full sm:w-auto overflow-x-auto border border-slate-200/60 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "overview"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{isBn ? "সামগ্রিক চিত্র" : "Overview"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("funds")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "funds"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>{isBn ? "সকল তহবিল" : "All Funds"}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-extrabold">
            {funds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contributions")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "contributions"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? "অনুদান হিসাব" : "Contributions"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "expenses"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-[#f42a41]" />
          <span>{isBn ? "ব্যয়ের খতিয়ান" : "Expenses"}</span>
        </button>
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
                  ? "সকল তহবিলের সম্মিলিত অনুদান ও স্পনসরশিপ"
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
                  {isBn ? "সকল তহবিল ও ব্যালেন্স" : "Club Funds & Balances"}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? "প্রতিটি তহবিলের বর্তমান স্থিতি ও ব্যয়ের অনুপাত"
                    : "Active funds with remaining balances and progress"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("funds")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#006a4e] hover:underline cursor-pointer"
              >
                <span>{isBn ? "তহবিল টেবিল দেখুন" : "Manage All Funds"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
                {isBn ? "ক্লাবের সকল তহবিল ব্যবস্থাপনা" : "All Club Funds"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "তহবিল তৈরি, সম্পাদনা, স্থিতি পর্যবেক্ষণ ও অ্যাক্টিভেশন পরিচালনা করুন"
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

      {/* TAB C: CONTRIBUTIONS */}
      {activeTab === "contributions" && (
        <div className="animate-fadeIn space-y-4">
          {/* Header Pill & Summary */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 rounded-2xl border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                {isBn ? "মোট জমাকৃত অনুদান লেজার" : "Contributions Ledger"}
              </span>
              <p className="text-xs text-slate-600 font-medium">
                {isBn
                  ? "দাতা ও সদস্যদের থেকে প্রাপ্ত সকল অনুদান এবং ব্যাংকিং রেফারেন্স"
                  : "All received donations, sponsorships, and fees recorded in funds"}
              </p>
            </div>

            {/* Sum Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-xs shrink-0">
              <span className="text-emerald-100 text-xs font-semibold">
                {isBn ? "মোট সংগৃহীত:" : "Total Raised:"}
              </span>
              <span className="tabular-nums">{formatMoney(totalRaised)}</span>
            </div>
          </div>

          <ContributionsTable
            isBn={isBn}
            onAddClick={() => setContributionSheetOpen(true)}
          />
        </div>
      )}

      {/* TAB D: EXPENSES */}
      {activeTab === "expenses" && (
        <div className="animate-fadeIn space-y-4">
          {/* Header Pill & Summary */}
          <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-4 rounded-2xl border border-rose-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#f42a41] block">
                {isBn ? "ক্লাবের সকল ব্যয়ের খতিয়ান" : "Expenditures Ledger"}
              </span>
              <p className="text-xs text-slate-600 font-medium">
                {isBn
                  ? "ক্লাবের তহবিল থেকে খরচের সকল ভাউচার এবং রসিদের হিসাব"
                  : "Complete outflow vouchers, operational costs, and receipts"}
              </p>
            </div>

            {/* Sum Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f42a41] text-white font-black text-sm shadow-xs shrink-0">
              <span className="text-rose-100 text-xs font-semibold">
                {isBn ? "মোট ব্যয়িত:" : "Total Spent:"}
              </span>
              <span className="tabular-nums">{formatMoney(totalSpent)}</span>
            </div>
          </div>

          <ExpensesTable
            isBn={isBn}
            onAddClick={() => setExpenseSheetOpen(true)}
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
