import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import type { Fund } from "@/lib/api/finance";
import { formatMoney } from "@/lib/format";
import { withLocaleHref } from "@/lib/config/adminNav";

interface FundCardProps {
  fund: Fund;
  locale: string;
}

export function FundCard({ fund, locale }: FundCardProps) {
  const isBn = locale === "bn";
  const isLowBalance = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top: Fund Name & Warning Badge */}
        <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
          <span className="font-black text-xs sm:text-sm text-slate-800 tracking-tight truncate">
            {fund.name}
          </span>
          {isLowBalance && (
            <span
              className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 text-[9px] sm:text-[10px] font-bold shrink-0"
              title="Remaining balance is below 10% of total raised"
            >
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
              <span>{isBn ? "কম স্থিতি" : "Low"}</span>
            </span>
          )}
        </div>

        {/* Large Remaining Balance */}
        <div className="mb-2.5 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {isBn ? "অবশিষ্ট উদ্বৃত্ত" : "Remaining"}
          </span>
          <span className="text-base sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight tabular-nums block mt-0.5 truncate">
            {formatMoney(fund.remaining)}
          </span>
        </div>

        {/* Raised vs Spent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 sm:py-2 border-t border-slate-100 gap-1 sm:gap-0">
          <div className="flex sm:flex-col justify-between sm:justify-start">
            <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">
              {isBn ? "সংগৃহীত" : "Raised"}
            </span>
            <span className="font-bold text-emerald-700 text-[11px] sm:text-xs tabular-nums">
              + {formatMoney(fund.totalIn)}
            </span>
          </div>
          <div className="flex sm:flex-col justify-between sm:justify-start sm:text-right">
            <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">
              {isBn ? "ব্যয়িত" : "Spent"}
            </span>
            <span className="font-bold text-[#f42a41] text-[11px] sm:text-xs tabular-nums">
              - {formatMoney(fund.totalOut)}
            </span>
          </div>
        </div>

        {/* Thin Progress Bar (spent / raised) */}
        <div className="mt-1.5 sm:mt-2 space-y-1">
          <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLowBalance ? "bg-amber-500" : "bg-[#006a4e]"
              }`}
              style={{ width: `${Math.min(100, spentRatio)}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Link */}
      <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
          {spentRatio.toFixed(0)}% {isBn ? "ব্যয়িত" : "used"}
        </span>
        <Link
          href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#006a4e] hover:text-[#004d38] group-hover:translate-x-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705] rounded-md px-1 py-0.5"
        >
          <span>{isBn ? "বিস্তারিত" : "View"}</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>
      </div>
    </div>
  );
}
