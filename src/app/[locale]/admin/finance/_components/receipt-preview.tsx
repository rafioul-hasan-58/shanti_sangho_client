"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Receipt, X, ExternalLink, ZoomIn, FileText } from "lucide-react";

interface ReceiptPreviewProps {
  receiptUrl?: string | null;
  title?: string;
  isBn?: boolean;
}

export function ReceiptPreviewModal({
  receiptUrl,
  title = "Receipt Voucher",
  isBn = false,
  isOpen,
  onClose,
}: ReceiptPreviewProps & { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !receiptUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isBn ? "রসিদ প্রিভিউ" : "Receipt preview"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#006a4e]" />
            <h3 className="font-bold text-sm text-slate-800 truncate">
              {title} {isBn ? "- ভাউচার / রসিদ" : "- Receipt Voucher"}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title={isBn ? "নতুন ট্যাবে খুলুন" : "Open full image in new tab"}
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Image */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] bg-neutral-900 flex items-center justify-center p-2 overflow-auto">
          <Image
            src={receiptUrl}
            alt={title}
            width={800}
            height={600}
            unoptimized
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Clickable Receipt button/icon that toggles the preview modal
 */
export function ReceiptButton({
  receiptUrl,
  title,
  isBn = false,
}: ReceiptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!receiptUrl) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={isBn ? "রসিদ দেখুন" : "View receipt voucher"}
        title={isBn ? "রসিদ দেখুন" : "View receipt voucher"}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/60 text-xs font-bold transition-colors cursor-pointer group"
      >
        <Receipt className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">{isBn ? "ভাউচার" : "Receipt"}</span>
      </button>

      <ReceiptPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        receiptUrl={receiptUrl}
        title={title}
        isBn={isBn}
      />
    </>
  );
}
