"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFunds } from "@/lib/hooks/use-finance";
import { FUND_CATEGORIES, type FundCategory } from "@/lib/schemas/finance";
import { formatFundCategory } from "@/lib/format";
import { FundCard } from "./fund-card";

interface FundsManagementTableProps {
  locale: string;
  onAddFundClick?: () => void;
  pageSize?: number;
}

export function FundsManagementTable({
  locale,
  onAddFundClick,
  pageSize = 6,
}: FundsManagementTableProps) {
  const isBn = locale === "bn";
  const { data: funds = [], isLoading, isError, refetch } = useFunds();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);

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
  const totalPages = Math.max(1, Math.ceil(filteredFunds.length / pageSize));
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
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FundCategory | "ALL")}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] cursor-pointer"
            >
              <option value="ALL">{isBn ? "সকল ক্যাটাগরি" : "All Categories"}</option>
              {FUND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {formatFundCategory(cat, isBn)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] cursor-pointer"
            >
              <option value="ALL">{isBn ? "সকল স্ট্যাটাস" : "All Status"}</option>
              <option value="ACTIVE">{isBn ? "সক্রিয়" : "Active"}</option>
              <option value="INACTIVE">{isBn ? "নিষ্ক্রিয়" : "Archived"}</option>
            </select>
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

      {/* Content: Cards Grid (Identical to the colorful cards on /finance, No Table!) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-60 bg-white rounded-3xl border border-slate-200/80 p-5 animate-pulse"
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
          {/* Colorful Cards Grid (matching /finance FundCard) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {paginatedFunds.map((fund) => (
              <FundCard key={fund.id} fund={fund} locale={locale} />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              <p className="text-xs text-slate-500 font-semibold text-center sm:text-left">
                {isBn
                  ? `মোট ${filteredFunds.length} টি ফান্ড • পৃষ্ঠা ${currentPage} এর ${totalPages}`
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                      currentPage * pageSize,
                      filteredFunds.length
                    )} of ${filteredFunds.length} funds`}
              </p>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isBn ? "পূর্ববর্তী" : "Prev"}</span>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    totalPages > 5 &&
                    Math.abs(page - currentPage) > 1 &&
                    page !== 1 &&
                    page !== totalPages
                  ) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#006a4e] text-white shadow-xs font-black"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="hidden sm:inline">{isBn ? "পরবর্তী" : "Next"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
