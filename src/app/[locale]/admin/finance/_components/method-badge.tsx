import React from "react";
import type { PaymentMethod } from "@/lib/schemas/finance";

interface MethodBadgeProps {
  method: PaymentMethod | string;
  className?: string;
  isBn?: boolean;
}

export function MethodBadge({ method, className = "", isBn = false }: MethodBadgeProps) {
  const normalized = (method || "").toUpperCase();

  let labelEn = "Other";
  let labelBn = "অন্যান্য";
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";

  switch (normalized) {
    case "CASH":
      labelEn = "Cash";
      labelBn = "নগদ ক্যাশ";
      colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
      dotColor = "bg-emerald-600";
      break;
    case "BANK":
      labelEn = "Bank";
      labelBn = "ব্যাংক";
      colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
      dotColor = "bg-blue-600";
      break;
    case "BKASH":
      labelEn = "bKash";
      labelBn = "বিকাশ";
      colorClasses = "bg-pink-50 text-[#e2136e] border-pink-200";
      dotColor = "bg-[#e2136e]";
      break;
    case "NAGAD":
      labelEn = "Nagad";
      labelBn = "নগদ";
      colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
      dotColor = "bg-amber-600";
      break;
    default:
      labelEn = "Other";
      labelBn = "অন্যান্য";
      colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
      dotColor = "bg-slate-400";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{isBn ? labelBn : labelEn}</span>
    </span>
  );
}
