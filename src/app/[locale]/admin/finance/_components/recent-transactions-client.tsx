"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  X,
  Wallet,
  HandCoins,
  ReceiptText,
} from "lucide-react";
import {
  useRecentTransactions,
} from "@/lib/hooks/use-finance";
import type {
  RecentTransaction,
  RecentTransactionType,
  ReceiveMethod,
} from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";
import { withLocaleHref } from "@/lib/config/adminNav";

interface RecentTransactionsClientProps {
  locale: string;
}

export function RecentTransactionsClient({ locale }: RecentTransactionsClientProps) {
  const isBn = locale === "bn";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<RecentTransactionType>("ALL");
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useRecentTransactions({
    page,
    limit,
    type: typeFilter,
  });

  const transactions = data?.transactions || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDonations: 0,
    totalExpenses: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const toBn = (num: number | string): string => {
    if (!isBn) return String(num);
    const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).replace(/[0-9]/g, (d) => digits[Number(d)] || d);
  };

  const handleTypeChange = (newType: RecentTransactionType) => {
    setTypeFilter(newType);
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href={withLocaleHref("/admin/finance", locale)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{isBn ? "ফাইন্যান্স ড্যাশবোর্ডে ফিরুন" : "Back to Finance Dashboard"}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#006a4e] to-teal-700 text-white shadow-md shadow-[#006a4e]/20">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isBn ? "সাম্প্রতিক আর্থিক কার্যক্রম" : "Recent Financial Transactions"}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {isBn
                  ? "সকল ফান্ডের ডোনেশন ও ব্যয়ের পূর্ণাঙ্গ সমন্বিত ট্রানজ্যাকশন লেজার"
                  : "Complete combined transaction ledger across all club funds"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#006a4e]" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* 2. Stat Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Transactions */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white border border-indigo-100/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-indigo-900/70 tracking-wider block">
              {isBn ? "মোট লেনদেন সংখ্যা" : "Total Transactions"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.total)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
            <ReceiptText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Donations */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white border border-emerald-100/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-900/70 tracking-wider block">
              {isBn ? "ডোনেশন কার্যক্রম" : "Donations Count"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.totalDonations)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-[#006a4e] flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/60 via-amber-50/30 to-white border border-rose-100/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-rose-900/70 tracking-wider block">
              {isBn ? "ব্যয়ের কার্যক্রম" : "Expenses Count"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.totalExpenses)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100/80 text-[#f42a41] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs font-bold gap-1 self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTypeChange("ALL")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              typeFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isBn ? "সকল কার্যক্রম" : "All Activity"} ({toBn(meta.total)})
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("DONATION")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              typeFilter === "DONATION"
                ? "bg-[#006a4e] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            {isBn ? "ডোনেশন জমা" : "Donations"} ({toBn(meta.totalDonations)})
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              typeFilter === "EXPENSE"
                ? "bg-[#f42a41] text-white shadow-xs font-black"
                : "text-slate-600 hover:text-rose-700"
            }`}
          >
            {isBn ? "ব্যয়ের হিসাব" : "Expenses"} ({toBn(meta.totalExpenses)})
          </button>
        </div>

        {/* Limit Selector & Page Info */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>{isBn ? "প্রতি পেজে:" : "Per page:"}</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={10}>১০</option>
            <option value={20}>২০</option>
            <option value={50}>৫০</option>
          </select>
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 bg-slate-100 rounded" />
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-rose-600">
              {isBn
                ? "ট্রানজ্যাকশন ডাটা লোড করতে সমস্যা হয়েছে।"
                : "Failed to load recent transactions."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold cursor-pointer"
            >
              {isBn ? "আবার চেষ্টা করুন" : "Try Again"}
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {isBn ? "কোনো ট্রানজ্যাকশন পাওয়া যায়নি" : "No transactions found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBn
                ? "বর্তমান ফিল্টারে কোনো রেকর্ড নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                : "No transactions match your current filter selection."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isDonation = tx.type === "DONATION";
              const giverOrHandler = isDonation
                ? tx.donationDetails?.giverName
                  ? isBn
                    ? `প্রদানকারী: ${tx.donationDetails.giverName}`
                    : `Giver: ${tx.donationDetails.giverName}`
                  : null
                : tx.expenseDetails?.spentBy?.fullName
                ? isBn
                  ? `ব্যয়কারী: ${tx.expenseDetails.spentBy.fullName}`
                  : `Spent by: ${tx.expenseDetails.spentBy.fullName}`
                : null;

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: Icon, Title, Subtitle, Badges */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Semantic Icon Box */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isDonation
                          ? "bg-emerald-50 text-[#006a4e] border border-emerald-200/70"
                          : "bg-rose-50 text-[#f42a41] border border-rose-200/70"
                      }`}
                    >
                      {isDonation ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      {/* Row 1: Title + Fund Link */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                          {tx.title}
                        </span>
                        <Link
                          href={withLocaleHref(`/admin/finance/funds/${tx.fund.id}`, locale)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold shrink-0 transition-colors"
                        >
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span>{tx.fund.name}</span>
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isDonation
                              ? "bg-emerald-100/70 text-[#006a4e]"
                              : "bg-rose-100/70 text-[#f42a41]"
                          }`}
                        >
                          {isDonation
                            ? isBn
                              ? "ডোনেশন জমা"
                              : "DONATION"
                            : isBn
                            ? "ব্যয়ের হিসাব"
                            : "EXPENSE"}
                        </span>
                      </div>

                      {/* Row 2: Metadata (Date, Method, Giver/Handler, Receipt) */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="font-medium text-slate-600">
                          {formatDate(tx.transactionDate)}
                        </span>

                        {isDonation && tx.donationDetails?.method && (
                          <>
                            <span>•</span>
                            <MethodBadge
                              method={tx.donationDetails.method as ReceiveMethod}
                              isBn={isBn}
                            />
                          </>
                        )}

                        {giverOrHandler && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              {giverOrHandler}
                            </span>
                          </>
                        )}

                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[220px] text-slate-500">
                              {tx.note}
                            </span>
                          </>
                        )}

                        {!isDonation && tx.expenseDetails?.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(tx.expenseDetails!.receiptUrl!)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006a4e] hover:underline cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 ml-1"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>{isBn ? "রসিদ দেখুন" : "View Receipt"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right shrink-0 sm:pl-4">
                    <span
                      className={`text-base sm:text-lg font-black tracking-tight tabular-nums block ${
                        isDonation ? "text-emerald-700" : "text-[#f42a41]"
                      }`}
                    >
                      {isDonation ? "+ " : "- "}
                      {formatMoney(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {isBn ? "পরিমাণ (বিডিটি)" : "Amount (BDT)"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-semibold">
              {isBn
                ? `পৃষ্ঠা ${toBn(meta.page)} এর মধ্যে ${toBn(meta.totalPages)} (মোট ${toBn(
                    meta.total
                  )}টি কার্যক্রম)`
                : `Page ${meta.page} of ${meta.totalPages} (${meta.total} total transactions)`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isBn ? "পূর্ববর্তী" : "Previous"}</span>
              </button>

              {/* Page Number Chips */}
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show current page, edges, and +/- 1 page
                    return (
                      p === 1 ||
                      p === meta.totalPages ||
                      Math.abs(p - meta.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const isJump = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {isJump && <span className="px-1 text-slate-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                            p === meta.page
                              ? "bg-[#006a4e] text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {toBn(p)}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNextPage}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
              >
                <span>{isBn ? "পরবর্তী" : "Next"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Receipt Image Preview Modal */}
      {previewReceiptUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewReceiptUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3 animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "ভাউচার / রসিদের ছবি" : "Expense Receipt"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewReceiptUrl}
                alt="Receipt Preview"
                className="max-h-[70vh] object-contain w-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
