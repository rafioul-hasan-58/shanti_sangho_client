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
} from "lucide-react";
import { useFinanceOverview } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import { hasDashboardAccess } from "@/lib/authRole";
import { StatCard } from "./stat-card";
import { FundCard } from "./fund-card";
import { FundCharts } from "./fund-charts";
import { RecentActivity } from "./recent-activity";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { ExpenseFormSheet } from "./expense-form-sheet";

interface FinanceOverviewClientProps {
  locale: string;
}

export function FinanceOverviewClient({ locale }: FinanceOverviewClientProps) {
  const router = useRouter();
  const isBn = locale === "bn";
  const { user, loading: authLoading } = useAuth();

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
            <div key={i} className="h-28 sm:h-32 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse" />
          ))}
          <div className="col-span-2 md:col-span-1 h-28 sm:h-32 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 sm:h-44 bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 animate-pulse" />
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

  const { totalRaised, totalSpent, totalRemaining, funds, monthlyFlow, recentActivity } =
    overview;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Page Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#006a4e] text-white shadow-xs">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isBn ? "ফাইন্যান্স ও তহবিল ব্যবস্থাপনা" : "Club Finance & Funds"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isBn
                  ? "শান্তি সংঘের সকল তহবিল, অনুদান ও ব্যয়ের পূর্ণাঙ্গ হিসাব লেজার"
                  : "Central treasury, contributions ledger, and fund balances"}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setContributionSheetOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? "অনুদান জমা" : "Add Contribution"}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpenseSheetOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Receipt className="w-4 h-4 text-[#f42a41] stroke-[2.5]" />
            <span>{isBn ? "ব্যয় যোগ" : "Add Expense"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row: 3 Stat Cards (2 per row on mobile, 3 on desktop) */}
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

      {/* 3. Fund Grid: One card per fund (2 cards per line in mobile) */}
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
          <span className="text-xs font-bold text-slate-400">
            {funds.length} {isBn ? "টি তহবিল" : "Funds"}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {funds.map((fund) => (
            <FundCard key={fund.id} fund={fund} locale={locale} />
          ))}
        </div>
      </div>

      {/* 4. Charts: Spending by Fund & 6 Months In vs Out */}
      <FundCharts funds={funds} monthlyFlow={monthlyFlow} isBn={isBn} />

      {/* 5. Recent Activity List (Last 8 merged & sorted) */}
      <RecentActivity activity={recentActivity} locale={locale} />

      {/* Reusable Form Sheets */}
      <ContributionFormSheet
        isOpen={contributionSheetOpen}
        onClose={() => setContributionSheetOpen(false)}
        isBn={isBn}
      />

      <ExpenseFormSheet
        isOpen={expenseSheetOpen}
        onClose={() => setExpenseSheetOpen(false)}
        isBn={isBn}
      />
    </div>
  );
}
