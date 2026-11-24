"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
} from "lucide-react";
import ThemedSelect from "@/components/common/ThemedSelect";
import { useFunds } from "@/lib/hooks/use-finance";
import { FUND_CATEGORIES, type FundCategory } from "@/lib/schemas/finance";
import { formatFundCategory } from "@/lib/format";
import { FundCard } from "./fund-card";

interface FundsManagementTableProps {
  locale: string;
  onAddFundClick?: () => void;
  pageSize?: number;
}

/** Build compact page items with ellipses (e.g. `1, 2, 3, 4, 5, "...", 76`). */
function getPageItems(
  currentPage: number,
  totalPages: number
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "..."> = [1];

  if (currentPage <= 4) {
    for (let p = 2; p <= 5; p++) items.push(p);
    items.push("...");
    items.push(totalPages);
    return items;
  }

  if (currentPage >= totalPages - 3) {
    items.push("...");
    for (let p = totalPages - 4; p < totalPages; p++) items.push(p);
    items.push(totalPages);
    return items;
  }

  items.push("...");
  items.push(currentPage - 1, currentPage, currentPage + 1);
  items.push("...");
  items.push(totalPages);
  return items;
}

export function FundsManagementTable({
  locale,
  onAddFundClick,
  pageSize: initialPageSize = 4,
}: FundsManagementTableProps) {
  const isBn = locale === "bn";
  const { data: funds = [], isLoading, isError, refetch } = useFunds();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtered funds
  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = fund.name.toLowerCase().includes(q);
        const matchesCat = fund.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }
      if (selectedCategory !== "ALL" && fund.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === "ACTIVE" && !fund.isActive) {
        return false;
      }
      if (selectedStatus === "INACTIVE" && fund.isActive) {
        return false;
      }
      return true;
    });
  }, [funds, search, selectedCategory, selectedStatus]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus]);

  // Pagination calculation
  const totalFunds = filteredFunds.length;
  const totalPages = Math.max(1, Math.ceil(totalFunds / pageSize));
  const startIndex = totalFunds > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalFunds);
  const pageItems = getPageItems(currentPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const paginatedFunds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFunds.slice(start, start + pageSize);
  }, [filteredFunds, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? "ফান্ডের নাম দিয়ে খুঁজুন..." : "Search funds by name..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e]"
            />
          </div>

          {/* Filters Row: 2 columns on mobile, inline on sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {/* Category Filter (Themed Dropdown) */}
            <ThemedSelect
              ariaLabel={isBn ? "ক্যাটাগরি ফিল্টার" : "Filter by category"}
              value={selectedCategory}
              isFiltered={selectedCategory !== "ALL"}
              variant="form"
              size="md"
              className="w-full sm:w-auto min-w-[140px]"
              icon={<Filter className="w-3.5 h-3.5 text-slate-400" />}
              onChange={(val) => setSelectedCategory(val as FundCategory | "ALL")}
              options={[
                { value: "ALL", label: isBn ? "সকল ক্যাটাগরি" : "All Categories" },
                ...FUND_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: formatFundCategory(cat, isBn),
                })),
              ]}
            />

            {/* Status Filter (Themed Dropdown) */}
            <ThemedSelect
              ariaLabel={isBn ? "স্ট্যাটাস ফিল্টার" : "Filter by status"}
              value={selectedStatus}
              isFiltered={selectedStatus !== "ALL"}
              variant="form"
              size="md"
              className="w-full sm:w-auto min-w-[130px]"
              icon={<CheckCircle className="w-3.5 h-3.5 text-slate-400" />}
              onChange={(val) => setSelectedStatus(val as "ALL" | "ACTIVE" | "INACTIVE")}
              options={[
                { value: "ALL", label: isBn ? "সকল স্ট্যাটাস" : "All Status" },
                { value: "ACTIVE", label: isBn ? "সক্রিয়" : "Active" },
                { value: "INACTIVE", label: isBn ? "নিষ্ক্রিয়" : "Archived" },
              ]}
            />
          </div>
        </div>

        {/* Add Fund Button (Mobile only here; desktop has it in the page header) */}
        {onAddFundClick && (
          <button
            type="button"
            onClick={onAddFundClick}
            className="sm:hidden inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? "নতুন ফান্ড" : "New Fund"}</span>
          </button>
        )}
      </div>

      {/* Content: Cards Grid (2 cards per line on mobile, 3 on desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 sm:h-60 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-5 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <p className="text-sm font-bold text-rose-600">
            {isBn ? "ফান্ড তালিকা লোড করতে সমস্যা হয়েছে।" : "Failed to load funds list."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#006a4e] text-white text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isBn ? "পুনরায় চেষ্টা" : "Retry"}</span>
          </button>
        </div>
      ) : filteredFunds.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">
            {isBn ? "কোন ফান্ড পাওয়া যায়নি" : "No funds match your filter"}
          </p>
          <p className="text-xs text-slate-400">
            {isBn
              ? "নতুন ফান্ড তৈরি করুন অথবা ফিল্টার পরিবর্তন করুন"
              : "Create a new fund or adjust your search filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Colorful Cards Grid (2 cards per line on mobile, 3 on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {paginatedFunds.map((fund) => (
              <FundCard key={fund.id} fund={fund} locale={locale} />
            ))}
          </div>

          {/* Pagination Bar (Always visible when there are funds) */}
          {filteredFunds.length > 0 && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/45 p-3.5 sm:px-4 sm:py-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none">
              {/* Left: Showing range + Page X of Y */}
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <p className="font-medium text-[11px] sm:text-xs">
                  {isBn ? "দেখানো হচ্ছে " : "Showing "}
                  <span className="font-black text-[#006a4e]">
                    {startIndex} - {endIndex}
                  </span>
                  {isBn ? " / মোট " : " of "}
                  <span className="font-black text-slate-900">{totalFunds}</span>
                  {isBn ? " টি ফান্ড" : " funds"}
                </p>

                <span className="text-slate-300 select-none">|</span>

                <span className="font-bold text-slate-500 text-[11px] sm:text-xs">
                  {isBn
                    ? `পেজ ${currentPage} / ${totalPages}`
                    : `Page ${currentPage} of ${totalPages}`}
                </span>
              </div>

              {/* Right: Per page selector + Prev + Page Numbers + Next */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">
                    {isBn ? "প্রতি পেজ:" : "Per page:"}
                  </span>
                  <ThemedSelect
                    ariaLabel={isBn ? "প্রতি পেজ" : "Per page"}
                    value={String(pageSize)}
                    size="xs"
                    align="right"
                    className="bg-white min-w-[64px]"
                    onChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "2", label: "2" },
                      { value: "4", label: "4" },
                      { value: "6", label: "6" },
                      { value: "8", label: "8" },
                      { value: "12", label: "12" },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={!hasPreviousPage}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50 hover:border-[#006a4e]/35 text-slate-700 font-bold inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isBn ? "পূর্ববর্তী" : "Prev"}</span>
                  </button>

                  {/* Page Numbers */}
                  {pageItems.map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-slate-400 font-bold select-none text-xs"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                        className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          item === currentPage
                            ? "bg-[#006a4e] text-white shadow-xs shadow-[#006a4e]/25"
                            : "bg-white border border-emerald-200/80 text-slate-700 hover:bg-emerald-50 hover:border-[#006a4e]/35 hover:text-[#006a4e]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-2.5 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50 hover:border-[#006a4e]/35 text-slate-700 font-bold inline-flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs"
                  >
                    <span className="hidden sm:inline">{isBn ? "পরবর্তী" : "Next"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
