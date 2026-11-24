"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface ThemedSelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface ThemedSelectProps<T extends string = string> {
  value: T;
  options: Array<ThemedSelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
  isFiltered?: boolean;
  icon?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  align?: "left" | "right";
  variant?: "filter" | "form";
  className?: string;
}

/**
 * Theme-styled accessible dropdown (`#006a4e` primary, `#f7f4ea` cream hover)
 * rendered via portal so menus never clip inside tables or modals.
 */
export default function ThemedSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  isFiltered = false,
  icon,
  size = "sm",
  align = "left",
  variant = "filter",
  className = "",
}: ThemedSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  }>({ top: 0, left: 0, width: 180, openUp: false });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedHeight = Math.min(options.length * 40 + 16, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;
    const menuWidth = Math.max(rect.width, 165);

    let left = align === "right" ? rect.right - menuWidth : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: menuWidth,
      openUp,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, options.length, align]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const sizeClass =
    size === "xs"
      ? "h-8 px-2.5 text-[11px] rounded-lg"
      : size === "sm"
        ? "h-9 px-3 text-xs rounded-xl"
        : size === "md"
          ? "h-10 px-3 text-xs sm:text-sm rounded-xl"
          : "h-12 px-3.5 text-sm rounded-xl";

  const triggerStateClass =
    variant === "form"
      ? open
        ? "bg-white border-[#006a4e] text-slate-900 ring-2 ring-[#006a4e]/20 shadow-xs"
        : isFiltered
          ? "bg-emerald-50/80 border-[#006a4e]/40 text-[#004d38] shadow-2xs font-extrabold"
          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs"
      : open
        ? "bg-white border-[#006a4e] text-[#006a4e] ring-2 ring-[#006a4e]/15"
        : isFiltered
          ? "bg-[#006a4e]/10 border-[#006a4e]/45 text-[#004d38]"
          : "bg-emerald-50/55 border-emerald-200/80 text-[var(--text)] hover:bg-emerald-100/60 hover:border-[#006a4e]/40";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`inline-flex items-center justify-between gap-2 border font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group select-none ${sizeClass} ${triggerStateClass} ${className}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {icon ? (
            <span className="shrink-0 flex items-center">{icon}</span>
          ) : selectedOption?.icon ? (
            <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
          ) : null}
          <span className="truncate">{selectedOption?.label ?? value}</span>
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${
            size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
          } ${
            open
              ? "rotate-180 text-[#006a4e]"
              : variant === "form"
                ? "text-slate-400 group-hover:text-slate-600"
                : "text-[#006a4e]/75"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxWidth: "calc(100vw - 16px)",
              transform: coords.openUp ? "translateY(-100%)" : undefined,
            }}
            className="z-[9999] max-h-72 overflow-y-auto rounded-2xl bg-white border border-[#006a4e]/25 shadow-xl shadow-slate-900/10 p-1.5 space-y-0.5 animate-in fade-in duration-150"
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left transition-all ${
                    opt.disabled
                      ? "opacity-40 cursor-not-allowed text-slate-400"
                      : selected
                        ? "bg-[#006a4e] text-white shadow-2xs font-black cursor-pointer"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-[#006a4e] cursor-pointer"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span
                        className={`shrink-0 flex items-center ${
                          selected ? "[&_svg]:text-white [&_svg]:fill-white" : ""
                        }`}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {selected && (
                    <svg
                      className="w-4 h-4 shrink-0 text-[#f2b705]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
