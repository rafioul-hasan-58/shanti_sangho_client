"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  MoreVertical,
  Edit3,
  Trash2,
  Power,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Fund } from "@/lib/api/finance";
import { formatMoney } from "@/lib/format";
import { withLocaleHref } from "@/lib/config/adminNav";
import { useUpdateFund, useDeleteFund } from "@/lib/hooks/use-finance";
import { FundFormDialog } from "./fund-form-dialog";

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

function getFundPalette(categoryOrName: string): FundPalette {
  const upper = categoryOrName.toUpperCase().trim();
  if (PALETTES[upper]) return PALETTES[upper];

  // Try partial match
  for (const key of PALETTE_KEYS) {
    if (upper.includes(key)) return PALETTES[key];
  }

  // Hash fallback
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
  const category = (fund.category || "OTHER").toUpperCase();
  const palette = getFundPalette(category);

  const updateFundMutation = useUpdateFund();
  const deleteFundMutation = useDeleteFund();

  // 3-dot dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dialog & Modal states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const isLowBalance = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  const hasTransactions =
    (fund.summary?.contributionsCount ?? 0) > 0 ||
    (fund.summary?.expensesCount ?? 0) > 0;

  // Toggle active/inactive
  const handleToggleActive = async () => {
    try {
      await updateFundMutation.mutateAsync({
        id: fund.id,
        payload: {
          isActive: !fund.isActive,
        },
      });
    } catch (err) {
      console.error("Failed to toggle fund status:", err);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    setDeleteError(null);
    if (hasTransactions) {
      setDeleteError(
        isBn
          ? "এই তহবিলে লেনদেনের রেকর্ড রয়েছে, তাই এটি মুছে ফেলা সম্ভব নয়। রেকর্ড অক্ষুণ্ণ রাখতে নিষ্ক্রিয় (Inactive) করুন।"
          : "Deletion blocked: This fund has active financial records. Please deactivate it instead."
      );
      return;
    }

    try {
      await deleteFundMutation.mutateAsync(fund.id);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setDeleteError(
        err?.message ||
          (isBn ? "তহবিল ডিলিট করা যায়নি।" : "Failed to delete fund.")
      );
    }
  };

  return (
    <>
      <div
        className={`rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${palette.cardBg} ${
          menuOpen ? "relative z-30 overflow-visible" : "overflow-hidden"
        }`}
      >
        {/* Top Colorful Accent Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r rounded-t-2xl ${palette.topBar}`} />

        <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-1">
          <div>
            {/* Top: Category Badge, Low Balance Warning & 3-Dot Action Menu */}
            <div className="flex items-center justify-between gap-1.5 mb-2 relative">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black tracking-wider uppercase ${palette.badge}`}
                >
                  {category}
                </span>

                {!fund.isActive && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-200 text-slate-600">
                    {isBn ? "ডিজেবল" : "Inactive"}
                  </span>
                )}

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

              {/* 3-Dot Action Menu */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Fund actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold animate-in fade-in zoom-in-95"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{isBn ? "এডিট করুন" : "Edit Fund"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        handleToggleActive();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <Power
                        className={`w-3.5 h-3.5 shrink-0 ${
                          fund.isActive ? "text-amber-600" : "text-emerald-600"
                        }`}
                      />
                      <span>
                        {fund.isActive
                          ? isBn
                            ? "ডিজেবল করুন"
                            : "Deactivate"
                          : isBn
                          ? "এনাবল করুন"
                          : "Activate"}
                      </span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteError(null);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{isBn ? "ডিলিট করুন" : "Delete Fund"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Fund Name (Descriptive Title) */}
            <h3
              className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 min-h-[32px] sm:min-h-[38px] mb-2 group-hover:text-[#006a4e] transition-colors"
              title={fund.name}
            >
              {fund.name}
            </h3>

            {/* Large Remaining Balance */}
            <div className="mb-2.5 sm:mb-3">
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

      {/* Edit Fund Dialog */}
      <FundFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fundToEdit={fund}
        isBn={isBn}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl ${
                    hasTransactions
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {hasTransactions
                      ? isBn
                        ? "তহবিল ডিলিট করা যাবে না"
                        : "Deletion Blocked"
                      : isBn
                      ? "তহবিলটি ডিলিট করতে চান?"
                      : "Delete Fund Permanently?"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {fund.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content / Warning */}
            {hasTransactions ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-2">
                <p className="font-bold">
                  {isBn
                    ? "এই তহবিলে আর্থিক লেনদেন সংরক্ষিত আছে:"
                    : "This fund contains recorded financial transactions:"}
                </p>
                <ul className="list-disc pl-5 space-y-1 font-medium">
                  <li>
                    {isBn
                      ? `মোট অনুদান: ${fund.summary?.contributionsCount ?? 0} টি`
                      : `Total contributions: ${fund.summary?.contributionsCount ?? 0}`}
                  </li>
                  <li>
                    {isBn
                      ? `মোট ব্যয়: ${fund.summary?.expensesCount ?? 0} টি`
                      : `Total expenses: ${fund.summary?.expensesCount ?? 0}`}
                  </li>
                </ul>
                <p className="font-bold pt-1 text-amber-950">
                  {isBn
                    ? "অডিট রেকর্ডের জন্য এই ফান্ডটি ডিলিট করা যাবে না। এর পরিবর্তে ফান্ডটি ডিজেবল (Disable) করে রাখতে পারেন।"
                    : "To preserve financial audit records, this fund cannot be deleted. You can deactivate it instead."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBn
                  ? `আপনি কি নিশ্চিত যে "${fund.name}" ফান্ডটি ডিলিট করতে চান? এতে কোনো লেনদেন নেই। ডিলিট করলে এটি আর ফেরত পাওয়া যাবে না।`
                  : `Are you sure you want to delete "${fund.name}"? This empty fund has no transactions and this action cannot be undone.`}
              </p>
            )}

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>

              {hasTransactions ? (
                <button
                  type="button"
                  onClick={async () => {
                    await handleToggleActive();
                    setIsDeleteModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {fund.isActive
                    ? isBn
                      ? "ডিজেবল করুন"
                      : "Deactivate Fund"
                    : isBn
                    ? "বন্ধ করুন"
                    : "Close"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteFundMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {deleteFundMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isBn ? "ডিলিট হচ্ছে..." : "Deleting..."}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
