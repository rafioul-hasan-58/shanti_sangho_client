"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, Layers, Wallet } from "lucide-react";
import type { Fund } from "@/lib/api/finance";
import { formatMoney, formatFundCategory } from "@/lib/format";

interface FundSelectDropdownProps {
  funds: Fund[];
  value?: string;
  onChange: (fundId: string) => void;
  label?: string;
  placeholder?: string;
  isBn?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function getCategoryBadgeClass(category?: string) {
  const norm = (category || "").toUpperCase().trim();
  switch (norm) {
    case "IFTER_MAHFIL":
      return "bg-teal-50 text-teal-800 border-teal-200/90";
    case "OWAJ":
      return "bg-amber-50 text-amber-900 border-amber-200/90";
    case "SPORTS":
      return "bg-sky-50 text-sky-800 border-sky-200/90";
    case "FOOTBALL":
      return "bg-purple-50 text-purple-800 border-purple-200/90";
    case "GPL":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function FundSelectDropdown({
  funds,
  value,
  onChange,
  label,
  placeholder,
  isBn = false,
  disabled = false,
  required = false,
  error,
  className = "",
}: FundSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedFund = useMemo(() => {
    return funds.find((f) => f.id === value) || null;
  }, [funds, value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered funds by search term
  const filteredFunds = useMemo(() => {
    if (!search.trim()) return funds;
    const q = search.toLowerCase().trim();
    return funds.filter((f) => {
      const nameMatch = f.name.toLowerCase().includes(q);
      const catMatch = (f.category || "").toLowerCase().includes(q);
      const catBnMatch = formatFundCategory(f.category, isBn).toLowerCase().includes(q);
      return nameMatch || catMatch || catBnMatch;
    });
  }, [funds, search, isBn]);

  const defaultPlaceholder = isBn
    ? "-- ফান্ড সিলেক্ট করুন --"
    : "-- Select Fund --";

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#f42a41]">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full min-h-[44px] flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border bg-white text-left text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? "border-red-300 ring-1 ring-red-200"
            : isOpen
            ? "border-[#006a4e] ring-2 ring-[#006a4e]/20"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {selectedFund ? (
          <div className="flex items-center justify-between gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                {selectedFund.name}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${getCategoryBadgeClass(
                  selectedFund.category
                )}`}
              >
                {formatFundCategory(selectedFund.category, isBn)}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-black shrink-0">
              <Wallet className="w-3 h-3 text-emerald-600" />
              <span>{formatMoney(selectedFund.remaining)}</span>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 font-medium text-xs sm:text-sm">
            {placeholder || defaultPlaceholder}
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {error && <p className="text-[11px] font-semibold text-[#f42a41]">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-top duration-150">
          {/* Search bar inside dropdown if multiple funds */}
          {funds.length > 3 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isBn ? "ফান্ড সার্চ করুন..." : "Search funds..."
                  }
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>
          )}

          {/* Funds List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredFunds.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                {isBn ? "কোনো ফান্ড পাওয়া যায়নি" : "No funds found"}
              </div>
            ) : (
              filteredFunds.map((f) => {
                const isSelected = f.id === value;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onChange(f.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#006a4e]/10 border border-[#006a4e]/40 shadow-xs"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${getCategoryBadgeClass(
                          f.category
                        )}`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isSelected
                                ? "text-[#006a4e] font-black"
                                : "text-slate-800"
                            }`}
                          >
                            {f.name}
                          </span>
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getCategoryBadgeClass(
                            f.category
                          )}`}
                        >
                          {formatFundCategory(f.category, isBn)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-black tabular-nums text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2 py-0.5 rounded-lg">
                        {formatMoney(f.remaining)}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#006a4e] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
