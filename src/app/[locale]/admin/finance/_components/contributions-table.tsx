"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  X,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { useContributions, useFunds } from "@/lib/hooks/use-finance";
import type { Contribution } from "@/lib/api/finance";
import type { PaymentMethod } from "@/lib/schemas/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";

interface ContributionsTableProps {
  fundId?: string;
  isBn?: boolean;
  onAddClick?: () => void;
}

export function ContributionsTable({
  fundId,
  isBn = false,
  onAddClick,
}: ContributionsTableProps) {
  const { data: funds = [] } = useFunds();
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [fundFilter, setFundFilter] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const effectiveFundId = fundId || (fundFilter !== "ALL" ? fundFilter : undefined);

  // Selected row for detail drawer
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  const { data, isLoading, isError, refetch } = useContributions({
    fundId: effectiveFundId,
    q: search || undefined,
    method: method === "ALL" ? undefined : method,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
  });

  const contributions = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Export to CSV helper
  const handleExportCSV = () => {
    if (contributions.length === 0) return;

    const headers = [
      "ID",
      "Fund",
      "Date",
      "Giver",
      "Amount",
      "Method",
      "Received By",
      "Reference",
      "Note",
    ];
    const rows = contributions.map((c) => [
      c.id,
      c.fundName,
      formatDate(c.receivedAt),
      `"${c.giverName || "Anonymous Member"}"`,
      c.amount,
      c.method,
      `"${c.receivedByName}"`,
      `"${c.reference || ""}"`,
      `"${(c.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `contributions-${format(new Date(), "yyyyMMdd-HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearch("");
    setMethod("ALL");
    setFundFilter("ALL");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || method !== "ALL" || (!fundId && fundFilter !== "ALL") || from || to
  );

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
                ? "দাতার নাম, রেফারেন্স বা মন্তব্য লিখে খুঁজুন..."
                : "Search giver, reference, note..."
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

        {/* Right: Fund filter, Method filter, Date range, Export CSV */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Fund Filter (shown if not scoped to a specific fund) */}
          {!fundId && (
            <select
              value={fundFilter}
              onChange={(e) => {
                setFundFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006a4e] cursor-pointer"
            >
              <option value="ALL">{isBn ? "সকল তহবিল" : "All Funds"}</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}

          {/* Method Filter */}
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as PaymentMethod | "ALL");
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006a4e] cursor-pointer"
          >
            <option value="ALL">{isBn ? "সকল মেথড" : "All Methods"}</option>
            <option value="CASH">Cash</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="BANK">Bank</option>
            <option value="OTHER">Other</option>
          </select>

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
            disabled={contributions.length === 0}
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
                ? "অনুদানের তথ্য লোড করতে ব্যর্থ হয়েছে।"
                : "Failed to load contributions."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-bold"
            >
              {isBn ? "আবার চেষ্টা করুন" : "Retry"}
            </button>
          </div>
        ) : contributions.length === 0 ? (
          /* Empty State with CTA */
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006a4e] mx-auto flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-slate-800">
              {isBn ? "কোনো অনুদানের রেকর্ড পাওয়া যায়নি" : "No contributions found"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? isBn
                  ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                  : "Try clearing or adjusting your search filters."
                : isBn
                ? "এখনো এই তহবিলে কোনো অনুদান যোগ করা হয়নি।"
                : "No contributions have been recorded in this view yet."}
            </p>
            {onAddClick && (
              <button
                type="button"
                onClick={onAddClick}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006a4e] hover:bg-[#004d38] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? "নতুন অনুদান যোগ করুন" : "Add Contribution"}</span>
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
                    <th className="py-3 px-4">{isBn ? "প্রদানকারী (Giver)" : "Giver"}</th>
                    <th className="py-3 px-4">{isBn ? "পেমেন্ট মেথড" : "Method"}</th>
                    <th className="py-3 px-4">{isBn ? "রেফারেন্স" : "Reference"}</th>
                    <th className="py-3 px-4">{isBn ? "গ্রহণকারী" : "Received By"}</th>
                    <th className="py-3 px-4 text-right">{isBn ? "টাকার পরিমাণ" : "Amount"}</th>
                    <th className="py-3 px-4 text-center">{isBn ? "অ্যাকশন" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedContribution(c)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(c.receivedAt)}
                      </td>

                      {/* Giver */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                            {c.giverAvatar ? (
                              <Image
                                src={c.giverAvatar}
                                alt={c.giverName || "Giver"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span>{(c.giverName || "M").charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="truncate max-w-[160px]">
                            {c.giverName || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                          </span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <MethodBadge method={c.method} isBn={isBn} />
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4 font-medium text-slate-500 truncate max-w-[140px]">
                        {c.reference || "—"}
                      </td>

                      {/* Received By */}
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {c.receivedByName}
                      </td>

                      {/* Amount: Green, right-aligned, tabular-nums */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-black tabular-nums text-emerald-700 text-sm">
                          + {formatMoney(c.amount)}
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
              {contributions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedContribution(c)}
                  className="p-4 space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-6 h-6 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                        {c.giverAvatar ? (
                          <Image
                            src={c.giverAvatar}
                            alt={c.giverName || "Giver"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{(c.giverName || "M").charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {c.giverName || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                      </span>
                    </div>

                    <span className="font-black text-sm tabular-nums text-emerald-700 shrink-0">
                      + {formatMoney(c.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <MethodBadge method={c.method} isBn={isBn} />
                      <span>{formatDate(c.receivedAt)}</span>
                    </div>
                    <span>By: {c.receivedByName}</span>
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
      {selectedContribution && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setSelectedContribution(null)}
        >
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-base text-slate-900">
                {isBn ? "অনুদানের বিস্তারিত তথ্য" : "Contribution Details"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedContribution(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  {isBn ? "জমা কৃত অর্থ" : "Total Received"}
                </span>
                <span className="text-3xl font-black tabular-nums text-[#006a4e] mt-1 block">
                  + {formatMoney(selectedContribution.amount)}
                </span>
                <div className="mt-2 flex justify-center">
                  <MethodBadge method={selectedContribution.method} isBn={isBn} />
                </div>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "তহবিল:" : "Fund:"}</span>
                  <span className="font-bold text-slate-800">{selectedContribution.fundName}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "প্রদানকারী:" : "Giver:"}</span>
                  <span className="font-bold text-slate-800">
                    {selectedContribution.giverName || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">{isBn ? "তারিখ:" : "Date:"}</span>
                  <span className="font-bold text-slate-800">
                    {formatDate(selectedContribution.receivedAt)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500 font-medium">
                    {isBn ? "টাকা গ্রহণকারী:" : "Received By:"}
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedContribution.receivedByName}
                  </span>
                </div>
                {selectedContribution.reference && (
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500 font-medium">
                      {isBn ? "রেফারেন্স নং:" : "Reference:"}
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedContribution.reference}
                    </span>
                  </div>
                )}
                {selectedContribution.note && (
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-1">
                      {isBn ? "মন্তব্য:" : "Note:"}
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                      {selectedContribution.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setSelectedContribution(null)}
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
