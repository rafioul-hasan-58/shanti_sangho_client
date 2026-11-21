import React from "react";
import { formatMoney } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  type?: "raised" | "spent" | "remaining" | "neutral";
  icon?: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  amount,
  subtitle,
  type = "neutral",
  icon: IconComponent,
  isLoading = false,
  className = "",
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className={`p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="h-3 sm:h-4 w-16 sm:w-24 bg-slate-100 rounded-md" />
          <div className="h-6 w-6 sm:h-8 sm:w-8 bg-slate-100 rounded-lg sm:rounded-xl" />
        </div>
        <div className="h-6 sm:h-8 w-24 sm:w-36 bg-slate-200/70 rounded-md mb-1.5 sm:mb-2" />
        <div className="h-2.5 sm:h-3 w-32 sm:w-44 bg-slate-100 rounded-md" />
      </div>
    );
  }

  // Semantic styles for ledger feel
  let badgeColor = "bg-slate-100 text-slate-700";
  let sign = "";
  let TrendIcon = Wallet;

  if (type === "raised") {
    badgeColor = "bg-emerald-50 text-[#006a4e] border border-emerald-200/70";
    sign = "+ ";
    TrendIcon = ArrowUpRight;
  } else if (type === "spent") {
    badgeColor = "bg-rose-50 text-[#f42a41] border border-rose-200/70";
    sign = "- ";
    TrendIcon = ArrowDownRight;
  } else if (type === "remaining") {
    badgeColor = "bg-[#EEF8F1] text-[#006a4e] border border-[#A9DCBB]";
    TrendIcon = Wallet;
  }

  const RenderIcon = IconComponent || TrendIcon;

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </span>
          <div className={`p-1.5 sm:p-2 rounded-xl flex items-center justify-center shrink-0 ${badgeColor}`}>
            <RenderIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" aria-hidden="true" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-0.5 sm:my-1">
          <span className="text-base sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight tabular-nums truncate">
            {sign}
            {formatMoney(amount)}
          </span>
        </div>
      </div>

      {subtitle && (
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 leading-tight line-clamp-1 sm:line-clamp-none">
          {subtitle}
        </p>
      )}
    </div>
  );
}
