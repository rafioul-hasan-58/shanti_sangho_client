"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  X,
  FileSpreadsheet,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useExpenses } from "@/lib/hooks/use-finance";
import type { Expense } from "@/lib/api/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { ReceiptButton, ReceiptPreviewModal } from "./receipt-preview";

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
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected row for detail drawer
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data, isLoading, isError, refetch } = useExpenses({
    fundId,
    q: search || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
  });

  const expenses = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Export to CSV helper
  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    const headers = [
      "ID",
      "Fund",
      "Date",
      "Spent On",
      "Amount",
      "Handled By",
      "Receipt URL",
      "Note",
    ];
    const rows = expenses.map((e) => [
      e.id,
      e.fundName,
      formatDate(e.spentAt),
      `"${e.spentOn.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.spentByName || "Admin"}"`,
      `"${e.receiptUrl || ""}"`,
      `"${(e.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `expenses-${format(new Date(), "yyyyMMdd-HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearch("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || from || to);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Date range & Export CSV */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              title="From date"
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#006a4e]"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              title="To date"
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#006a4e]"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {isBn ? "রিসেট" : "Reset"}
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBn ? "CSV এক্সপোর্ট" : "Export CSV"}</span>
          </button>
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

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex p-1.5 rounded-lg text-slate-400 group-hover:text-[#006a4e] group-hover:bg-[#EEF8F1] transition-colors">
                          <Eye className="w-4 h-4" />
                        </span>
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
                  className="p-4 space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {e.spentOn}
                    </span>
                    <span className="font-black text-sm tabular-nums text-[#f42a41] shrink-0">
                      - {formatMoney(e.amount)}
                    </span>
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
    </div>
  );
}
