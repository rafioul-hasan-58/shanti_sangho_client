import React from "react";
import type { PaymentMethod } from "@/lib/schemas/finance";
import { PaymentMethodLogo } from "./payment-method-logo";

interface MethodBadgeProps {
  method: PaymentMethod | string;
  className?: string;
  isBn?: boolean;
}

export function MethodBadge({ method, className = "", isBn = false }: MethodBadgeProps) {
  const normalized = (method || "").toUpperCase();

  let labelEn = "Other";
  let labelBn = "অন্যান্য";
  let colorClasses = "bg-slate-100/90 text-slate-700 border-slate-200";

  switch (normalized) {
    case "CASH":
      labelEn = "Cash";
      labelBn = "ক্যাশ";
      colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      break;
    case "BANK":
      labelEn = "Bank";
      labelBn = "ব্যাংক";
      colorClasses = "bg-blue-50 text-blue-800 border-blue-200/80";
      break;
    case "BKASH":
      labelEn = "bKash";
      labelBn = "বিকাশ";
      colorClasses = "bg-pink-50 text-[#e2136e] border-pink-200/80";
      break;
    case "NAGAD":
      labelEn = "Nagad";
      labelBn = "নগদ";
      colorClasses = "bg-amber-50 text-amber-900 border-amber-200/80";
      break;
    default:
      labelEn = "Other";
      labelBn = "অন্যান্য";
      colorClasses = "bg-purple-50 text-purple-800 border-purple-200/80";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${colorClasses} ${className}`}
    >
      <PaymentMethodLogo method={normalized} className="w-3.5 h-3.5" />
      <span>{isBn ? labelBn : labelEn}</span>
    </span>
  );
}
