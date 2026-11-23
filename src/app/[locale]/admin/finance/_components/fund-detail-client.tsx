"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  MoreVertical,
  Edit3,
  Trash2,
  Power,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useFund, useUpdateFund, useDeleteFund } from "@/lib/hooks/use-finance";
import { formatMoney, formatFundCategory } from "@/lib/format";
import { ContributionsTable } from "./contributions-table";
import { ExpensesTable } from "./expenses-table";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { FundFormDialog } from "./fund-form-dialog";
import { withLocaleHref } from "@/lib/config/adminNav";

interface FundDetailClientProps {
  fundId: string;
  locale: string;
}

export function FundDetailClient({ fundId, locale }: FundDetailClientProps) {
  const router = useRouter();
  const isBn = locale === "bn";
  const { data: fund, isLoading, isError } = useFund(fundId);
  const updateFundMutation = useUpdateFund();
  const deleteFundMutation = useDeleteFund();

  const [activeTab, setActiveTab] = useState<"contributions" | "expenses">(
    "contributions"
  );
  const [contributionSheetOpen, setContributionSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  // Fund 3-dot menu & dialog states
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-44 bg-slate-200/80 rounded-lg animate-pulse" />
        <div className="h-36 bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse" />
      </div>
    );
  }

  if (isError || !fund) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center space-y-4">
          <p className="text-sm font-bold text-rose-600">
            {isBn ? "ফান্ডের তথ্য পাওয়া যায়নি।" : "Fund not found."}
          </p>
          <Link
            href={withLocaleHref("/admin/finance", locale)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? "ফাইন্যান্স ও ফান্ডে ফিরুন" : "Back to Finance"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isLowBalance = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
  const spentRatio = fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href={withLocaleHref("/admin/finance", locale)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006a4e] transition-colors group mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{isBn ? "ফাইন্যান্স ওভারভিউতে ফিরুন" : "Back to Finance Overview"}</span>
        </Link>
      </div>

      {/* Fund Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Fund Info & Remaining */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#006a4e] text-white font-bold text-xs tracking-wide shadow-xs">
              {formatFundCategory(fund.category, isBn)}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {fund.name}
            </h1>
            {isLowBalance && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isBn ? "কম উদ্বৃত্ত (<১০%)" : "Low Balance (<10%)"}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {isBn
              ? "এই ফান্ডের সকল সংগ্রহ ও খরচের সার্বিক বিবরণী"
              : "Complete ledger of contributions and expenditures for this fund"}
          </p>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isBn ? "বর্তমান অবশিষ্ট উদ্বৃত্ত" : "Remaining Balance"}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums tracking-tight">
              {formatMoney(fund.remaining)}
            </span>
          </div>
        </div>

        {/* Right: Raised vs Spent Mini-stats & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Mini stats box: 50-50 width on mobile */}
          <div className="w-full sm:w-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
            <div className="flex-1 text-center sm:text-left space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? "মোট সংগ্রহ" : "Total Raised"}
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-700 tabular-nums">
                + {formatMoney(fund.totalIn)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 shrink-0" />
            <div className="flex-1 text-center sm:text-left space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBn ? "মোট ব্যয়" : "Total Spent"}
              </span>
              <span className="text-sm sm:text-base font-black text-[#f42a41] tabular-nums">
                - {formatMoney(fund.totalOut)}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setContributionSheetOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? "ডোনেশন জমা" : "Add Contribution"}</span>
            </button>

            <button
              type="button"
              onClick={() => setExpenseSheetOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#f42a41]" />
              <span>{isBn ? "ব্যয় যোগ" : "Add Expense"}</span>
            </button>

            {/* 3-Dot Action Menu for Fund */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Fund actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-semibold animate-in fade-in zoom-in-95"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditDialogOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isBn ? "এডিট করুন" : "Edit Fund"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      try {
                        await updateFundMutation.mutateAsync({
                          id: fund.id,
                          payload: { isActive: !fund.isActive },
                        });
                      } catch {}
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Power
                      className={`w-3.5 h-3.5 ${
                        fund.isActive ? "text-amber-600" : "text-emerald-600"
                      }`}
                    />
                    <span>
                      {fund.isActive
                        ? isBn
                          ? "ডিজেবল করুন"
                          : "Deactivate Fund"
                        : isBn
                        ? "এনাবল করুন"
                        : "Activate Fund"}
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
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isBn ? "ডিলিট করুন" : "Delete Fund"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar of Spent vs Raised */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{isBn ? "ব্যয়ের অগ্রগতি" : "Budget Utilization"}</span>
          <span className="tabular-nums">
            {spentRatio.toFixed(1)}% {isBn ? "ব্যয়িত" : "utilized"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLowBalance ? "bg-amber-500" : "bg-[#006a4e]"
            }`}
            style={{ width: `${Math.min(100, spentRatio)}%` }}
          />
        </div>
      </div>

      {/* Tabs: Contributions | Expenses */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("contributions")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "contributions"
                ? "bg-[#006a4e] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isBn ? "ডোনেশনের তালিকা (Donations)" : "Donations"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "expenses"
                ? "bg-[#006a4e] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isBn ? "ব্যয়ের তালিকা (Expenses)" : "Expenses"}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "contributions" ? (
          <ContributionsTable
            fundId={fund.id}
            isBn={isBn}
            onAddClick={() => setContributionSheetOpen(true)}
          />
        ) : (
          <ExpensesTable
            fundId={fund.id}
            isBn={isBn}
            onAddClick={() => setExpenseSheetOpen(true)}
          />
        )}
      </div>

      {/* Reusable Sheets */}
      <ContributionFormSheet
        isOpen={contributionSheetOpen}
        onClose={() => setContributionSheetOpen(false)}
        defaultFundId={fund.id}
        isBn={isBn}
      />

      <ExpenseFormSheet
        isOpen={expenseSheetOpen}
        onClose={() => setExpenseSheetOpen(false)}
        defaultFundId={fund.id}
        isBn={isBn}
      />

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
                    (fund.summary?.contributionsCount ?? 0) > 0 ||
                    (fund.summary?.expensesCount ?? 0) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {(fund.summary?.contributionsCount ?? 0) > 0 ||
                    (fund.summary?.expensesCount ?? 0) > 0
                      ? isBn
                        ? "ফান্ড ডিলিট করা যাবে না"
                        : "Deletion Blocked"
                      : isBn
                      ? "ফান্ডটি ডিলিট করতে চান?"
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

            {(fund.summary?.contributionsCount ?? 0) > 0 ||
            (fund.summary?.expensesCount ?? 0) > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-2">
                <p className="font-bold">
                  {isBn
                    ? "এই ফান্ডে আর্থিক লেনদেন সংরক্ষিত আছে:"
                    : "This fund contains recorded financial transactions:"}
                </p>
                <ul className="list-disc pl-5 space-y-1 font-medium">
                  <li>
                    {isBn
                      ? `মোট ডোনেশন: ${
                          fund.summary?.contributionsCount ?? 0
                        } টি`
                      : `Total contributions: ${
                          fund.summary?.contributionsCount ?? 0
                        }`}
                  </li>
                  <li>
                    {isBn
                      ? `মোট ব্যয়: ${fund.summary?.expensesCount ?? 0} টি`
                      : `Total expenses: ${
                          fund.summary?.expensesCount ?? 0
                        }`}
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
                  ? `আপনি কি নিশ্চিত যে "${fund.name}" ফান্ডটি ডিলিট করতে চান? এতে কোনো লেনদেন নেই এবং ডিলিট করলে এটি আর ফেরত পাওয়া যাবে না।`
                  : `Are you sure you want to delete "${fund.name}"? This empty fund has no transactions and this action cannot be undone.`}
              </p>
            )}

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>

              {(fund.summary?.contributionsCount ?? 0) > 0 ||
              (fund.summary?.expensesCount ?? 0) > 0 ? (
                <button
                  type="button"
                  onClick={async () => {
                    await updateFundMutation.mutateAsync({
                      id: fund.id,
                      payload: { isActive: !fund.isActive },
                    });
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
                  onClick={async () => {
                    setDeleteError(null);
                    try {
                      await deleteFundMutation.mutateAsync(fund.id);
                      setIsDeleteModalOpen(false);
                      router.replace(withLocaleHref("/admin/finance", locale));
                    } catch (err: any) {
                      setDeleteError(
                        err?.message ||
                          (isBn
                            ? "ফান্ড ডিলিট করা যায়নি।"
                            : "Failed to delete fund.")
                      );
                    }
                  }}
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
    </div>
  );
}
