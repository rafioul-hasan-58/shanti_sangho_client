"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  format,
  isToday,
  parseISO,
  isValid,
} from "date-fns";

export interface DatePickerButtonProps {
  value: string; // "yyyy-MM-dd"
  onChange: (val: string) => void;
  label: string; // e.g. "শুরু" or "From"
  placeholder?: string; // e.g. "তারিখ দিন" or "Pick date"
  isBn?: boolean;
  colorTheme?: "emerald" | "sky" | "rose";
  align?: "left" | "right";
  className?: string;
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBengaliDigits = (num: number | string): string =>
  String(num).replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)] || d);

const BENGALI_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const BENGALI_MONTHS_SHORT = [
  "জানু",
  "ফেব্রু",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টে",
  "অক্টো",
  "নভে",
  "ডিসে",
];

const BENGALI_WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const ENGLISH_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerButton({
  value,
  onChange,
  label,
  placeholder,
  isBn = false,
  colorTheme = "emerald",
  align = "left",
  className = "",
}: DatePickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view date from value or today
  const selectedDate = value ? parseISO(value) : null;
  const initialDate =
    selectedDate && isValid(selectedDate) ? selectedDate : new Date();
  const [viewDate, setViewDate] = useState<Date>(initialDate);

  // Keep view date in sync when value changes
  useEffect(() => {
    if (value) {
      const d = parseISO(value);
      if (isValid(d)) {
        setViewDate(d);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Compute days in month grid
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Format display text on the button
  const formatDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const d = parseISO(dateStr);
      if (!isValid(d)) return dateStr;
      const day = d.getDate();
      const year = d.getFullYear();
      if (isBn) {
        return `${toBengaliDigits(day)} ${BENGALI_MONTHS_SHORT[d.getMonth()]} ${toBengaliDigits(year)}`;
      }
      return format(d, "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, "yyyy-MM-dd");
    onChange(formatted);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClearClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange("");
    setIsOpen(false);
  };

  // Color theme variables
  const isEmerald = colorTheme === "emerald";
  const isSky = colorTheme === "sky";

  const buttonBorder = isEmerald
    ? "border-emerald-300/80 hover:border-emerald-400"
    : isSky
    ? "border-sky-300/80 hover:border-sky-400"
    : "border-rose-300/80 hover:border-rose-400";

  const buttonBg = isEmerald
    ? "bg-emerald-50/50 hover:bg-emerald-50"
    : isSky
    ? "bg-sky-50/50 hover:bg-sky-50"
    : "bg-rose-50/50 hover:bg-rose-50";

  const iconColor = isEmerald
    ? "text-[#006a4e]"
    : isSky
    ? "text-sky-600"
    : "text-[#f42a41]";

  const badgeTextColor = isEmerald
    ? "text-emerald-800"
    : isSky
    ? "text-sky-800"
    : "text-rose-800";

  const defaultPlaceholder = isBn ? "তারিখ দিন" : "Pick date";

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 w-1/2 sm:w-auto sm:flex-initial min-w-0 ${className}`}
    >
      {/* Trigger Button - Clicking anywhere opens calendar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border ${buttonBorder} ${buttonBg} text-xs shadow-2xs transition-all cursor-pointer h-[38px] group focus:outline-none focus:ring-2 ${
          isEmerald
            ? "focus:ring-[#006a4e]/20"
            : isSky
            ? "focus:ring-sky-500/20"
            : "focus:ring-rose-500/20"
        } ${isOpen ? "ring-2 ring-[#006a4e]/30 bg-white" : ""}`}
        aria-label={`${label}: ${value || defaultPlaceholder}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <Calendar className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
          <span
            className={`text-[10px] uppercase font-black shrink-0 ${badgeTextColor}`}
          >
            {label}:
          </span>
          <span
            className={`text-[11px] sm:text-xs truncate ${
              value
                ? "font-black text-slate-900"
                : isEmerald
                ? "font-semibold text-emerald-900/60"
                : "font-semibold text-sky-900/60"
            }`}
          >
            {value ? formatDisplay(value) : placeholder || defaultPlaceholder}
          </span>
        </div>

        {/* Clear (X) button if value exists, otherwise subtle dot */}
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClearClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleClearClick();
              }
            }}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 shrink-0 cursor-pointer transition-colors"
            title={isBn ? "তারিখ মুছুন" : "Clear date"}
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isEmerald ? "bg-emerald-400" : isSky ? "bg-sky-400" : "bg-rose-400"
            }`}
          />
        )}
      </button>

      {/* Appealing Floating Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 sm:p-4 text-xs animate-in fade-in zoom-in-95 ${
            align === "right"
              ? "right-0 sm:right-0 sm:left-auto origin-top-right"
              : "left-0 sm:left-0 sm:right-auto origin-top-left"
          }`}
        >
          {/* Calendar Header: Month & Year + Prev/Next Controls */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                {isBn
                  ? `${BENGALI_MONTHS[viewDate.getMonth()]} ${toBengaliDigits(viewDate.getFullYear())}`
                  : format(viewDate, "MMMM yyyy")}
              </h4>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewDate((prev) => subMonths(prev, 1))}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                title={isBn ? "পূর্ববর্তী মাস" : "Previous Month"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewDate((prev) => addMonths(prev, 1))}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                title={isBn ? "পরবর্তী মাস" : "Next Month"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {(isBn ? BENGALI_WEEKDAYS : ENGLISH_WEEKDAYS).map((wd, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-[11px] font-black text-slate-400 py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isSelected =
                selectedDate && isValid(selectedDate)
                  ? isSameDay(day, selectedDate)
                  : false;
              const isTodayDate = isToday(day);

              const dayNum = isBn
                ? toBengaliDigits(day.getDate())
                : day.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#006a4e] text-white font-black shadow-md shadow-[#006a4e]/25 scale-105"
                      : isTodayDate
                      ? "border-2 border-[#006a4e] text-[#006a4e] font-black bg-emerald-50/70"
                      : isCurrentMonth
                      ? "text-slate-800 font-bold hover:bg-emerald-50 hover:text-[#006a4e] active:scale-95"
                      : "text-slate-300 font-normal hover:bg-slate-50"
                  }`}
                  title={format(day, "yyyy-MM-dd")}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action Bar */}
          <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleTodayClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 font-black transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{isBn ? "আজ" : "Today"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {value && (
                <button
                  type="button"
                  onClick={() => handleClearClick()}
                  className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                >
                  {isBn ? "মুছুন" : "Clear"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                {isBn ? "বন্ধ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
