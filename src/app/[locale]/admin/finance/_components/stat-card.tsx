import React from "react";
import { formatMoney } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Wallet, LucideIcon } from "lucide-react";

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

  // Colorful palette per stat card type
  let cardBg = "bg-gradient-to-br from-slate-50 via-white to-slate-100/70 border-slate-200/90";
  let topBar = "from-slate-500 via-slate-600 to-slate-400";
  let iconBox = "bg-slate-700 text-white shadow-xs";
  let titleColor = "text-slate-600";
  let amountColor = "text-slate-900";
  let sign = "";
  let TrendIcon = Wallet;

  if (type === "raised") {
    cardBg = "bg-gradient-to-br from-emerald-50/95 via-white to-emerald-100/50 border-emerald-300 hover:border-emerald-400";
    topBar = "from-[#004d38] via-[#006a4e] to-emerald-400";
    iconBox = "bg-gradient-to-tr from-[#006a4e] to-emerald-500 text-white shadow-md shadow-emerald-700/20";
    titleColor = "text-[#004d38]";
    amountColor = "text-[#006a4e]";
    sign = "+ ";
    TrendIcon = ArrowUpRight;
  } else if (type === "spent") {
    cardBg = "bg-gradient-to-br from-rose-50/95 via-white to-pink-100/50 border-rose-300 hover:border-rose-400";
    topBar = "from-rose-600 via-[#f42a41] to-pink-500";
    iconBox = "bg-gradient-to-tr from-[#f42a41] to-rose-500 text-white shadow-md shadow-rose-700/20";
    titleColor = "text-rose-900";
    amountColor = "text-[#f42a41]";
    sign = "- ";
    TrendIcon = ArrowDownRight;
  } else if (type === "remaining") {
    cardBg = "bg-gradient-to-br from-[#fbf8ee] via-white to-emerald-50/70 border-amber-300/90 hover:border-amber-400";
    topBar = "from-[#f2b705] via-amber-500 to-[#006a4e]";
    iconBox = "bg-gradient-to-tr from-[#f2b705] to-amber-500 text-[#12231d] shadow-md shadow-amber-600/20";
    titleColor = "text-amber-900";
    amountColor = "text-slate-900";
    TrendIcon = Wallet;
  }

  const RenderIcon = IconComponent || TrendIcon;

  return (
    <div
      className={`rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${cardBg} ${className}`}
    >
      {/* Top Colorful Accent Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${topBar}`} />

      <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider truncate ${titleColor}`}>
              {title}
            </span>
            <div className={`p-1.5 sm:p-2 rounded-xl flex items-center justify-center shrink-0 ${iconBox}`}>
              <RenderIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline gap-1 my-0.5 sm:my-1">
            <span className={`text-base sm:text-2xl md:text-3xl font-black tracking-tight tabular-nums truncate ${amountColor}`}>
              {sign}
              {formatMoney(amount)}
            </span>
          </div>
        </div>

        {subtitle && (
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 leading-tight line-clamp-1 sm:line-clamp-none">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
