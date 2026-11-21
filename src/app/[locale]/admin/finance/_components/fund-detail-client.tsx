"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { useFund } from "@/lib/hooks/use-finance";
import { formatMoney } from "@/lib/format";
import { ContributionsTable } from "./contributions-table";
import { ExpensesTable } from "./expenses-table";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { withLocaleHref } from "@/lib/config/adminNav";

interface FundDetailClientProps {
  fundId: string;
  locale: string;
}

export function FundDetailClient({ fundId, locale }: FundDetailClientProps) {
  const router = useRouter();
  const isBn = locale === "bn";
  const { data: fund, isLoading, isError } = useFund(fundId);

  const [activeTab, setActiveTab] = useState<"contributions" | "expenses">(
    "contributions"
  );
  const [contributionSheetOpen, setContributionSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-44 bg-slate-200/80 rounded-lg animate-pulse" />
        <div className="h-36 bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse" />
      </div>
    );
  }

  if (isError || !fund) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center space-y-4">
          <p className="text-sm font-bold text-rose-600">
            {isBn ? "তহবিলের তথ্য পাওয়া যায়নি।" : "Fund not found."}
          </p>
          <Link
            href={withLocaleHref("/admin/finance", locale)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? "ফাইন্যান্স ও তহবিলে ফিরুন" : "Back to Finance"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isLowBalance = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href={withLocaleHref("/admin/finance", locale)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors group mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{isBn ? "ফাইন্যান্স ওভারভিউতে ফিরুন" : "Back to Finance Overview"}</span>
        </Link>
      </div>

      {/* Fund Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Fund Info & Remaining */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#006a4e] text-white font-black text-xs uppercase tracking-wider shadow-xs">
              {fund.category || "OTHER"}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {fund.name}
            </h1>
            {isLowBalance && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isBn ? "কম উদ্বৃত্ত (<১০%)" : "Low Balance (<10%)"}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {isBn
              ? "এই তহবিলের সকল সংগ্রহ ও খরচের সার্বিক বিবরণী"
              : "Complete ledger of contributions and expenditures for this fund"}
          </p>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isBn ? "বর্তমান অবশিষ্ট উদ্বৃত্ত" : "Remaining Balance"}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-tight">
              {formatMoney(fund.remaining)}
            </span>
          </div>
        </div>

        {/* Right: Raised vs Spent Mini-stats & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Mini stats box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 sm:gap-6">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? "মোট সংগ্রহ" : "Total Raised"}
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-700 tabular-nums">
                + {formatMoney(fund.totalIn)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? "মোট ব্যয়" : "Total Spent"}
              </span>
              <span className="text-sm sm:text-base font-black text-[#f42a41] tabular-nums">
                - {formatMoney(fund.totalOut)}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContributionSheetOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? "অনুদান জমা" : "Add Contribution"}</span>
            </button>

            <button
              type="button"
              onClick={() => setExpenseSheetOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#f42a41]" />
              <span>{isBn ? "ব্যয় যোগ" : "Add Expense"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar of Spent vs Raised */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{isBn ? "ব্যয়ের অগ্রগতি" : "Budget Utilization"}</span>
          <span className="tabular-nums">
            {spentRatio.toFixed(1)}% {isBn ? "ব্যয়িত" : "utilized"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLowBalance ? "bg-amber-500" : "bg-[#006a4e]"
            }`}
            style={{ width: `${Math.min(100, spentRatio)}%` }}
          />
        </div>
      </div>

      {/* Tabs: Contributions | Expenses */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("contributions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "contributions"
                ? "bg-[#006a4e] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isBn ? "অনুদানের তালিকা (Contributions)" : "Contributions"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "expenses"
                ? "bg-[#006a4e] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isBn ? "ব্যয়ের তালিকা (Expenses)" : "Expenses"}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "contributions" ? (
          <ContributionsTable
            fundId={fund.id}
            isBn={isBn}
            onAddClick={() => setContributionSheetOpen(true)}
          />
        ) : (
          <ExpensesTable
            fundId={fund.id}
            isBn={isBn}
            onAddClick={() => setExpenseSheetOpen(true)}
          />
        )}
      </div>

      {/* Reusable Sheets */}
      <ContributionFormSheet
        isOpen={contributionSheetOpen}
        onClose={() => setContributionSheetOpen(false)}
        defaultFundId={fund.id}
        isBn={isBn}
      />

      <ExpenseFormSheet
        isOpen={expenseSheetOpen}
        onClose={() => setExpenseSheetOpen(false)}
        defaultFundId={fund.id}
        isBn={isBn}
      />
    </div>
  );
}
