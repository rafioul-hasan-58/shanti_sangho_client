"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, ChevronDown, Check, X, User } from "lucide-react";
import { useFinanceMembers } from "@/lib/hooks/use-finance";
import type { FinanceMember } from "@/lib/api/finance";

interface MemberComboboxProps {
  value?: string | null;
  onChange: (memberId: string | null, member?: FinanceMember | null) => void;
  label?: string;
  placeholder?: string;
  isBn?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function MemberCombobox({
  value,
  onChange,
  label,
  placeholder = "Search club member / সদস্য খুঁজুন...",
  isBn = false,
  disabled = false,
  required = false,
  error,
  className = "",
}: MemberComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: members = [], isLoading } = useFinanceMembers(searchTerm);

  const selectedMember = members.find((m) => m.id === value) || null;

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (member: FinanceMember) => {
    onChange(member.id, member);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
    setSearchTerm("");
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#f42a41]">*</span>}
          </span>
          {selectedMember && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isBn ? "মুছে ফেলুন" : "Clear"}
            </button>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border bg-white text-left text-sm transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006a4e] cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? "border-red-300 ring-1 ring-red-200"
            : isOpen
            ? "border-[#006a4e] ring-2 ring-[#006a4e]/20"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedMember ? (
            <>
              <div className="relative w-6 h-6 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs">
                {selectedMember.avatar ? (
                  <Image
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{selectedMember.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate block">
                  {selectedMember.name}
                </span>
                {selectedMember.role && (
                  <span className="text-[10px] text-slate-400 truncate block">
                    {selectedMember.role}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
              <User className="w-4 h-4 text-slate-300" />
              <span>{placeholder}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selectedMember && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 hover:text-slate-600 rounded-md cursor-pointer"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isBn ? "নাম বা ফোন লিখে খুঁজুন..." : "Type name or phone..."}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
              />
            </div>
          </div>

          {/* Member List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50" role="listbox">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {isBn ? "লোড হচ্ছে..." : "Loading members..."}
              </div>
            ) : members.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {isBn ? "কোনো সদস্য পাওয়া যায়নি" : "No members found"}
              </div>
            ) : (
              members.map((member) => {
                const isSelected = member.id === value;
                return (
                  <button
                    key={member.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(member)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#EEF8F1] text-[#006a4e] font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-7 h-7 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs">
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{member.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">{member.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          {member.role && <span>{member.role}</span>}
                          {member.phone && <span>• {member.phone}</span>}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#006a4e] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-[#f42a41] mt-0.5">{error}</p>}
    </div>
  );
}
