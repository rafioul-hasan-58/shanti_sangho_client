"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFunds, useUpdateFund, useDeleteFund } from "@/lib/hooks/use-finance";
import type { Fund } from "@/lib/api/finance";
import { FUND_CATEGORIES, type FundCategory } from "@/lib/schemas/finance";
import { formatMoney, formatFundCategory } from "@/lib/format";
import { withLocaleHref } from "@/lib/config/adminNav";
import { FundFormDialog } from "./fund-form-dialog";

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
  const updateFundMutation = useUpdateFund();
  const deleteFundMutation = useDeleteFund();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit dialog state
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation modal state
  const [fundToDelete, setFundToDelete] = useState<Fund | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

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

  // Handle Toggle Active Status
  const handleToggleActive = async (fund: Fund) => {
    try {
      await updateFundMutation.mutateAsync({
        id: fund.id,
        payload: {
          isActive: !fund.isActive,
        },
      });
    } catch {
      // Handled by query client
    }
  };

  // Handle Delete Fund
  const handleConfirmDelete = async () => {
    if (!fundToDelete) return;
    setDeleteErrorMessage(null);

    // Prevent deleting funds that have active transactions
    const hasTransactions =
      (fundToDelete.summary?.contributionsCount ?? 0) > 0 ||
      (fundToDelete.summary?.expensesCount ?? 0) > 0;

    if (hasTransactions) {
      setDeleteErrorMessage(
        isBn
          ? "এই ফান্ডে ইতিমধ্যে জমা বা খরচের হিসাব বিদ্যমান। লেনদেনযুক্ত ফান্ড মোছা যাবে না; আপনি এটি নিষ্ক্রিয় বা আর্কাইভ করতে পারেন।"
          : "Cannot delete a fund with existing contributions or expenses. Please deactivate/archive it instead."
      );
      return;
    }

    try {
      await deleteFundMutation.mutateAsync(fundToDelete.id);
      setFundToDelete(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isBn
          ? "ফান্ড মুছতে ব্যর্থ হয়েছে।"
          : "Failed to delete fund.";
      setDeleteErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Content Container (Table on Desktop, Cards on Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100/80 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
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
          <div className="p-12 text-center space-y-2">
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
          <>
            {/* 1. DESKTOP VIEW: FULL TABLE (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">{isBn ? "ফান্ডের নাম ও ক্যাটাগরি" : "Fund & Category"}</th>
                    <th className="py-3 px-4">{isBn ? "মোট সংগৃহীত" : "Total Raised"}</th>
                    <th className="py-3 px-4">{isBn ? "মোট ব্যয়িত" : "Total Spent"}</th>
                    <th className="py-3 px-4">{isBn ? "বর্তমান স্থিতি" : "Net Balance"}</th>
                    <th className="py-3 px-4">{isBn ? "লেনদেন সংখ্যা" : "Records"}</th>
                    <th className="py-3 px-4">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                    <th className="py-3 px-4 text-right">{isBn ? "কার্যক্রম" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {paginatedFunds.map((fund) => {
                    const isLow = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
                    const contCount = fund.summary?.contributionsCount ?? 0;
                    const expCount = fund.summary?.expensesCount ?? 0;

                    return (
                      <tr
                        key={fund.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Fund & Category */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <Link
                              href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
                              className="font-bold text-slate-900 group-hover:text-[#006a4e] transition-colors"
                            >
                              {fund.name}
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 tracking-wide">
                                {formatFundCategory(fund.category, isBn)}
                              </span>
                              {isLow && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>{isBn ? "কম স্থিতি" : "Low"}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Raised */}
                        <td className="py-3.5 px-4 tabular-nums font-black text-emerald-700">
                          + {formatMoney(fund.totalIn)}
                        </td>

                        {/* Total Spent */}
                        <td className="py-3.5 px-4 tabular-nums font-black text-[#f42a41]">
                          - {formatMoney(fund.totalOut)}
                        </td>

                        {/* Net Balance */}
                        <td className="py-3.5 px-4 tabular-nums font-black text-slate-900 text-sm">
                          {formatMoney(fund.remaining)}
                        </td>

                        {/* Records */}
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">
                          <span>{contCount} {isBn ? "জমা" : "in"}</span>
                          <span className="mx-1 text-slate-300">/</span>
                          <span>{expCount} {isBn ? "খরচ" : "out"}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(fund)}
                            disabled={updateFundMutation.isPending}
                            title={isBn ? "স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন" : "Click to toggle active status"}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                              fund.isActive
                                ? "bg-emerald-100/80 text-[#006a4e] hover:bg-emerald-200"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                          >
                            {fund.isActive ? (
                              <>
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>{isBn ? "সক্রিয়" : "Active"}</span>
                              </>
                            ) : (
                              <span>{isBn ? "নিষ্ক্রিয়" : "Inactive"}</span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#006a4e] hover:bg-emerald-50 transition-colors"
                              title={isBn ? "বিস্তারিত দেখুন" : "View fund"}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingFund(fund);
                                setIsEditDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title={isBn ? "এডিট করুন" : "Edit fund"}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setFundToDelete(fund);
                                setDeleteErrorMessage(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isBn ? "ডিলিট করুন" : "Delete fund"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE VIEW: RESPONSIVE CARDS (Hidden on Desktop) */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedFunds.map((fund) => {
                const isLow = fund.totalIn > 0 && fund.remaining < fund.totalIn * 0.1;
                const contCount = fund.summary?.contributionsCount ?? 0;
                const expCount = fund.summary?.expensesCount ?? 0;
                const progressPercent =
                  fund.totalIn > 0
                    ? Math.min(100, Math.round((fund.totalOut / fund.totalIn) * 100))
                    : 0;

                return (
                  <div key={fund.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Card Header: Name, Category, Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
                          className="font-black text-sm text-slate-900 hover:text-[#006a4e] transition-colors leading-snug line-clamp-2"
                        >
                          {fund.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {formatFundCategory(fund.category, isBn)}
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>{isBn ? "কম স্থিতি" : "Low"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(fund)}
                        disabled={updateFundMutation.isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 transition-all cursor-pointer ${
                          fund.isActive
                            ? "bg-emerald-100/90 text-[#006a4e] border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {fund.isActive && <CheckCircle className="w-3 h-3 text-[#006a4e]" />}
                        <span>{fund.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive")}</span>
                      </button>
                    </div>

                    {/* Financial Metrics Card Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? "সংগৃহীত" : "Raised"}</p>
                        <p className="text-xs font-black text-emerald-700 mt-0.5">+ {formatMoney(fund.totalIn)}</p>
                      </div>
                      <div className="border-x border-slate-200/80 px-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? "ব্যয়িত" : "Spent"}</p>
                        <p className="text-xs font-black text-[#f42a41] mt-0.5">- {formatMoney(fund.totalOut)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? "স্থিতি" : "Net"}</p>
                        <p className="text-xs font-black text-slate-900 mt-0.5">{formatMoney(fund.remaining)}</p>
                      </div>
                    </div>

                    {/* Progress Bar & Records Count */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>
                          {contCount} {isBn ? "জমা" : "in"} <span className="text-slate-300">/</span> {expCount} {isBn ? "খরচ" : "out"}
                        </span>
                        <span className="font-bold text-slate-600">
                          {progressPercent}% {isBn ? "ব্যয়িত" : "spent"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progressPercent > 90 ? "bg-rose-500" : progressPercent > 60 ? "bg-amber-500" : "bg-[#006a4e]"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Actions: View, Edit, Delete */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={withLocaleHref(`/admin/finance/funds/${fund.id}`, locale)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#006a4e] text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isBn ? "বিস্তারিত দেখুন" : "View Fund"}</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFund(fund);
                            setIsEditDialogOpen(true);
                          }}
                          aria-label="Edit fund"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFundToDelete(fund);
                            setDeleteErrorMessage(null);
                          }}
                          aria-label="Delete fund"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. PAGINATION BAR (Visible when total pages > 1 or for clean UX) */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white select-none">
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
          </>
        )}
      </div>

      {/* Edit Fund Dialog */}
      <FundFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingFund(null);
        }}
        fundToEdit={editingFund}
        isBn={isBn}
      />

      {/* Delete Confirmation Modal */}
      {fundToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFundToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-[#f42a41] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isBn ? "ফান্ড ডিলিট করতে চান?" : "Delete Fund?"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? `"${fundToDelete.name}" ফান্ডটি স্থায়ীভাবে ডিলিট হয়ে যাবে।`
                  : `Are you sure you want to permanently delete "${fundToDelete.name}"?`}
              </p>
            </div>

            {deleteErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#f42a41] text-xs font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{deleteErrorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFundToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteFundMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#f42a41] hover:bg-[#d82438] active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleteFundMutation.isPending
                  ? isBn
                    ? "ডিলিট হচ্ছে..."
                    : "Deleting..."
                  : isBn
                  ? "হ্যাঁ, ডিলিট করুন"
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
