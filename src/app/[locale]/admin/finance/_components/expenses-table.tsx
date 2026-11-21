"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  X,
  Receipt,
  AlertCircle,
  MoreVertical,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useExpenses, useFunds, useDeleteExpense } from "@/lib/hooks/use-finance";
import type { Expense } from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { ReceiptButton, ReceiptPreviewModal } from "./receipt-preview";
import { ExpenseFormSheet } from "./expense-form-sheet";

interface ExpensesTableProps {
  fundId?: string;
  isBn?: boolean;
  onAddClick?: () => void;
}

export function ExpensesTable({
  fundId,
  isBn = false,
  onAddClick,
}: ExpensesTableProps) {
  const { data: funds = [] } = useFunds();
  const deleteExpenseMutation = useDeleteExpense();

  const [search, setSearch] = useState("");
  const [fundFilter, setFundFilter] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const effectiveFundId = fundId || (fundFilter !== "ALL" ? fundFilter : undefined);

  // Selected row for detail drawer
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Edit Expense Sheet State
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Delete Expense Modal State
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 3-Dot Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdownId) return;
    const handleClick = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openDropdownId]);

  const { data, isLoading, isError, refetch } = useExpenses({
    fundId: effectiveFundId,
    q: search || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
  });

  const expenses = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const clearFilters = () => {
    setSearch("");
    setFrom("");
    setTo("");
    setFundFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || (!fundId && fundFilter !== "ALL") || from || to);

  return (
    <div className="space-y-4">
      {/* Modern Filter Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              isBn
                ? "ব্যয়ের খাত, নোট বা পরিচালনাকারীর নাম লিখে খুঁজুন..."
                : "Search purpose, note, handled by..."
            }
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Fund filter, Date range & Reset */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Fund Filter (shown if not scoped to a specific fund) */}
          {!fundId && (
            <div className="relative">
              <select
                value={fundFilter}
                onChange={(e) => {
                  setFundFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-8 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white hover:border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#006a4e] cursor-pointer transition-colors shadow-2xs"
              >
                <option value="ALL">{isBn ? "সকল তহবিল" : "All Funds"}</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Date Range Picker Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white hover:border-slate-300 text-xs shadow-2xs transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              title={isBn ? "শুরুর তারিখ" : "From date"}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[105px] sm:max-w-none"
            />
            <span className="text-slate-300 font-bold px-0.5 text-xs">-</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              title={isBn ? "শেষ তারিখ" : "To date"}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[105px] sm:max-w-none"
            />
            {(from || to) && (
              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setPage(1);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title={isBn ? "তারিখ মুছুন" : "Clear date"}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Clear Filters Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isBn ? "রিসেট" : "Reset"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-rose-600">
              {isBn
                ? "ব্যয়ের তথ্য লোড করতে ব্যর্থ হয়েছে।"
                : "Failed to load expenses."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold"
            >
              {isBn ? "আবার চেষ্টা করুন" : "Retry"}
            </button>
          </div>
        ) : expenses.length === 0 ? (
          /* Empty State with CTA */
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#f42a41] mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-slate-800">
              {isBn ? "কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি" : "No expenses found"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? isBn
                  ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                  : "Try clearing or adjusting your search filters."
                : isBn
                ? "এখনো এই তহবিলের অধীনে কোনো ব্যয় রেকর্ড করা হয়নি।"
                : "No expenses have been recorded in this fund view yet."}
            </p>
            {onAddClick && (
              <button
                type="button"
                onClick={onAddClick}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f42a41] hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? "নতুন ব্যয় যোগ করুন" : "Add Expense"}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="py-3 px-4">{isBn ? "ব্যয়ের খাত" : "Spent On"}</th>
                    <th className="py-3 px-4">{isBn ? "পরিচালনাকারী" : "Handled By"}</th>
                    <th className="py-3 px-4 text-center">{isBn ? "ভাউচার / রসিদ" : "Receipt"}</th>
                    <th className="py-3 px-4 text-right">{isBn ? "টাকার পরিমাণ" : "Amount"}</th>
                    <th className="py-3 px-4 text-center">{isBn ? "অ্যাকশন" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedExpense(e)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(e.spentAt)}
                      </td>

                      {/* Spent On */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[260px]">{e.spentOn}</span>
                          {e.note && (
                            <span className="text-[11px] font-normal text-slate-400 truncate max-w-[260px]">
                              {e.note}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Handled By */}
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {e.spentByName || "—"}
                      </td>

                      {/* Receipt */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <ReceiptButton
                          receiptUrl={e.receiptUrl}
                          title={e.spentOn}
                          isBn={isBn}
                        />
                      </td>

                      {/* Amount: Red, right-aligned, tabular-nums */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-black tabular-nums text-[#f42a41] text-sm">
                          - {formatMoney(e.amount)}
                        </span>
                      </td>

                      {/* Action: 3-Dot Dropdown */}
                      <td
                        className="py-3 px-4 text-center relative"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setOpenDropdownId(openDropdownId === e.id ? null : e.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openDropdownId === e.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-left animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedExpense(e);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{isBn ? "ডিটেইলস দেখুন" : "View Details"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setExpenseToEdit(e);
                                  setIsEditSheetOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{isBn ? "এডিট করুন" : "Edit"}</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setDeleteError(null);
                                  setExpenseToDelete(e);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>{isBn ? "ডিলিট করুন" : "Delete"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (under md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedExpense(e)}
                  className="p-4 space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {e.spentOn}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-sm tabular-nums text-[#f42a41]">
                        - {formatMoney(e.amount)}
                      </span>

                      {/* 3-Dot Dropdown on Mobile Card */}
                      <div className="relative" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setOpenDropdownId(openDropdownId === e.id ? null : e.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === e.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-left animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                setSelectedExpense(e);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{isBn ? "ডিটেইলস দেখুন" : "View Details"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                setExpenseToEdit(e);
                                setIsEditSheetOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{isBn ? "এডিট করুন" : "Edit"}</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                setDeleteError(null);
                                setExpenseToDelete(e);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>{isBn ? "ডিলিট করুন" : "Delete"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{formatDate(e.spentAt)}</span>
                    <div className="flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                      {e.receiptUrl && (
                        <ReceiptButton
                          receiptUrl={e.receiptUrl}
                          title={e.spentOn}
                          isBn={isBn}
                        />
                      )}
                      <span>By: {e.spentByName || "Admin"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50 text-xs">
              <span className="text-slate-500 font-medium">
                {isBn
                  ? `মোট ${total} টির মধ্যে ${(page - 1) * limit + 1}-${Math.min(
                      page * limit,
                      total
                    )} টি প্রদর্শিত`
                  : `Showing ${(page - 1) * limit + 1}-${Math.min(
                      page * limit,
                      total
                    )} of ${total}`}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-700">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Read-Only Transaction Detail Drawer / Modal */}
      {selectedExpense && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setSelectedExpense(null)}
        >
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-base text-slate-900">
                {isBn ? "ব্যয়ের বিস্তারিত তথ্য" : "Expense Details"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-center">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  {isBn ? "মোট ব্যয়" : "Total Spent"}
                </span>
                <span className="text-3xl font-black tabular-nums text-[#f42a41] mt-1 block">
                  - {formatMoney(selectedExpense.amount)}
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "তহবিল:" : "Fund:"}</span>
                  <span className="font-bold text-slate-800">{selectedExpense.fundName}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "ব্যয়ের খাত:" : "Spent On:"}</span>
                  <span className="font-bold text-slate-800">{selectedExpense.spentOn}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "তারিখ:" : "Date:"}</span>
                  <span className="font-bold text-slate-800">
                    {formatDate(selectedExpense.spentAt)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">
                    {isBn ? "পরিচালনাকারী:" : "Handled By:"}
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedExpense.spentByName || "—"}
                  </span>
                </div>
                {selectedExpense.note && (
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-1">
                      {isBn ? "নোট / বিবরণ:" : "Note:"}
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                      {selectedExpense.note}
                    </p>
                  </div>
                )}
                {selectedExpense.receiptUrl && (
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-2">
                      {isBn ? "ভাউচার / রসিদ:" : "Receipt / Voucher:"}
                    </span>
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-neutral-900">
                      <Image
                        src={selectedExpense.receiptUrl}
                        alt={selectedExpense.spentOn}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
              >
                {isBn ? "বন্ধ করুন" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Sheet */}
      <ExpenseFormSheet
        isOpen={isEditSheetOpen}
        onClose={() => {
          setIsEditSheetOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        isBn={isBn}
      />

      {/* Delete Expense Modal */}
      {isDeleteModalOpen && expenseToDelete && (
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
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                  <Trash2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {isBn ? "খরচ ডিলিট করবেন?" : "Delete Expense?"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatMoney(expenseToDelete.amount)} • {expenseToDelete.spentOn}
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

            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে এই ${formatMoney(
                    expenseToDelete.amount
                  )} টাকার খরচের রেকর্ডটি ডিলিট করতে চান? ডিলিট করার পর তহবিলের ব্যালেন্স স্বয়ংক্রিয়ভাবে আপডেট হবে।`
                : `Are you sure you want to permanently delete this expenditure of ${formatMoney(
                    expenseToDelete.amount
                  )}? The fund total and balance will be recalculated automatically.`}
            </p>

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
              <button
                type="button"
                onClick={async () => {
                  setDeleteError(null);
                  try {
                    await deleteExpenseMutation.mutateAsync(expenseToDelete.id);
                    setIsDeleteModalOpen(false);
                    setExpenseToDelete(null);
                  } catch (err: any) {
                    setDeleteError(
                      err?.message ||
                        (isBn ? "ডিলিট করতে সমস্যা হয়েছে।" : "Failed to delete expense.")
                    );
                  }
                }}
                disabled={deleteExpenseMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {deleteExpenseMutation.isPending ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
