"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowRight,
  Receipt,
  FileText,
  UserCheck,
} from "lucide-react";
import type { RecentActivityItem, RecentTransaction, ReceiveMethod } from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";
import { withLocaleHref } from "@/lib/config/adminNav";
import { useRecentTransactions } from "@/lib/hooks/use-finance";

interface RecentActivityProps {
  activity?: RecentActivityItem[];
  locale: string;
}

export function RecentActivity({ activity, locale }: RecentActivityProps) {
  const isBn = locale === "bn";

  // Fetch real latest 8 recent transactions from GET /funds/recent-transactions
  const { data, isLoading } = useRecentTransactions({ limit: 8, type: "ALL" });

  const transactions = data?.transactions;
  const hasApiTransactions = Boolean(transactions && transactions.length > 0);
  const hasFallbackActivity = Boolean(activity && activity.length > 0);

  const viewAllHref = withLocaleHref("/admin/finance/recent-transactions", locale);

  if (isLoading && !hasFallbackActivity) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="h-6 w-48 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-7 w-28 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasApiTransactions && !hasFallbackActivity) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center py-10 space-y-3">
        <Clock className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-400">
          {isBn ? "কোনো সাম্প্রতিক লেনদেন নেই" : "No recent activity recorded"}
        </p>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006a4e] hover:underline"
        >
          <span>{isBn ? "সকল লেনদেন দেখুন" : "View all transactions"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#006a4e] border border-emerald-100 shadow-2xs">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
              {isBn ? "সাম্প্রতিক আর্থিক কার্যক্রম" : "Recent Financial Activity"}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              {isBn
                ? "সর্বশেষ ৮টি লেনদেনের সারসংক্ষেপ"
                : "Latest 8 contributions & expenses sorted by date"}
            </p>
          </div>
        </div>

        {/* View All Button */}
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#006a4e] border border-emerald-200/80 text-xs font-black transition-all shrink-0 active:scale-95 shadow-2xs"
        >
          <span>{isBn ? "সকল কার্যক্রম দেখুন" : "View All Transactions"}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {hasApiTransactions
          ? transactions!.map((tx) => {
              const isDonation = tx.type === "DONATION";
              const giverOrHandler = isDonation
                ? tx.donationDetails?.giverName
                  ? isBn
                    ? `দাতা: ${tx.donationDetails.giverName}`
                    : `Giver: ${tx.donationDetails.giverName}`
                  : null
                : tx.expenseDetails?.spentBy?.fullName
                ? isBn
                  ? `পরিচালনা: ${tx.expenseDetails.spentBy.fullName}`
                  : `By: ${tx.expenseDetails.spentBy.fullName}`
                : null;

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Semantic Icon Circle */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isDonation
                          ? "bg-emerald-50 text-[#006a4e] border border-emerald-200/60"
                          : "bg-rose-50 text-[#f42a41] border border-rose-200/60"
                      }`}
                    >
                      {isDonation ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 truncate block">
                          {tx.title}
                        </span>
                        <Link
                          href={withLocaleHref(`/admin/finance/funds/${tx.fund.id}`, locale)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 transition-colors"
                        >
                          {tx.fund.name}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="font-medium">{formatDate(tx.transactionDate)}</span>
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
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate hidden sm:inline max-w-[200px] text-slate-500 font-medium">
                              {giverOrHandler}
                            </span>
                          </>
                        )}
                        {tx.note && !giverOrHandler && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate hidden sm:inline max-w-[200px] text-slate-400">
                              {tx.note}
                            </span>
                          </>
                        )}
                        {!isDonation && tx.expenseDetails?.receiptUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                            <Receipt className="w-2.5 h-2.5" />
                            {isBn ? "রসিদ" : "Receipt"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs sm:text-sm tabular-nums block ${
                        isDonation ? "text-emerald-700" : "text-[#f42a41]"
                      }`}
                    >
                      {isDonation ? "+ " : "- "}
                      {formatMoney(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          : activity!.map((item) => {
              const isContribution = item.type === "contribution";

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isContribution
                          ? "bg-emerald-50 text-[#006a4e]"
                          : "bg-rose-50 text-[#f42a41]"
                      }`}
                    >
                      {isContribution ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 truncate block">
                          {item.title}
                        </span>
                        <Link
                          href={withLocaleHref(`/admin/finance/funds/${item.fundId}`, locale)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold shrink-0 transition-colors"
                        >
                          {item.fundName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatDate(item.date)}</span>
                        {item.method && (
                          <>
                            <span>•</span>
                            <MethodBadge method={item.method} isBn={isBn} />
                          </>
                        )}
                        {item.subtitle && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate hidden sm:inline max-w-[200px]">
                              {item.subtitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs sm:text-sm tabular-nums block ${
                        isContribution ? "text-emerald-700" : "text-[#f42a41]"
                      }`}
                    >
                      {isContribution ? "+ " : "- "}
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-slate-400">
          {isBn ? "সর্বশেষ ৮টি লেনদেন প্রদর্শিত হচ্ছে" : "Showing latest 8 transactions"}
        </span>
      </div>
    </div>
  );
}
