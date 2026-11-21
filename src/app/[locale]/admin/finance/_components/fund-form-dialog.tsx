"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckCircle2, AlertCircle, Loader2, FolderPlus, Edit3 } from "lucide-react";
import {
  fundFormSchema,
  FUND_CATEGORIES,
  type FundFormInput,
  type FundFormValues,
} from "@/lib/schemas/finance";
import type { Fund } from "@/lib/api/finance";
import { useCreateFund, useUpdateFund } from "@/lib/hooks/use-finance";

interface FundFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fundToEdit?: Fund | null;
  isBn?: boolean;
}

export function FundFormDialog({
  isOpen,
  onClose,
  fundToEdit,
  isBn = false,
}: FundFormDialogProps) {
  const isEditing = Boolean(fundToEdit);
  const createFundMutation = useCreateFund();
  const updateFundMutation = useUpdateFund();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FundFormInput, unknown, FundFormValues>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      name: "",
      category: "SPORTS",
      isActive: true,
    },
  });

  const isActiveValue = watch("isActive");

  useEffect(() => {
    if (fundToEdit) {
      reset({
        name: fundToEdit.name,
        category: fundToEdit.category,
        isActive: fundToEdit.isActive,
      });
    } else {
      reset({
        name: "",
        category: "SPORTS",
        isActive: true,
      });
    }
    setErrorMessage(null);
  }, [fundToEdit, reset, isOpen]);

  const handleClose = () => {
    reset();
    setErrorMessage(null);
    setSuccessToast(null);
    onClose();
  };

  const onSubmit = async (values: FundFormValues) => {
    setErrorMessage(null);
    try {
      if (isEditing && fundToEdit) {
        await updateFundMutation.mutateAsync({
          id: fundToEdit.id,
          payload: {
            name: values.name.trim(),
            category: values.category,
            isActive: values.isActive,
          },
        });
        setSuccessToast(
          isBn
            ? "তহবিলের তথ্য সফলভাবে আপডেট করা হয়েছে!"
            : "Fund updated successfully!"
        );
      } else {
        await createFundMutation.mutateAsync({
          name: values.name.trim(),
          category: values.category,
          isActive: values.isActive,
        });
        setSuccessToast(
          isBn
            ? "নতুন তহবিল সফলভাবে তৈরি করা হয়েছে!"
            : "New fund created successfully!"
        );
      }

      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isBn
          ? "তহবিল সংরক্ষণে সমস্যা হয়েছে।"
          : "Failed to save fund.";
      setErrorMessage(msg);
    }
  };

  if (!isOpen) return null;

  const isPending =
    createFundMutation.isPending || updateFundMutation.isPending || isSubmitting;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#006a4e] text-white shadow-xs">
              {isEditing ? (
                <Edit3 className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <FolderPlus className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isEditing
                  ? isBn
                    ? "ফান্ড এডিট করুন"
                    : "Edit Fund"
                  : isBn
                  ? "নতুন তহবিল তৈরি করুন"
                  : "Create New Fund"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? "ক্লাবের বাজেট ও অনুদান সংগ্রহের খাত"
                  : "Manage club treasury fund category"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006a4e] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#f42a41] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-[#f42a41] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Fund Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              {isBn ? "তহবিলের নাম *" : "Fund Name *"}
            </label>
            <input
              type="text"
              placeholder={
                isBn
                  ? "উদা: শান্তি সংঘ প্রিমিয়ার লীগ ২০২৬"
                  : "e.g. GPL Season 2026 or Football Tournament"
              }
              {...register("name")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e]"
            />
            {errors.name && (
              <p className="text-[11px] font-bold text-rose-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              {isBn ? "ক্যাটাগরি *" : "Category *"}
            </label>
            <select
              {...register("category")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e]"
            >
              {FUND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-[11px] font-bold text-rose-500">
                {errors.category.message}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              {isBn
                ? "GPL, SPORTS, OWAJ, IFTER_MAHFIL, FOOTBALL, OTHERS ইত্যাদি ক্যাটাগরি"
                : "Standard domain categories used for ledger grouping"}
            </p>
          </div>

          {/* Active Status Switch */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-black text-slate-800">
                {isBn ? "সক্রিয় তহবিল (Active Status)" : "Active Fund Status"}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isBn
                  ? "নিষ্ক্রিয় করলে নতুন অনুদান বা খরচ যোগ বন্ধ থাকবে"
                  : "Deactivate to archive and prevent new transactions"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActiveValue}
                onChange={(e) => setValue("isActive", e.target.checked, { shouldDirty: true })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006a4e]"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 text-white text-xs font-black shadow-md shadow-[#006a4e]/20 transition-all disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isEditing
                  ? isBn
                    ? "আপডেট করুন"
                    : "Save Changes"
                  : isBn
                  ? "তহবিল তৈরি করুন"
                  : "Create Fund"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
