"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X, Plus, Minus, Check, RotateCcw } from "lucide-react";
import { DEFAULT_ASPECT_RATIO } from "@/lib/image/compress";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspectRatio?: number;
  locale?: string;
  onClose: () => void;
  onConfirm: (croppedAreaPixels: Area) => void;
  isProcessing?: boolean;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  locale,
  onClose,
  onConfirm,
  isProcessing = false,
}: ImageCropModalProps) {
  const pathname = usePathname();
  const isBn = locale ? locale === "bn" : !pathname?.startsWith("/en");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Reset coordinates whenever modal opens or imageSrc changes
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      previousActiveElement.current = document.activeElement as HTMLElement | null;

      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Trap initial focus inside modal
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = origOverflow;
      };
    } else {
      // Restore focus on close
      previousActiveElement.current?.focus();
    }
  }, [isOpen, imageSrc]);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, currentCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(currentCroppedAreaPixels);
    },
    []
  );

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))));
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleConfirm = useCallback(() => {
    if (croppedAreaPixels && !isProcessing) {
      onConfirm(croppedAreaPixels);
    }
  }, [croppedAreaPixels, isProcessing, onConfirm]);

  // Keyboard navigation & Shortcuts (Esc, Enter, +/-, Arrow keys)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus Trap logic
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        // Prevent enter on cancel or reset from triggering confirm
        const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (targetTag !== "button") {
          e.preventDefault();
          handleConfirm();
        }
        return;
      }

      // Zoom keys
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
        return;
      }

      // Arrow keys to nudge image crop position
      const STEP_PX = 10;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCrop((prev) => ({ ...prev, y: prev.y - STEP_PX }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCrop((prev) => ({ ...prev, y: prev.y + STEP_PX }));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCrop((prev) => ({ ...prev, x: prev.x - STEP_PX }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCrop((prev) => ({ ...prev, x: prev.x + STEP_PX }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleConfirm, handleZoomIn, handleZoomOut]);

  if (!isOpen || !imageSrc || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-200 p-0 sm:p-4"
    >
      <div
        ref={modalRef}
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-2xl bg-neutral-900 border-0 sm:border sm:border-neutral-800 text-neutral-100 flex flex-col shadow-2xl overflow-hidden motion-reduce:transition-none transition-all duration-200"
      >
        {/* Header: Close (X) on left, clean localized Title in the center, Save button on right */}
        <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3.5 border-b border-neutral-800 bg-neutral-900/95 z-20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label={isBn ? "বন্ধ করুন" : "Close"}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <X className="w-5 h-5" />
          </button>

          <h2
            id="crop-modal-title"
            className="flex-1 min-w-0 text-center text-xs sm:text-sm md:text-base font-bold text-neutral-100 select-none truncate px-2"
          >
            {isBn ? "ছবি সরিয়ে ঠিক করুন" : "Drag image to adjust"}
          </h2>

          {/* Quick Save button in header */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || isProcessing}
            aria-label={isBn ? "ছবি সংরক্ষণ করুন" : "Save cropped photo"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006a4e] hover:bg-[#004d38] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isBn ? "সংরক্ষণ" : "Save"}</span>
          </button>
        </header>

        {/* Crop Area */}
        <div className="relative flex-1 min-h-0 bg-neutral-950 overflow-hidden select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape="rect"
            showGrid={true}
            zoomWithScroll={true}
            minZoom={1}
            maxZoom={3}
            zoomSpeed={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
            classes={{
              containerClassName: "w-full h-full",
              cropAreaClassName:
                "!border-2 !border-[#f2b705] !rounded-lg !shadow-[0_0_0_9999px_rgba(0,0,0,0.72)]",
            }}
          />

          {/* Round + and − buttons on the right side */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3 || isProcessing}
              aria-label="Zoom in / জুম বড় করুন"
              title="Zoom in (+)"
              className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705] active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1 || isProcessing}
              aria-label="Zoom out / জুম ছোট করুন"
              title="Zoom out (-)"
              className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705] active:scale-95"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slim Zoom Slider */}
        <div className="px-5 py-2.5 bg-neutral-900 border-t border-neutral-800/80 flex items-center gap-3 select-none shrink-0">
          <span className="text-xs font-medium text-neutral-400">1x</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            disabled={isProcessing}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom slider / জুম নিয়ন্ত্রণ"
            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#f2b705] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          />
          <span className="text-xs font-medium text-neutral-400">3x</span>
          <span className="text-xs font-mono font-semibold text-[#f2b705] min-w-[36px] text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Footer Actions: Reset on left, Cancel and Primary Save Button with clear label on right */}
        <footer className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing}
            aria-label={isBn ? "অবস্থান রিসেট করুন" : "Reset position and zoom"}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f2b705]" />
            <span>{isBn ? "রিসেট" : "Reset"}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!croppedAreaPixels || isProcessing}
              aria-label={isBn ? "ছবি সংরক্ষণ করুন" : "Save photo"}
              title="Save (Enter)"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>{isBn ? "সংরক্ষণ করুন" : "Save Photo"}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
