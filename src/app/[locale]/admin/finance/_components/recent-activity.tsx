import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Clock, ArrowRight } from "lucide-react";
import type { RecentActivityItem } from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";
import { withLocaleHref } from "@/lib/config/adminNav";

interface RecentActivityProps {
  activity: RecentActivityItem[];
  locale: string;
}

export function RecentActivity({ activity, locale }: RecentActivityProps) {
  const isBn = locale === "bn";

  if (activity.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center py-10">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">
          {isBn ? "কোনো সাম্প্রতিক লেনদেন নেই" : "No recent activity recorded"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              {isBn ? "সাম্প্রতিক আর্থিক কার্যক্রম" : "Recent Activity"}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {isBn
                ? "সর্বশেষ অনুদান ও ব্যয়ের সমন্বিত তালিকা (৮টি)"
                : "Latest 8 contributions and expenses sorted by date"}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {activity.map((item) => {
          const isContribution = item.type === "contribution";

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Semantic Icon Circle */}
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

                {/* Title & Subtitle */}
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

              {/* Amount */}
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
    </div>
  );
}
