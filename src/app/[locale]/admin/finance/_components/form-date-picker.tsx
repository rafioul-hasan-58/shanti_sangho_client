"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
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

export interface FormDatePickerProps {
  value: string; // "yyyy-MM-dd"
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  isBn?: boolean;
  colorTheme?: "emerald" | "sky" | "rose";
  placement?: "bottom" | "top";
  disabled?: boolean;
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

const BENGALI_WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const ENGLISH_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function FormDatePicker({
  value,
  onChange,
  label,
  required = false,
  error,
  placeholder,
  isBn = false,
  colorTheme = "emerald",
  placement,
  disabled = false,
  className = "",
}: FormDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view date from value or today
  const selectedDate = value ? parseISO(value) : null;
  const initialDate =
    selectedDate && isValid(selectedDate) ? selectedDate : new Date();
  const [viewDate, setViewDate] = useState<Date>(initialDate);

  // Auto-detect placement if not explicitly set
  const [computedPlacement, setComputedPlacement] = useState<"bottom" | "top">(
    placement || "bottom"
  );

  useEffect(() => {
    if (value) {
      const d = parseISO(value);
      if (isValid(d)) {
        setViewDate(d);
      }
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement) {
        setComputedPlacement(placement);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 330 && spaceAbove > 330) {
          setComputedPlacement("top");
        } else {
          setComputedPlacement("bottom");
        }
      }
    }
  }, [isOpen, placement]);

  // Close on click outside or Escape
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
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      if (isBn) {
        return `${toBengaliDigits(day)} ${BENGALI_MONTHS[monthIdx]} ${toBengaliDigits(year)}`;
      }
      return format(d, "dd MMMM yyyy");
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

  // Color theme styles
  const isEmerald = colorTheme === "emerald";
  const isSky = colorTheme === "sky";

  const selectedDayStyle = isEmerald
    ? "bg-[#006a4e] text-white font-black shadow-md shadow-[#006a4e]/25 scale-105"
    : isSky
    ? "bg-sky-600 text-white font-black shadow-md shadow-sky-600/25 scale-105"
    : "bg-[#f42a41] text-white font-black shadow-md shadow-[#f42a41]/25 scale-105";

  const todayDayStyle = isEmerald
    ? "border-2 border-[#006a4e] text-[#006a4e] font-black bg-emerald-50/70"
    : isSky
    ? "border-2 border-sky-600 text-sky-700 font-black bg-sky-50/70"
    : "border-2 border-[#f42a41] text-[#f42a41] font-black bg-rose-50/70";

  const currentMonthHover = isEmerald
    ? "text-slate-800 font-bold hover:bg-emerald-50 hover:text-[#006a4e] active:scale-95"
    : isSky
    ? "text-slate-800 font-bold hover:bg-sky-50 hover:text-sky-700 active:scale-95"
    : "text-slate-800 font-bold hover:bg-rose-50 hover:text-[#f42a41] active:scale-95";

  const todayActionBtnStyle = isEmerald
    ? "bg-emerald-50 text-[#006a4e] hover:bg-emerald-100"
    : isSky
    ? "bg-sky-50 text-sky-700 hover:bg-sky-100"
    : "bg-rose-50 text-[#f42a41] hover:bg-rose-100";

  const defaultPlaceholder = isBn ? "তারিখ নির্বাচন করুন" : "Select date";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-xs font-bold text-slate-700 block mb-1.5">
          {label} {required && <span className="text-[#f42a41]">*</span>}
        </label>
      )}

      {/* Form Input Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`w-full min-h-[44px] flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border bg-white text-left transition-all shadow-2xs focus:outline-none focus:ring-2 cursor-pointer ${
          error
            ? "border-[#f42a41] ring-2 ring-[#f42a41]/15"
            : isOpen
            ? isEmerald
              ? "border-[#006a4e] ring-2 ring-[#006a4e]/20"
              : isSky
              ? "border-sky-500 ring-2 ring-sky-500/20"
              : "border-[#f42a41] ring-2 ring-[#f42a41]/20"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar
            className={`w-4 h-4 shrink-0 ${
              isEmerald
                ? "text-[#006a4e]"
                : isSky
                ? "text-sky-600"
                : "text-[#f42a41]"
            }`}
          />
          <span
            className={`text-xs sm:text-sm truncate ${
              value ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
            }`}
          >
            {value ? formatDisplay(value) : placeholder || defaultPlaceholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClearClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClearClick();
                }
              }}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              title={isBn ? "মুছুন" : "Clear"}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          ) : (
            <Calendar
              className={`w-3.5 h-3.5 ${
                isEmerald
                  ? "text-emerald-500/60"
                  : isSky
                  ? "text-sky-500/60"
                  : "text-rose-500/60"
              }`}
            />
          )}
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] font-semibold text-[#f42a41] mt-1">{error}</p>
      )}

      {/* Appealing Floating Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            computedPlacement === "top"
              ? "bottom-full mb-2 origin-bottom-left"
              : "top-full mt-2 origin-top-left"
          } left-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 sm:p-4 text-xs animate-in fade-in zoom-in-95`}
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
                      ? selectedDayStyle
                      : isTodayDate
                      ? todayDayStyle
                      : isCurrentMonth
                      ? currentMonthHover
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
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${todayActionBtnStyle} font-black transition-colors cursor-pointer`}
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
