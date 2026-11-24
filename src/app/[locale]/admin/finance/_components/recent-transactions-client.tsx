"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Calendar,
  User,
  X,
  HandCoins,
  ReceiptText,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useRecentTransactions } from "@/lib/hooks/use-finance";
import type {
  RecentTransaction,
  RecentTransactionType,
  ReceiveMethod,
} from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";
import { ReceiptButton } from "./receipt-preview";
import { withLocaleHref } from "@/lib/config/adminNav";

interface RecentTransactionsClientProps {
  locale: string;
}

export function RecentTransactionsClient({ locale }: RecentTransactionsClientProps) {
  const isBn = locale === "bn";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<RecentTransactionType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Client search filter across current page items
  const displayTransactions = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const term = searchTerm.toLowerCase().trim();
    return transactions.filter((tx) => {
      const titleMatch = tx.title.toLowerCase().includes(term);
      const noteMatch = tx.note?.toLowerCase().includes(term);
      const fundMatch = tx.fund.name.toLowerCase().includes(term);
      const giverMatch = tx.donationDetails?.giverName?.toLowerCase().includes(term);
      const spentByMatch = tx.expenseDetails?.spentBy?.fullName?.toLowerCase().includes(term);
      const refMatch = tx.donationDetails?.reference?.toLowerCase().includes(term);
      return titleMatch || noteMatch || fundMatch || giverMatch || spentByMatch || refMatch;
    });
  }, [transactions, searchTerm]);

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
                  ? "সকল ফান্ডের অনুদান ও ব্যয়ের বিস্তারিত সমন্বিত ট্রানজ্যাকশন লেজার"
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
          <span>{isBn ? "রিফ্রেশ করুন" : "Refresh"}</span>
        </button>
      </div>

      {/* 2. Stat Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Transactions */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border border-indigo-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-indigo-900/70 tracking-wider block">
              {isBn ? "মোট লেনদেন সংখ্যা" : "Total Transactions"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.total)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-100/90 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
            <ReceiptText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Donations */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-900/70 tracking-wider block">
              {isBn ? "অনুদান জমা" : "Donations Count"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.totalDonations)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 text-[#006a4e] flex items-center justify-center shrink-0 shadow-2xs">
            <HandCoins className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-red-50/40 to-white border border-rose-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase text-rose-900/70 tracking-wider block">
              {isBn ? "ব্যয়ের হিসাব" : "Expenses Count"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight tabular-nums mt-0.5 block">
              {toBn(meta.totalExpenses)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100/90 text-[#f42a41] flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Type Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold gap-1 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => handleTypeChange("ALL")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              typeFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs font-black border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isBn ? "সকল কার্যক্রম" : "All Activity"}{" "}
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 text-[10px] font-extrabold text-slate-700">
              {toBn(meta.total)}
            </span>
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
            {isBn ? "অনুদানসমূহ" : "Donations"}{" "}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                typeFilter === "DONATION"
                  ? "bg-emerald-800 text-white"
                  : "bg-emerald-100/80 text-emerald-800"
              }`}
            >
              {toBn(meta.totalDonations)}
            </span>
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
            {isBn ? "ব্যয়সমূহ" : "Expenses"}{" "}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                typeFilter === "EXPENSE"
                  ? "bg-rose-800 text-white"
                  : "bg-rose-100/80 text-rose-800"
              }`}
            >
              {toBn(meta.totalExpenses)}
            </span>
          </button>
        </div>

        {/* Right: Search Box + Items Per Page */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Quick search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isBn ? "শিরোনাম, ব্যক্তি বা ফান্ড খুঁজুন..." : "Search title, person, fund..."}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Per Page Limit */}
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-slate-500 shrink-0">
            <span className="font-semibold">{isBn ? "প্রতি পেজে:" : "Per page:"}</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 cursor-pointer shadow-2xs"
            >
              <option value={10}>১০</option>
              <option value={20}>২০</option>
              <option value={50}>৫০</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Transactions Data View */}
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
                <div className="h-6 w-24 bg-slate-100 rounded" />
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
        ) : displayTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {isBn ? "কোনো ট্রানজ্যাকশন পাওয়া যায়নি" : "No transactions found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBn
                ? "বর্তমান ফিল্টারে কোনো রেকর্ড নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                : "No transactions match your current search or filter selection."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/90 bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="py-3.5 px-4">{isBn ? "ধরণ" : "Type"}</th>
                    <th className="py-3.5 px-4">{isBn ? "শিরোনাম ও ফান্ড" : "Title & Fund"}</th>
                    <th className="py-3.5 px-4">{isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}</th>
                    <th className="py-3.5 px-4">{isBn ? "সংশ্লিষ্ট ব্যক্তি" : "Person"}</th>
                    <th className="py-3.5 px-4">{isBn ? "নোট / বিবরণ" : "Note / Details"}</th>
                    <th className="py-3.5 px-4 text-right">{isBn ? "টাকার পরিমাণ" : "Amount"}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? "রসিদ" : "Receipt"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayTransactions.map((tx) => {
                    const isDonation = tx.type === "DONATION";

                    const personName = isDonation
                      ? tx.donationDetails?.giverName ||
                        tx.donationDetails?.giverMember?.fullName ||
                        (isBn ? "ক্লাব শুভাকাঙ্ক্ষী" : "Donor")
                      : tx.expenseDetails?.spentBy?.fullName || (isBn ? "অনুমোদিত কর্মকর্তা" : "Admin");

                    const personRole = isDonation
                      ? isBn
                        ? "দাতা"
                        : "Giver"
                      : isBn
                      ? "ব্যয়কারী"
                      : "Spent By";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(tx.transactionDate)}</span>
                          </div>
                        </td>

                        {/* 2. Type Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isDonation ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-black shadow-2xs">
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-emerald-700" />
                              <span>{isBn ? "অনুদান জমা" : "Donation"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200/90 text-[#f42a41] text-[11px] font-black shadow-2xs">
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{isBn ? "ব্যয়ের হিসাব" : "Expense"}</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Title & Fund */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-[260px]">
                            <span className="font-black text-slate-900 text-xs sm:text-sm block leading-snug">
                              {tx.title}
                            </span>
                            <Link
                              href={withLocaleHref(`/admin/finance/funds/${tx.fund.id}`, locale)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold border border-slate-200/60 transition-colors shrink-0"
                            >
                              <Layers className="w-3 h-3 text-[#006a4e]" />
                              <span className="truncate max-w-[180px]">{tx.fund.name}</span>
                            </Link>
                          </div>
                        </td>

                        {/* 4. Payment Method */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isDonation && tx.donationDetails?.method ? (
                            <div className="space-y-0.5">
                              <MethodBadge
                                method={tx.donationDetails.method as ReceiveMethod}
                                isBn={isBn}
                              />
                              {tx.donationDetails.reference && (
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  #{tx.donationDetails.reference}
                                </span>
                              )}
                            </div>
                          ) : isDonation ? (
                            <span className="text-slate-400 font-medium text-[11px]">—</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                              {isBn ? "ক্যাশ / ভাউচার" : "Cash / Voucher"}
                            </span>
                          )}
                        </td>

                        {/* 5. Person (Giver / Spent By) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                                isDonation
                                  ? "bg-emerald-100 text-[#006a4e]"
                                  : "bg-rose-100 text-[#f42a41]"
                              }`}
                            >
                              {personName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 text-xs block leading-tight truncate max-w-[150px]">
                                {personName}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 block">
                                {personRole}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 6. Note / Details */}
                        <td className="py-3.5 px-4">
                          {tx.note ? (
                            <span
                              className="text-slate-600 font-medium text-xs truncate max-w-[180px] block"
                              title={tx.note}
                            >
                              {tx.note}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* 7. Amount: Large & High Contrast */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isDonation ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200 font-black text-sm tabular-nums text-emerald-800 shadow-2xs">
                              + {formatMoney(tx.amount)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-50/90 border border-rose-200 font-black text-sm tabular-nums text-[#f42a41] shadow-2xs">
                              - {formatMoney(tx.amount)}
                            </span>
                          )}
                        </td>

                        {/* 8. Receipt / Action */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {!isDonation && tx.expenseDetails?.receiptUrl ? (
                            <ReceiptButton
                              receiptUrl={tx.expenseDetails.receiptUrl}
                              title={tx.title}
                              isBn={isBn}
                            />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (< md) */}
            <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
              {displayTransactions.map((tx) => {
                const isDonation = tx.type === "DONATION";

                const personName = isDonation
                  ? tx.donationDetails?.giverName ||
                    tx.donationDetails?.giverMember?.fullName ||
                    (isBn ? "ক্লাব সদস্য" : "Donor")
                  : tx.expenseDetails?.spentBy?.fullName || (isBn ? "অনুমোদিত কর্মকর্তা" : "Admin");

                const personRole = isDonation
                  ? isBn
                    ? "দাতা"
                    : "Giver"
                  : isBn
                  ? "ব্যয়কারী"
                  : "Spent By";

                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    {/* Top Row: Type Badge + Date + Amount */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isDonation ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black">
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-emerald-700" />
                            <span>{isBn ? "অনুদান জমা" : "Donation"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-[#f42a41] text-[11px] font-black">
                            <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isBn ? "ব্যয়ের হিসাব" : "Expense"}</span>
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500">
                          {formatDate(tx.transactionDate)}
                        </span>
                      </div>

                      {/* Amount Chip */}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl font-black text-sm tabular-nums shrink-0 shadow-2xs ${
                          isDonation
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border border-rose-200 text-[#f42a41]"
                        }`}
                      >
                        {isDonation ? "+ " : "- "}
                        {formatMoney(tx.amount)}
                      </span>
                    </div>

                    {/* Middle: Title & Fund */}
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-slate-900 leading-snug">
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={withLocaleHref(`/admin/finance/funds/${tx.fund.id}`, locale)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold border border-slate-200/60"
                        >
                          <Layers className="w-3 h-3 text-[#006a4e]" />
                          <span>{tx.fund.name}</span>
                        </Link>
                        {tx.note && (
                          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                            {tx.note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Person, Method, Receipt */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                            isDonation
                              ? "bg-emerald-100 text-[#006a4e]"
                              : "bg-rose-100 text-[#f42a41]"
                          }`}
                        >
                          {personName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-800 truncate text-[11px]">
                          {personName} ({personRole})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDonation && tx.donationDetails?.method && (
                          <MethodBadge
                            method={tx.donationDetails.method as ReceiveMethod}
                            isBn={isBn}
                          />
                        )}
                        {!isDonation && tx.expenseDetails?.receiptUrl && (
                          <ReceiptButton
                            receiptUrl={tx.expenseDetails.receiptUrl}
                            title={tx.title}
                            isBn={isBn}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 5. Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-bold">
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
                        {isJump && <span className="px-1 text-slate-400 font-bold">...</span>}
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
    </div>
  );
}
