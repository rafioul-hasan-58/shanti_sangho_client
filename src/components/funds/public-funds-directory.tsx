"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { useFunds } from "@/lib/hooks/use-finance";
import { FUND_CATEGORIES, type FundCategory } from "@/lib/schemas/finance";
import { formatMoney } from "@/lib/format";
import { withLocaleHref } from "@/lib/config/adminNav";

interface PublicFundsDirectoryProps {
  locale: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GPL: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  SPORTS: { bg: "bg-sky-500", text: "text-white", border: "border-sky-600" },
  OWAJ: { bg: "bg-amber-500", text: "text-white", border: "border-amber-600" },
  FOOTBALL: { bg: "bg-purple-500", text: "text-white", border: "border-purple-600" },
  IFTER_MAHFIL: { bg: "bg-teal-500", text: "text-white", border: "border-teal-600" },
  OTHERS: { bg: "bg-rose-500", text: "text-white", border: "border-rose-600" },
};

export default function PublicFundsDirectory({ locale }: PublicFundsDirectoryProps) {
  const isBn = locale === "bn";
  const { data: funds = [], isLoading } = useFunds();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | "ALL">("ALL");

  // Filter funds (public view only shows active funds or all if none)
  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      // Must be active for public directory
      if (!fund.isActive) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = fund.name.toLowerCase().includes(q);
        const matchesCat = fund.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }

      if (selectedCategory !== "ALL" && fund.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [funds, search, selectedCategory]);

  // Aggregate totals across active funds
  const activeFunds = funds.filter((f) => f.isActive);
  const totalRaised = activeFunds.reduce((sum, f) => sum + f.totalIn, 0);
  const totalSpent = activeFunds.reduce((sum, f) => sum + f.totalOut, 0);
  const totalRemaining = activeFunds.reduce((sum, f) => sum + f.remaining, 0);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* 1. Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-[#006a4e] text-xs font-black shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>
            {isBn ? "স্বচ্ছতা ও আর্থিক জবাবদিহিতা" : "Transparency & Public Treasury"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {isBn
            ? "সাভারচালা শান্তি সংঘ তহবিল ও আর্থিক বিবরণী"
            : "Savarchala Shanti Sangho Public Funds"}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {isBn
            ? "ক্লাবের প্রতিটি টুর্নামেন্ট, উৎসব, যুব উন্নয়ন এবং সমাজকল্যাণ তহবিলের সংগৃহীত অনুদান ও ব্যয়ের উন্মুক্ত হিসাব লেজার।"
            : "Transparent real-time financial balances, public donation logs, and expenditure records for all club campaigns."}
        </p>
      </div>

      {/* 2. Public Treasury Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        {/* Total Raised */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 rounded-2xl border border-emerald-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800">
              {isBn ? "মোট সংগৃহীত অনুদান" : "Total Contributions"}
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-800 tabular-nums">
            {formatMoney(totalRaised)}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
            {isBn ? "সদস্য ও শুভানুধ্যায়ীদের অনুদান" : "From members & generous donors"}
          </span>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 rounded-2xl border border-rose-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#f42a41]">
              {isBn ? "মোট ব্যয়িত অর্থ" : "Total Expenditures"}
            </span>
            <div className="p-2 rounded-xl bg-[#f42a41] text-white shadow-xs shrink-0">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#f42a41] tabular-nums">
            {formatMoney(totalSpent)}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
            {isBn ? "টুর্নামেন্ট, ম্যাচ ও উন্নয়নমূলক কাজে ব্যয়" : "For tournaments, equipment & welfare"}
          </span>
        </div>

        {/* Total Remaining */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#006a4e] to-[#004d38] text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-100">
              {isBn ? "বর্তমান ক্লাবের স্থিতি" : "Available Reserves"}
            </span>
            <div className="p-2 rounded-xl bg-white/20 text-white shadow-xs shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-white tabular-nums">
            {formatMoney(totalRemaining)}
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-100 font-medium mt-1">
            {isBn ? "সকল তহবিলের অবশিষ্ট ব্যালেন্স" : "Net reserve balance across active funds"}
          </span>
        </div>
      </div>

      {/* 3. Search and Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isBn
                  ? "তহবিলের নাম বা ক্যাটাগরি লিখে খুঁজুন..."
                  : "Search funds by name or category..."
              }
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-[#006a4e] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isBn ? "সবগুলো" : "All"}
            </button>
            {FUND_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#006a4e] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Active Funds Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {isBn ? "কোন সক্রিয় তহবিল পাওয়া যায়নি" : "No active funds found"}
            </p>
            <p className="text-xs text-slate-400">
              {isBn
                ? "অনুগ্রহ করে আপনার অনুসন্ধান ফিল্টার পরিবর্তন করুন"
                : "Try searching with a different keyword or category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunds.map((fund) => {
              const spentRatio =
                fund.totalIn > 0 ? (fund.totalOut / fund.totalIn) * 100 : 0;
              const catColor = CATEGORY_COLORS[fund.category] || {
                bg: "bg-slate-700",
                text: "text-white",
                border: "border-slate-800",
              };

              return (
                <div
                  key={fund.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${catColor.bg} ${catColor.text}`}
                      >
                        {fund.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {isBn ? "চলমান তহবিল" : "Active Campaign"}
                      </span>
                    </div>

                    {/* Fund Title */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#006a4e] transition-colors line-clamp-2 min-h-[44px]">
                        {fund.name}
                      </h3>
                    </div>

                    {/* Remaining Balance Pill */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {isBn ? "বর্তমান স্থিতি:" : "Net Balance:"}
                      </span>
                      <span className="text-lg font-black text-slate-900 tabular-nums">
                        {formatMoney(fund.remaining)}
                      </span>
                    </div>

                    {/* Raised vs Spent mini bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-emerald-700 font-bold">
                          + {formatMoney(fund.totalIn)}
                        </span>
                        <span className="text-[#f42a41] font-bold">
                          - {formatMoney(fund.totalOut)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#006a4e] transition-all"
                          style={{ width: `${Math.min(100, spentRatio)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{isBn ? "সংগৃহীত" : "Raised"}</span>
                        <span>{spentRatio.toFixed(0)}% {isBn ? "ব্যয়িত" : "used"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {(fund.summary?.contributionsCount ?? 0) + (fund.summary?.expensesCount ?? 0)}{" "}
                      {isBn ? "টি লেনদেন খতিয়ান" : "ledger entries"}
                    </span>
                    <Link
                      href={withLocaleHref(`/funds/${fund.id}`, locale)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>{isBn ? "উন্মুক্ত খতিয়ান" : "View Ledger"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Donor Call to Action */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#004d38] text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{isBn ? "ক্লাব উন্নয়নে সহায়তা করুন" : "Support Our Community"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isBn
              ? "সাভারচালা শান্তি সংঘের তহবিলে অনুদান প্রদান করতে চান?"
              : "Would you like to contribute to a club fund?"}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            {isBn
              ? "আমাদের টুর্নামেন্ট, যুব প্রশিক্ষণ ও এলাকার সামাজিক উদ্যোগে অংশগ্রহণ করুন। প্রতিটি অনুদান উন্মুক্ত ও স্বচ্ছভাবে হিসাবভুক্ত করা হয়।"
              : "Support our sports tournaments, youth programs, and community events. Every single taka is publicly accounted for."}
          </p>
        </div>

        <Link
          href={`/${locale}#about`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f2b705] hover:bg-[#d9a404] active:scale-95 text-slate-900 text-xs sm:text-sm font-black shadow-lg transition-all shrink-0"
        >
          <span>{isBn ? "যোগাযোগ ও বিস্তারিত" : "Contact Club Executive"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
