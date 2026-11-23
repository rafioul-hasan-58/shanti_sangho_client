import React from "react";
import type { PaymentMethod } from "@/lib/schemas/finance";

export interface PaymentMethodLogoProps {
  method: PaymentMethod | "ALL" | string;
  className?: string;
}

/**
 * Authentic bKash origami bird logo
 */
export function BkashLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-[#e2136e] text-white shadow-2xs p-0.5 ${className}`}
      title="bKash"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Beak */}
        <polygon points="21,5 17,9.5 21.5,8.8" fill="#ffffff" />
        {/* Upper wing */}
        <polygon points="12,2 17,9.5 13.5,11.5" fill="#ffffff" fillOpacity="0.95" />
        {/* Left fold */}
        <polygon points="6,6 12,2 10.5,8" fill="#ffffff" fillOpacity="0.85" />
        {/* Body core */}
        <polygon points="10.5,8 17,9.5 12,15 9,12" fill="#ffffff" fillOpacity="0.9" />
        {/* Tail wing */}
        <polygon points="9,12 12,15 6,21 3,17" fill="#ffffff" fillOpacity="0.95" />
        {/* Tail point */}
        <polygon points="3,17 6,21 1.5,21.5" fill="#ffffff" fillOpacity="0.8" />
        {/* Underbody */}
        <polygon points="12,15 17,9.5 16,18" fill="#ffffff" fillOpacity="0.75" />
      </svg>
    </span>
  );
}

/**
 * Authentic Nagad stylized swirl / flame logo with brand gradient
 */
export function NagadLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-gradient-to-br from-[#f7941d] via-[#f15a24] to-[#e83a3b] text-white shadow-2xs p-0.5 ${className}`}
      title="Nagad"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M17.5 4.5C14.5 2 9.5 3 6.8 6.5C4 10 4.2 15 7.5 18.2C10.8 21.4 16 21.2 18.8 17.8C20.8 15.3 20.5 11.5 18 9.5C15.8 7.8 12.8 8.2 11.2 10.2C9.8 12 10.2 14.5 12 15.6C13.2 16.3 14.8 16 15.6 14.8C16.2 13.9 15.9 12.8 15 12.2"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
      </svg>
    </span>
  );
}

/**
 * Crisp Banknote Cash Logo
 */
export function CashLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-2xs p-0.5 ${className}`}
      title="Cash"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect
          x="2"
          y="5.5"
          width="20"
          height="13"
          rx="2.5"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.8" />
        <path
          d="M6 9.5h.01M18 14.5h.01"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Classical Bank Columns Logo
 */
export function BankLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-2xs p-0.5 ${className}`}
      title="Bank"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path d="M3 9.5L12 3l9 6.5H3z" fill="#ffffff" />
        <rect x="5" y="11" width="2.2" height="6.5" rx="0.5" fill="#ffffff" />
        <rect x="9.4" y="11" width="2.2" height="6.5" rx="0.5" fill="#ffffff" />
        <rect x="13.8" y="11" width="2.2" height="6.5" rx="0.5" fill="#ffffff" />
        <rect x="18.2" y="11" width="2.2" height="6.5" rx="0.5" fill="#ffffff" />
        <rect x="2" y="18.5" width="20" height="2" rx="0.5" fill="#ffffff" />
      </svg>
    </span>
  );
}

/**
 * Other Payment Logo
 */
export function OtherMethodLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-2xs p-0.5 ${className}`}
      title="Other"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect
          x="2.5"
          y="5.5"
          width="19"
          height="13"
          rx="2.5"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <path d="M2.5 10h19" stroke="#ffffff" strokeWidth="2" />
        <rect x="6" y="13.5" width="3.5" height="2" rx="0.5" fill="#ffffff" />
      </svg>
    </span>
  );
}

/**
 * All Methods Logo (Stacked Cards)
 */
export function AllMethodsLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-md bg-slate-700 text-white shadow-2xs p-0.5 ${className}`}
      title="All Methods"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect
          x="2.5"
          y="4.5"
          width="13"
          height="10"
          rx="2"
          stroke="#ffffff"
          strokeWidth="1.8"
        />
        <rect
          x="8.5"
          y="9.5"
          width="13"
          height="10"
          rx="2"
          fill="#334155"
          stroke="#ffffff"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

/**
 * Universal Payment Method Logo Renderer
 */
export function PaymentMethodLogo({
  method,
  className = "w-4 h-4",
}: PaymentMethodLogoProps) {
  const norm = (method || "").toUpperCase();
  switch (norm) {
    case "BKASH":
      return <BkashLogo className={className} />;
    case "NAGAD":
      return <NagadLogo className={className} />;
    case "CASH":
      return <CashLogo className={className} />;
    case "BANK":
      return <BankLogo className={className} />;
    case "OTHER":
      return <OtherMethodLogo className={className} />;
    case "ALL":
    default:
      return <AllMethodsLogo className={className} />;
  }
}
