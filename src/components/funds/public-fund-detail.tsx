"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShieldCheck,
  Receipt,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  User,
} from "lucide-react";
import { useFund, useContributions, useExpenses } from "@/lib/hooks/use-finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "@/app/[locale]/admin/finance/_components/method-badge";
import { ReceiptButton } from "@/app/[locale]/admin/finance/_components/receipt-preview";
import { withLocaleHref } from "@/lib/config/adminNav";

interface PublicFundDetailProps {
  fundId: string;
  locale: string;
}

export default function PublicFundDetail({ fundId, locale }: PublicFundDetailProps) {
  const isBn = locale === "bn";
  const { data: fund, isLoading: isLoadingFund, isError: isErrorFund, refetch: refetchFund } = useFund(fundId);

  const [activeTab, setActiveTab] = useState<"contributions" | "expenses">("contributions");

  const { data: contributionsData, isLoading: isLoadingContributions } = useContributions({
    fundId,
    limit: 50,
  });

  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses({
    fundId,
    limit: 50,
  });

  const contributions = contributionsData?.data || [];
  const expenses = expensesData?.data || [];

  if (isLoadingFund) {
    return (
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-44 bg-slate-200/80 rounded-lg animate-pulse" />
        <div className="h-44 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
        <div className="h-80 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
      </div>
    );
  }

  if (isErrorFund || !fund) {
    return (
      <div className="py-16 px-4 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#f42a41] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {isBn ? "তহবিলের তথ্য পাওয়া যায়নি" : "Fund Not Found"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {isBn
            ? "অনুগ্রহ করে লিংকটি সঠিক কিনা নিশ্চিত করুন অথবা সকল তহবিলের পাতায় ফিরে যান।"
            : "The requested fund could not be located or may have been archived."}
        </p>
        <Link
          href={withLocaleHref("/funds", locale)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006a4e] text-white text-xs font-black shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "সকল তহবিলের তালিকায় ফিরুন" : "Back to All Funds"}</span>
        </Link>
      </div>
    );
  }

  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Breadcrumb and Back Navigation */}
      <div>
        <Link
          href={withLocaleHref("/funds", locale)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors group mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{isBn ? "সকল তহবিলের তালিকায় ফিরুন" : "Back to Funds Directory"}</span>
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#006a4e] text-white">
                {fund.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#006a4e]">
                <CheckCircle className="w-3 h-3" />
                <span>{isBn ? "উন্মুক্ত খতিয়ান" : "Public Ledger"}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {fund.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Raised */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {isBn ? "মোট সংগৃহীত অনুদান" : "Total Raised"}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-[#006a4e] shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
            + {formatMoney(fund.totalIn)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {fund.summary?.contributionsCount ?? 0} {isBn ? "টি অনুদান" : "contributions"}
          </span>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {isBn ? "মোট ব্যয়িত অর্থ" : "Total Spent"}
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-[#f42a41] shrink-0">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#f42a41] tabular-nums">
            - {formatMoney(fund.totalOut)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {fund.summary?.expensesCount ?? 0} {isBn ? "টি খরচের ভাউচার" : "expenses"}
          </span>
        </div>

        {/* Remaining Net Balance */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#006a4e] to-[#004d38] text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
              {isBn ? "বর্তমান স্থিতি" : "Net Balance"}
            </span>
            <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tabular-nums">
            {formatMoney(fund.remaining)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#f2b705]"
                style={{ width: `${Math.min(100, spentRatio)}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-100 font-medium block">
              {spentRatio.toFixed(0)}% {isBn ? "ব্যয়িত হয়েছে" : "budget utilized"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Public Ledger Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("contributions")}
            className={`pb-3 px-2 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "contributions"
                ? "border-[#006a4e] text-[#006a4e]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{isBn ? "জমাকৃত অনুদানসমূহ" : "Contributions"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#006a4e] text-[10px] font-bold">
              {contributions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`pb-3 px-2 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "expenses"
                ? "border-[#f42a41] text-[#f42a41]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isBn ? "ব্যয়ের খতিয়ান ও ভাউচার" : "Expenses & Vouchers"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-[#f42a41] text-[10px] font-bold">
              {expenses.length}
            </span>
          </button>
        </div>

        {/* TAB 1: CONTRIBUTIONS TABLE */}
        {activeTab === "contributions" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden animate-fadeIn">
            {isLoadingContributions ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isBn ? "এখনও কোন অনুদান জমা হয়নি" : "No contributions logged yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">{isBn ? "তারিখ" : "Date"}</th>
                      <th className="py-3 px-4">{isBn ? "দাতা / সদস্য" : "Giver / Member"}</th>
                      <th className="py-3 px-4">{isBn ? "পরিমাণ" : "Amount"}</th>
                      <th className="py-3 px-4">{isBn ? "পেমেন্ট মাধ্যম" : "Method"}</th>
                      <th className="py-3 px-4">{isBn ? "রেফারেন্স ও বিবরণ" : "Reference"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">
                          {formatDate(c.receivedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {c.giverName || (isBn ? "অজ্ঞাত সদস্য" : "Anonymous Member")}
                              </span>
                              {c.giverMember?.village && (
                                <span className="text-[10px] text-slate-400">
                                  {c.giverMember.village}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 tabular-nums font-black text-emerald-700 text-sm whitespace-nowrap">
                          + {formatMoney(c.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <MethodBadge method={c.method} />
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {c.reference ? (
                            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold block mb-0.5">
                              {c.reference}
                            </span>
                          ) : null}
                          {c.note && <span className="text-[11px] text-slate-500">{c.note}</span>}
                          {!c.reference && !c.note && <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPENSES TABLE */}
        {activeTab === "expenses" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden animate-fadeIn">
            {isLoadingExpenses ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  {isBn ? "এখনও কোন খরচের রেকর্ড নেই" : "No expenses recorded yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">{isBn ? "তারিখ" : "Date"}</th>
                      <th className="py-3 px-4">{isBn ? "ব্যয়ের খাত" : "Spent On"}</th>
                      <th className="py-3 px-4">{isBn ? "পরিমাণ" : "Amount"}</th>
                      <th className="py-3 px-4">{isBn ? "রসিদ / ভাউচার" : "Receipt"}</th>
                      <th className="py-3 px-4">{isBn ? "মন্তব্য" : "Note"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">
                          {formatDate(e.spentAt)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {e.spentOn}
                        </td>
                        <td className="py-3 px-4 tabular-nums font-black text-[#f42a41] text-sm whitespace-nowrap">
                          - {formatMoney(e.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <ReceiptButton
                            receiptUrl={e.receiptUrl}
                            title={e.spentOn}
                            isBn={isBn}
                          />
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {e.note || <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
