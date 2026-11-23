"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import {
  X,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  UploadCloud,
  Trash2,
  AlertCircle,
  Receipt,
  Loader2,
  Edit3,
} from "lucide-react";
import { useFunds, useAddExpense, useUpdateExpense } from "@/lib/hooks/use-finance";
import type { Expense } from "@/lib/api/finance";
import { useAuth } from "@/context/AuthContext";
import { uploadReceiptImage } from "@/lib/api/upload";
import {
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from "@/lib/schemas/finance";
import { MemberCombobox } from "./member-combobox";
import { formatMoney, formatFundCategory } from "@/lib/format";

interface ExpenseFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFundId?: string;
  expenseToEdit?: Expense | null;
  isBn?: boolean;
}

export function ExpenseFormSheet({
  isOpen,
  onClose,
  defaultFundId,
  expenseToEdit,
  isBn = false,
}: ExpenseFormSheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isEditing = Boolean(expenseToEdit);
  const { user } = useAuth();
  const { data: funds = [], isLoading: isLoadingFunds } = useFunds();
  const addExpenseMutation = useAddExpense();
  const updateExpenseMutation = useUpdateExpense();

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Receipt image preview
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultHandlerId = user?.id ? String(user.id) : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      fundId: defaultFundId || "",
      amount: "" as unknown as number,
      spentAt: format(new Date(), "yyyy-MM-dd"),
      spentOn: "",
      spentById: defaultHandlerId,
      note: "",
      receiptUrl: null,
    },
  });

  const selectedFundId = watch("fundId");
  const enteredAmount = watch("amount");
  const selectedSpentById = watch("spentById");

  // Find currently selected fund to show live balance
  const currentFund = funds.find((f) => f.id === selectedFundId) || null;
  const currentRemaining = currentFund?.remaining ?? 0;
  const numEnteredAmount = Number(enteredAmount) || 0;
  const isOverBalance = numEnteredAmount > 0 && currentFund && numEnteredAmount > currentRemaining;

  // Sync expenseToEdit or defaultFundId
  useEffect(() => {
    if (expenseToEdit) {
      reset({
        fundId: expenseToEdit.fundId,
        amount: expenseToEdit.amount,
        spentAt: format(new Date(expenseToEdit.spentAt), "yyyy-MM-dd"),
        spentOn: expenseToEdit.spentOn,
        spentById: expenseToEdit.spentById || defaultHandlerId,
        note: expenseToEdit.note || "",
        receiptUrl: expenseToEdit.receiptUrl || null,
      });
      setReceiptPreviewUrl(expenseToEdit.receiptUrl || null);
    } else if (defaultFundId) {
      setValue("fundId", defaultFundId);
      setReceiptPreviewUrl(null);
    } else if (funds.length > 0 && !selectedFundId) {
      setValue("fundId", funds[0].id);
      setReceiptPreviewUrl(null);
    }
  }, [expenseToEdit, defaultFundId, funds, defaultHandlerId, reset, setValue, selectedFundId, isOpen]);

  // Handle Close with dirty check
  const handleAttemptClose = () => {
    const isPending = isEditing
      ? updateExpenseMutation.isPending
      : addExpenseMutation.isPending;
    if (isDirty && !isPending) {
      setConfirmDiscardOpen(true);
    } else {
      handleFinalClose();
    }
  };

  const handleFinalClose = () => {
    setConfirmDiscardOpen(false);
    reset();
    setReceiptPreviewUrl(null);
    onClose();
  };

  // Receipt file select handler with Cloudinary upload
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create an object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreviewUrl(objectUrl);
    setValue("receiptUrl", objectUrl, { shouldDirty: true });
    setIsUploadingReceipt(true);

    try {
      const uploadedUrl = await uploadReceiptImage(file);
      setValue("receiptUrl", uploadedUrl, { shouldDirty: true });
      setReceiptPreviewUrl(uploadedUrl);
    } catch (err) {
      console.warn("Receipt image upload fallback to preview URL:", err);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
    }
    setReceiptPreviewUrl(null);
    setValue("receiptUrl", null, { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Handler
  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      if (isEditing && expenseToEdit) {
        await updateExpenseMutation.mutateAsync({
          id: expenseToEdit.id,
          payload: {
            fundId: values.fundId,
            amount: Number(values.amount),
            spentAt: new Date(values.spentAt).toISOString(),
            spentOn: values.spentOn,
            spentById: values.spentById || null,
            note: values.note || null,
            receiptUrl: values.receiptUrl || null,
          },
        });

        setSuccessToast(
          isBn
            ? "ব্যয়ের হিসাব সফলভাবে আপডেট করা হয়েছে!"
            : "Expense updated successfully!"
        );
      } else {
        await addExpenseMutation.mutateAsync({
          fundId: values.fundId,
          amount: Number(values.amount),
          spentAt: new Date(values.spentAt).toISOString(),
          spentOn: values.spentOn,
          spentById: values.spentById || null,
          note: values.note || null,
          receiptUrl: values.receiptUrl || null,
        });

        setSuccessToast(
          isBn
            ? "ব্যয়ের হিসাব সফলভাবে সংরক্ষণ করা হয়েছে!"
            : "Expense successfully recorded!"
        );
      }

      setTimeout(() => {
        setSuccessToast(null);
        handleFinalClose();
      }, 1200);
    } catch {
      // Mutation handles error
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={handleAttemptClose}
    >
      <div
        className="w-full max-w-lg h-[100dvh] max-h-[100dvh] bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Colorful Crimson Gradient */}
        <header className="px-5 py-4 border-b border-rose-800/20 flex items-center justify-between bg-gradient-to-r from-rose-700 via-[#f42a41] to-red-800 text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 text-white border border-white/20 shadow-xs">
              {isEditing ? <Edit3 className="w-5 h-5 stroke-[2.5]" /> : <Receipt className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                {isEditing
                  ? isBn
                    ? "খরচ এডিট করুন"
                    : "Edit Expense"
                  : isBn
                  ? "নতুন ব্যয়ের হিসাব যোগ করুন"
                  : "Add Expense"}
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                {isEditing
                  ? isBn
                    ? "ব্যয়ের বিবরণ, পরিমাণ বা রসিদ সংশোধন করুন"
                    : "Update details of recorded expenditure"
                  : isBn
                  ? "ক্লাবের তহবিল থেকে খরচের বিবরণ রেকর্ড করুন"
                  : "Record an expenditure from a club fund"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Success Toast Banner */}
        {successToast && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006a4e] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          id="expense-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          {/* Fund Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "যে তহবিল থেকে খরচ হবে" : "Fund Source"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <select
              {...register("fundId")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all cursor-pointer"
            >
              <option value="" disabled>
                {isBn ? "-- তহবিল নির্বাচন করুন --" : "-- Select Fund --"}
              </option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} [{formatFundCategory(f.category, isBn)}] (Remaining: {formatMoney(f.remaining)})
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.fundId.message}
              </p>
            )}
          </div>

          {/* Amount (Taka) + Live Remaining Balance + Overbalance Warning */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? "খরচের পরিমাণ (টাকা)" : "Amount (Taka)"}{" "}
                <span className="text-[#f42a41]">*</span>
              </label>
              {currentFund && (
                <span className="text-[11px] font-semibold text-slate-500">
                  {isBn ? "বর্তমান উদ্বৃত্ত:" : "Current remaining:"}{" "}
                  <span
                    className={`font-black tabular-nums ${
                      currentRemaining < 10000 ? "text-amber-600" : "text-[#006a4e]"
                    }`}
                  >
                    {formatMoney(currentRemaining)}
                  </span>
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                ৳
              </span>
              <input
                type="number"
                step="1"
                placeholder="0"
                {...register("amount")}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white text-base font-black text-slate-900 tracking-tight tabular-nums placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                  isOverBalance
                    ? "border-amber-300 focus:border-amber-500 focus:ring-amber-200"
                    : "border-slate-200 focus:border-[#006a4e] focus:ring-[#006a4e]/20"
                }`}
              />
            </div>

            {/* Warning (not a block) if amount > remaining */}
            {isOverBalance && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-amber-800 text-xs font-semibold animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? `সতর্কতা: খরচের পরিমাণ (${formatMoney(
                        numEnteredAmount
                      )}) এই তহবিলের বর্তমান উদ্বৃত্তের (${formatMoney(
                        currentRemaining
                      )}) চেয়ে বেশি।`
                    : `Warning: Expense amount (${formatMoney(
                        numEnteredAmount
                      )}) exceeds the current remaining balance (${formatMoney(
                        currentRemaining
                      )}).`}
                </span>
              </div>
            )}

            {errors.amount && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Spent On (Purpose) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "ব্যয়ের খাত / উদ্দেশ্য" : "Spent On (Purpose)"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <input
              type="text"
              placeholder={
                isBn
                  ? "যেমন: ফুটবল ও জার্সি ক্রয় / লাইটিং মেরামত"
                  : "e.g. Match jerseys & bibs / Clubhouse maintenance"
              }
              {...register("spentOn")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
            />
            {errors.spentOn && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.spentOn.message}
              </p>
            )}
          </div>

          {/* Date Spent */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "ব্যয়ের তারিখ" : "Date Spent"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <input
              type="date"
              {...register("spentAt")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
            />
            {errors.spentAt && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.spentAt.message}
              </p>
            )}
          </div>

          {/* Handled By (Member Combobox - Optional) */}
          <div>
            <MemberCombobox
              label={isBn ? "ব্যয় পরিচালনাকারী (Handled By)" : "Handled By (Optional)"}
              value={selectedSpentById}
              onChange={(id) => setValue("spentById", id, { shouldDirty: true })}
              placeholder={isBn ? "সদস্য নির্বাচন করুন (ঐচ্ছিক)..." : "Select member (optional)..."}
              isBn={isBn}
            />
          </div>

          {/* Receipt Upload & Preview */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "ভাউচার / রসিদের ছবি" : "Receipt / Voucher Image"}{" "}
              <span className="text-slate-400 font-normal">
                ({isBn ? "ঐচ্ছিক" : "optional"})
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptFileChange}
            />

            {receiptPreviewUrl ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <Image
                      src={receiptPreviewUrl}
                      alt="Receipt preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {isBn ? "রসিদের ছবি সংযুক্ত" : "Receipt image attached"}
                    </span>
                    {isUploadingReceipt ? (
                      <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                        <span>{isBn ? "ক্লাউডে আপলোড হচ্ছে..." : "Uploading image..."}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#006a4e] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{isBn ? "আপলোড সম্পন্ন" : "Uploaded to cloud"}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove receipt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-[#006a4e] rounded-xl flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#006a4e] transition-colors" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-[#006a4e]">
                  {isBn
                    ? "রসিদ বা ভাউচার আপলোড করুন"
                    : "Upload receipt image or voucher"}
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG, WEBP (Max 5MB)
                </span>
              </button>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "অতিরিক্ত বিবরণ / নোট" : "Note / Remarks"}{" "}
              <span className="text-slate-400 font-normal">
                ({isBn ? "ঐচ্ছিক" : "optional"})
              </span>
            </label>
            <textarea
              rows={2}
              placeholder={
                isBn
                  ? "ব্যয়ের কোনো বিশেষ তথ্য থাকলে লিখুন..."
                  : "Any specific notes or bill details..."
              }
              {...register("note")}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all resize-none"
            />
          </div>
        </form>

        {/* Sticky Footer Actions with Safe Mobile Padding */}
        <footer className="p-4 sm:p-5 pb-6 sm:pb-5 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={handleAttemptClose}
            disabled={addExpenseMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {isBn ? "বাতিল" : "Cancel"}
          </button>

          <button
            type="submit"
            form="expense-form"
            disabled={
              isEditing
                ? updateExpenseMutation.isPending
                : addExpenseMutation.isPending
            }
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-[#f42a41] to-red-700 hover:from-rose-700 hover:to-red-800 active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-900/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            {(isEditing
              ? updateExpenseMutation.isPending
              : addExpenseMutation.isPending) ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {isEditing
                    ? isBn
                      ? "আপডেট হচ্ছে..."
                      : "Updating..."
                    : isBn
                    ? "সংরক্ষণ হচ্ছে..."
                    : "Submitting..."}
                </span>
              </span>
            ) : (
              <span>
                {isEditing
                  ? isBn
                    ? "আপডেট সংরক্ষণ করুন"
                    : "Update Expense"
                  : isBn
                  ? "খরচের হিসাব সংরক্ষণ করুন"
                  : "Save Expense"}
              </span>
            )}
          </button>
        </footer>

        {/* Confirm Discard Modal */}
        {confirmDiscardOpen && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 space-y-3 animate-fadeIn">
              <h4 className="font-bold text-sm text-slate-900">
                {isBn ? "পরিবর্তন বাতিল করবেন?" : "Discard unsaved changes?"}
              </h4>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "আপনি যেসব তথ্য লিখেছেন তা সংরক্ষণ করা হবে না।"
                  : "You have unsaved changes that will be lost."}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDiscardOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {isBn ? "থাকুক" : "Keep editing"}
                </button>
                <button
                  type="button"
                  onClick={handleFinalClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#f42a41] text-white hover:bg-red-700 transition-colors"
                >
                  {isBn ? "বাতিল করুন" : "Discard"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
