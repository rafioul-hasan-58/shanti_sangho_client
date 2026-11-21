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

interface FundPalette {
  cardBg: string;
  topBar: string;
  badge: string;
  progressFill: string;
  accentText: string;
  viewBtn: string;
}

const PALETTES: Record<string, FundPalette> = {
  GPL: {
    cardBg: "bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 border-emerald-300 hover:border-emerald-400",
    topBar: "from-[#004d38] via-[#006a4e] to-emerald-400",
    badge: "bg-[#006a4e] text-white shadow-xs",
    progressFill: "bg-[#006a4e]",
    accentText: "text-[#006a4e]",
    viewBtn: "bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border-emerald-200/80",
  },
  OWAG: {
    cardBg: "bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 border-amber-300 hover:border-amber-400",
    topBar: "from-[#f2b705] via-amber-500 to-orange-400",
    badge: "bg-amber-600 text-white shadow-xs",
    progressFill: "bg-amber-500",
    accentText: "text-amber-700",
    viewBtn: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/80",
  },
  SPORTS: {
    cardBg: "bg-gradient-to-br from-sky-50/95 via-white to-blue-50/80 border-sky-300 hover:border-sky-400",
    topBar: "from-sky-500 via-blue-600 to-indigo-500",
    badge: "bg-sky-600 text-white shadow-xs",
    progressFill: "bg-sky-600",
    accentText: "text-sky-700",
    viewBtn: "bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200/80",
  },
  FOOTBALL: {
    cardBg: "bg-gradient-to-br from-purple-50/95 via-white to-pink-50/80 border-purple-300 hover:border-purple-400",
    topBar: "from-purple-600 via-fuchsia-500 to-pink-500",
    badge: "bg-purple-600 text-white shadow-xs",
    progressFill: "bg-purple-600",
    accentText: "text-purple-700",
    viewBtn: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200/80",
  },
  MAINTENANCE: {
    cardBg: "bg-gradient-to-br from-teal-50/95 via-white to-cyan-50/80 border-teal-300 hover:border-teal-400",
    topBar: "from-teal-600 via-cyan-600 to-emerald-500",
    badge: "bg-teal-600 text-white shadow-xs",
    progressFill: "bg-teal-600",
    accentText: "text-teal-700",
    viewBtn: "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200/80",
  },
  OTHER: {
    cardBg: "bg-gradient-to-br from-rose-50/90 via-white to-orange-50/70 border-rose-300 hover:border-rose-400",
    topBar: "from-rose-500 via-pink-500 to-amber-500",
    badge: "bg-rose-500 text-white shadow-xs",
    progressFill: "bg-rose-500",
    accentText: "text-rose-700",
    viewBtn: "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200/80",
  },
};

const PALETTE_KEYS = ["GPL", "OWAG", "SPORTS", "FOOTBALL", "MAINTENANCE", "OTHER"];

function getFundPalette(name: string): FundPalette {
  const upper = name.toUpperCase().trim();
  if (PALETTES[upper]) return PALETTES[upper];

  // Hash fallback for any new dynamic fund
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE_KEYS.length;
  return PALETTES[PALETTE_KEYS[index]];
}

export function FundCard({ fund, locale }: FundCardProps) {
  const isBn = locale === "bn";
  const palette = getFundPalette(fund.name);

  const isLowBalance = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group ${palette.cardBg}`}
    >
      {/* Top Colorful Accent Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${palette.topBar}`} />

      <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Top: Fund Name Badge & Warning Badge */}
          <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black tracking-wide uppercase ${palette.badge}`}
            >
              {fund.name}
            </span>

            {isLowBalance && (
              <span
                className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] sm:text-[10px] font-bold shrink-0 animate-pulse"
                title="Remaining balance is below 10% of total raised"
              >
                <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700 shrink-0" />
                <span>{isBn ? "কম স্থিতি" : "Low"}</span>
              </span>
            )}
          </div>

          {/* Large Remaining Balance */}
          <div className="mb-2.5 sm:mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isBn ? "অবশিষ্ট তহবিল" : "Remaining Balance"}
            </span>
            <span className="text-base sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight tabular-nums block mt-0.5 truncate">
              {formatMoney(fund.remaining)}
            </span>
          </div>

          {/* Raised vs Spent */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 sm:py-2 border-t border-slate-200/60 gap-1 sm:gap-0">
            <div className="flex sm:flex-col justify-between sm:justify-start">
              <span className="text-slate-500 font-medium text-[10px] sm:text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>{isBn ? "সংগৃহীত" : "Raised"}</span>
              </span>
              <span className="font-black text-emerald-700 text-[11px] sm:text-xs tabular-nums">
                + {formatMoney(fund.totalIn)}
              </span>
            </div>
            <div className="flex sm:flex-col justify-between sm:justify-start sm:text-right">
              <span className="text-slate-500 font-medium text-[10px] sm:text-[11px] flex items-center gap-1 sm:justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                <span>{isBn ? "ব্যয়িত" : "Spent"}</span>
              </span>
              <span className="font-black text-[#f42a41] text-[11px] sm:text-xs tabular-nums">
                - {formatMoney(fund.totalOut)}
              </span>
            </div>
          </div>

          {/* Progress Bar (spent / raised) */}
          <div className="mt-1.5 sm:mt-2 space-y-1">
            <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isLowBalance ? "bg-amber-500" : palette.progressFill
                }`}
                style={{ width: `${Math.min(100, spentRatio)}%` }}
              />
            </div>
          </div>
        </div>

        {/* View Link as Colorful Button */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
            {spentRatio.toFixed(0)}% {isBn ? "ব্যয়িত" : "used"}
          </span>
          <Link
            href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-bold transition-all shadow-2xs group-hover:shadow-xs ${palette.viewBtn}`}
          >
            <span>{isBn ? "বিস্তারিত" : "View"}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
