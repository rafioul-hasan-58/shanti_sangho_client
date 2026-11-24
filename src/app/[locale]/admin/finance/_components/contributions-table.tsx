"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Calendar,
  X,
  User,
  MoreVertical,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RotateCcw,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { useContributions, useFunds, useDeleteContribution } from "@/lib/hooks/use-finance";
import type { Contribution } from "@/lib/api/finance";
import type { PaymentMethod } from "@/lib/schemas/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { MethodBadge } from "./method-badge";
import { PaymentMethodLogo } from "./payment-method-logo";
import { ContributionFormSheet } from "./contribution-form-sheet";
import { DatePickerButton } from "./date-picker-button";

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
  const deleteContributionMutation = useDeleteContribution();

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

  // Edit Sheet State
  const [contributionToEdit, setContributionToEdit] = useState<Contribution | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Delete Modal State
  const [contributionToDelete, setContributionToDelete] = useState<Contribution | null>(null);
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

  // Custom Method Dropdown State
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const methodDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        methodDropdownRef.current &&
        !methodDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMethodDropdownOpen(false);
      }
    };
    if (isMethodDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMethodDropdownOpen]);

  // Method options definition
  const METHOD_OPTIONS: Array<{
    id: PaymentMethod | "ALL";
    labelBn: string;
    labelEn: string;
    dotColor: string;
  }> = [
    {
      id: "ALL",
      labelBn: "সকল মেথড",
      labelEn: "All Methods",
      dotColor: "bg-slate-400",
    },
    {
      id: "CASH",
      labelBn: "ক্যাশ",
      labelEn: "Cash",
      dotColor: "bg-emerald-500",
    },
    {
      id: "BKASH",
      labelBn: "বিকাশ",
      labelEn: "bKash",
      dotColor: "bg-[#e2136e]",
    },
    {
      id: "NAGAD",
      labelBn: "নগদ",
      labelEn: "Nagad",
      dotColor: "bg-[#f7941d]",
    },
    {
      id: "BANK",
      labelBn: "ব্যাংক",
      labelEn: "Bank",
      dotColor: "bg-blue-500",
    },
    {
      id: "OTHER",
      labelBn: "অন্যান্য",
      labelEn: "Other",
      dotColor: "bg-purple-500",
    },
  ];

  const selectedMethodOption =
    METHOD_OPTIONS.find((opt) => opt.id === method) || METHOD_OPTIONS[0];

  // Quick date presets helpers
  const getTodayString = () => format(new Date(), "yyyy-MM-dd");
  const getMonthStartString = () =>
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    );

  const isTodayActive = from === getTodayString() && to === getTodayString();
  const isMonthActive =
    from === getMonthStartString() && to === getTodayString();

  const handleDatePreset = (preset: "TODAY" | "THIS_MONTH") => {
    if (preset === "TODAY") {
      setFrom(getTodayString());
      setTo(getTodayString());
    } else if (preset === "THIS_MONTH") {
      setFrom(getMonthStartString());
      setTo(getTodayString());
    }
    setPage(1);
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
      {/* Modern Filter Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-50/70 to-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006a4e]" />
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
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-emerald-200/80 bg-emerald-50/20 hover:bg-white focus:bg-white text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all shadow-2xs h-[38px]"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Fund Filter, Method Dropdown, Date Range, Presets & Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-2">
            {/* Fund Filter (shown if not scoped to a specific fund) */}
            {!fundId && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={fundFilter}
                  onChange={(e) => {
                    setFundFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-auto appearance-none pl-8.5 pr-7 py-2 rounded-xl border border-purple-200/90 bg-purple-50/40 hover:bg-purple-50/80 hover:border-purple-300 text-xs font-bold text-purple-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 cursor-pointer transition-colors shadow-2xs h-[38px]"
                >
                  <option value="ALL">{isBn ? "সকল ফান্ড" : "All Funds"}</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <Layers className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-purple-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Line 1 (on mobile): Method Filter (50%) & Quick Date Presets (50%) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Method Filter Dropdown */}
              <div className="flex-1 w-1/2 sm:w-auto sm:flex-initial relative" ref={methodDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMethodDropdownOpen((prev) => !prev)}
                  className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-black transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 min-w-0 sm:min-w-[130px] h-[38px] ${
                    method !== "ALL"
                      ? "border-[#006a4e] bg-[#006a4e]/10 text-[#006a4e]"
                      : "border-slate-200/90 bg-slate-50/90 hover:bg-white hover:border-slate-300 text-slate-800"
                  }`}
                >
                <div className="flex items-center gap-2 min-w-0">
                  <PaymentMethodLogo
                    method={selectedMethodOption.id}
                    className="w-4 h-4 shrink-0"
                  />
                  <span className="truncate">
                    {isBn
                      ? selectedMethodOption.labelBn
                      : selectedMethodOption.labelEn}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    isMethodDropdownOpen ? "rotate-180 text-[#006a4e]" : "text-slate-400"
                  }`}
                />
              </button>

              {isMethodDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-44 max-w-[calc(100vw-32px)] rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-1.5 z-50 text-xs font-bold animate-in fade-in zoom-in-95 origin-top-left sm:origin-top-right">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {isBn ? "পেমেন্ট মেথড" : "Payment Method"}
                  </div>
                  <div className="py-1">
                    {METHOD_OPTIONS.map((opt) => {
                      const isSelected = method === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setMethod(opt.id);
                            setPage(1);
                            setIsMethodDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#006a4e]/5 text-[#006a4e] font-black"
                              : "text-slate-700 hover:bg-slate-50 font-bold"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <PaymentMethodLogo
                              method={opt.id}
                              className="w-4 h-4 shrink-0"
                            />
                            <span>{isBn ? opt.labelBn : opt.labelEn}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#006a4e]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

              {/* Quick Date Presets */}
              <div className="flex-1 w-1/2 sm:w-auto sm:flex-initial inline-flex items-center gap-1 bg-emerald-50/70 p-1 rounded-xl border border-emerald-200/80 text-[11px] font-bold h-[38px]">
                <button
                  type="button"
                  onClick={() => handleDatePreset("TODAY")}
                  className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                    isTodayActive
                      ? "bg-[#006a4e] text-white shadow-xs font-black"
                      : "text-emerald-900/80 hover:text-emerald-950 hover:bg-white/60 font-bold"
                  }`}
                >
                  {isBn ? "আজ" : "Today"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("THIS_MONTH")}
                  className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                    isMonthActive
                      ? "bg-[#006a4e] text-white shadow-xs font-black"
                      : "text-emerald-900/80 hover:text-emerald-950 hover:bg-white/60 font-bold"
                  }`}
                >
                  {isBn ? "এই মাস" : "This Month"}
                </button>
              </div>
            </div>

            {/* Line 2 (on mobile): Soro (From: 50%) & Shes (To: 50%) with space like first line */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DatePickerButton
                value={from}
                onChange={(val) => {
                  setFrom(val);
                  setPage(1);
                }}
                label={isBn ? "শুরু" : "From"}
                isBn={isBn}
                colorTheme="emerald"
                align="left"
              />

              <DatePickerButton
                value={to}
                onChange={(val) => {
                  setTo(val);
                  setPage(1);
                }}
                label={isBn ? "শেষ" : "To"}
                isBn={isBn}
                colorTheme="sky"
                align="right"
              />
            </div>

            {/* Clear Filters Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 transition-all cursor-pointer shrink-0 h-[38px] shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>{isBn ? "রিসেট" : "Reset"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div
        className={`rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all ${
          openDropdownId ? "overflow-visible" : "overflow-hidden"
        }`}
      >
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
                ? "ডোনেশনের তথ্য লোড করতে ব্যর্থ হয়েছে।"
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
              {isBn ? "কোনো ডোনেশনের রেকর্ড পাওয়া যায়নি" : "No contributions found"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? isBn
                  ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                  : "Try clearing or adjusting your search filters."
                : isBn
                ? "এখনো এই ফান্ডে কোনো ডোনেশন যোগ করা হয়নি।"
                : "No contributions have been recorded in this view yet."}
            </p>
            {onAddClick && (
              <button
                type="button"
                onClick={onAddClick}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006a4e] hover:bg-[#004d38] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? "নতুন ডোনেশন যোগ করুন" : "Add Contribution"}</span>
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
                    <th className="py-3 px-4">{isBn ? "প্রদানকারী" : "Giver"}</th>
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
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        openDropdownId === c.id ? "relative z-30" : ""
                      }`}
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

                      {/* Action: 3-Dot Dropdown */}
                      <td
                        className="py-3 px-4 text-center relative"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === c.id ? null : c.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openDropdownId === c.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-left animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedContribution(c);
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
                                  setContributionToEdit(c);
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
                                  setContributionToDelete(c);
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
            <div className="md:hidden p-3 sm:p-4 space-y-3 bg-slate-50/40">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedContribution(c)}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 ${
                    openDropdownId === c.id
                      ? "relative z-30 overflow-visible"
                      : "relative z-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center font-black text-xs shrink-0 overflow-hidden ring-2 ring-emerald-500/15">
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
                      <div className="min-w-0">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate leading-snug">
                          {c.giverName || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <span>{formatDate(c.receivedAt)}</span>
                          {c.reference && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-500 truncate max-w-[100px]">
                                {c.reference}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/70 font-black text-xs sm:text-sm text-emerald-700 tabular-nums shadow-2xs">
                        + {formatMoney(c.amount)}
                      </span>

                      {/* 3-Dot Menu on Mobile Card */}
                      <div className="relative" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === c.id ? null : c.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === c.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-left animate-in fade-in zoom-in-95 origin-top-right">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                setSelectedContribution(c);
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
                                setContributionToEdit(c);
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
                                setContributionToDelete(c);
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

                  {/* Bottom Row: Method Badge & Collector */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <MethodBadge method={c.method} isBn={isBn} />
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {isBn ? "সংগ্রহ:" : "Recv:"}{" "}
                        <span className="font-bold text-slate-600">
                          {c.receivedByName}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls - Spaced Below Table with Generous Breathing Room */}
      {totalPages > 1 && (
        <div className="mt-4 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{isBn ? "আগের" : "Prev"}</span>
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-black text-slate-800 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{isBn ? "পরের" : "Next"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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
                {isBn ? "ডোনেশনের বিস্তারিত তথ্য" : "Contribution Details"}
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
                  <span className="text-slate-500 font-medium">{isBn ? "ফান্ড:" : "Fund:"}</span>
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

      {/* Edit Contribution Sheet */}
      <ContributionFormSheet
        isOpen={isEditSheetOpen}
        onClose={() => {
          setIsEditSheetOpen(false);
          setContributionToEdit(null);
        }}
        contributionToEdit={contributionToEdit}
        isBn={isBn}
      />

      {/* Delete Contribution Modal */}
      {isDeleteModalOpen && contributionToDelete && (
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
                    {isBn ? "ডোনেশন ডিলিট করবেন?" : "Delete Contribution?"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatMoney(contributionToDelete.amount)} • {contributionToDelete.giverName || "Member"}
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
                    contributionToDelete.amount
                  )} টাকার ডোনেশনের রেকর্ডটি ডিলিট করতে চান? ডিলিট করার পর ফান্ডের ব্যালেন্স স্বয়ংক্রিয়ভাবে আপডেট হবে।`
                : `Are you sure you want to permanently delete this contribution of ${formatMoney(
                    contributionToDelete.amount
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
                    await deleteContributionMutation.mutateAsync(contributionToDelete.id);
                    setIsDeleteModalOpen(false);
                    setContributionToDelete(null);
                  } catch (err: any) {
                    setDeleteError(
                      err?.message ||
                        (isBn ? "ডিলিট করতে সমস্যা হয়েছে।" : "Failed to delete contribution.")
                    );
                  }
                }}
                disabled={deleteContributionMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {deleteContributionMutation.isPending ? (
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
