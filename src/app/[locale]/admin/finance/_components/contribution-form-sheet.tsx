"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X, Plus, AlertCircle, CheckCircle2, DollarSign, Calendar, FileText, UserCheck, Users, HelpCircle, Edit3 } from "lucide-react";
import { useFunds, useAddContribution, useUpdateContribution } from "@/lib/hooks/use-finance";
import type { Contribution } from "@/lib/api/finance";
import { useAuth } from "@/context/AuthContext";
import {
  contributionFormSchema,
  PAYMENT_METHODS,
  type ContributionFormInput,
  type ContributionFormValues,
  type PaymentMethod,
} from "@/lib/schemas/finance";
import { MemberCombobox } from "./member-combobox";
import { PaymentMethodLogo } from "./payment-method-logo";
import { formatMoney, formatFundCategory } from "@/lib/format";

interface ContributionFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFundId?: string;
  contributionToEdit?: Contribution | null;
  isBn?: boolean;
}

export function ContributionFormSheet({
  isOpen,
  onClose,
  defaultFundId,
  contributionToEdit,
  isBn = false,
}: ContributionFormSheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isEditing = Boolean(contributionToEdit);
  const { user } = useAuth();
  const { data: funds = [], isLoading: isLoadingFunds } = useFunds();
  const addContributionMutation = useAddContribution();
  const updateContributionMutation = useUpdateContribution();

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const defaultReceiverId = user?.id ? String(user.id) : "mem-1";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ContributionFormInput, unknown, ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      fundId: defaultFundId || "",
      amount: "" as unknown as number,
      method: "CASH",
      receivedAt: format(new Date(), "yyyy-MM-dd"),
      giverType: "MEMBER",
      giverMemberId: null,
      giverName: "",
      receivedById: defaultReceiverId,
      reference: "",
      note: "",
    },
  });

  const selectedFundId = watch("fundId");
  const selectedMethod = watch("method");
  const giverType = watch("giverType");
  const selectedGiverMemberId = watch("giverMemberId");
  const selectedReceiverId = watch("receivedById");

  // Sync contributionToEdit or defaultFundId
  useEffect(() => {
    if (contributionToEdit) {
      reset({
        fundId: contributionToEdit.fundId,
        amount: contributionToEdit.amount,
        method: (contributionToEdit.method as PaymentMethod) || "CASH",
        receivedAt: format(new Date(contributionToEdit.receivedAt), "yyyy-MM-dd"),
        giverType: contributionToEdit.giverMemberId ? "MEMBER" : "OUTSIDER",
        giverMemberId: contributionToEdit.giverMemberId || null,
        giverName: contributionToEdit.giverName || "",
        receivedById: contributionToEdit.receivedById || defaultReceiverId,
        reference: contributionToEdit.reference || "",
        note: contributionToEdit.note || "",
      });
    } else if (defaultFundId) {
      setValue("fundId", defaultFundId);
    } else if (funds.length > 0 && !selectedFundId) {
      setValue("fundId", funds[0].id);
    }
  }, [contributionToEdit, defaultFundId, funds, defaultReceiverId, reset, setValue, selectedFundId, isOpen]);

  // Handle Close with dirty check
  const handleAttemptClose = () => {
    const isPending = isEditing
      ? updateContributionMutation.isPending
      : addContributionMutation.isPending;
    if (isDirty && !isPending) {
      setConfirmDiscardOpen(true);
    } else {
      handleFinalClose();
    }
  };

  const handleFinalClose = () => {
    setConfirmDiscardOpen(false);
    reset();
    onClose();
  };

  // Submit Handler
  const onSubmit = async (values: ContributionFormValues) => {
    try {
      if (isEditing && contributionToEdit) {
        await updateContributionMutation.mutateAsync({
          id: contributionToEdit.id,
          payload: {
            fundId: values.fundId,
            amount: Number(values.amount),
            method: values.method,
            receivedAt: new Date(values.receivedAt).toISOString(),
            receivedById: values.receivedById,
            giverMemberId: values.giverType === "MEMBER" ? values.giverMemberId : null,
            giverName: values.giverType === "OUTSIDER" ? values.giverName : null,
            reference: values.reference || null,
            note: values.note || null,
          },
        });

        setSuccessToast(
          isBn
            ? "অনুদানের তথ্য সফলভাবে আপডেট করা হয়েছে!"
            : "Contribution successfully updated!"
        );
      } else {
        await addContributionMutation.mutateAsync({
          fundId: values.fundId,
          amount: Number(values.amount),
          method: values.method,
          receivedAt: new Date(values.receivedAt).toISOString(),
          receivedById: values.receivedById,
          giverMemberId: values.giverType === "MEMBER" ? values.giverMemberId : null,
          giverName: values.giverType === "OUTSIDER" ? values.giverName : null,
          reference: values.reference || null,
          note: values.note || null,
        });

        setSuccessToast(
          isBn
            ? "অনুদানের টাকা সফলভাবে জমা হয়েছে!"
            : "Contribution successfully recorded!"
        );
      }

      setTimeout(() => {
        setSuccessToast(null);
        handleFinalClose();
      }, 1200);
    } catch {
      // Error handled by mutation
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
        {/* Header - Colorful Branded Emerald Gradient */}
        <header className="px-5 py-4 border-b border-emerald-800/20 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-[#006a4e] to-teal-800 text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 text-white border border-white/20 shadow-xs">
              {isEditing ? <Edit3 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                {isEditing
                  ? isBn
                    ? "অনুদান এডিট করুন"
                    : "Edit Contribution"
                  : isBn
                  ? "নতুন অনুদান জমা করুন"
                  : "Add Contribution"}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {isEditing
                  ? isBn
                    ? "অনুদানের বিবরণ ও রেফারেন্স সংশোধন করুন"
                    : "Update details of recorded contribution"
                  : isBn
                  ? "তহবিলে অর্থ সংগ্রহের বিবরণ রেকর্ড করুন"
                  : "Record new incoming money to a fund"}
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
          id="contribution-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          {/* Fund Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "তহবিল (Fund)" : "Fund"}{" "}
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
                  {f.name} [{formatFundCategory(f.category, isBn)}] (Balance: {formatMoney(f.remaining)})
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.fundId.message}
              </p>
            )}
          </div>

          {/* Amount (Taka) - Colorful Branded Highlight Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/90 space-y-2">
            <label className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
              {isBn ? "টাকার পরিমাণ (টাকা)" : "Amount (Taka)"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-700 text-lg">
                ৳
              </span>
              <input
                type="number"
                step="1"
                placeholder="0"
                {...register("amount")}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-300/80 bg-white text-base font-black text-slate-900 tracking-tight tabular-nums placeholder:text-slate-300 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all shadow-xs"
              />
            </div>
            {/* Quick Amount Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    const current = Number(watch("amount")) || 0;
                    setValue("amount", (current + amt) as unknown as number, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-2xs transition-all cursor-pointer"
                >
                  +{formatMoney(amt)}
                </button>
              ))}
            </div>
            {errors.amount && (
              <p className="text-[11px] font-semibold text-[#f42a41]">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Method Selector with Crisp Brand Logos */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              {isBn ? "পেমেন্ট মেথড" : "Payment Method"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = selectedMethod === m;
                const getMethodName = () => {
                  switch (m) {
                    case "BKASH":
                      return isBn ? "বিকাশ" : "bKash";
                    case "NAGAD":
                      return isBn ? "নগদ" : "Nagad";
                    case "CASH":
                      return isBn ? "ক্যাশ" : "Cash";
                    case "BANK":
                      return isBn ? "ব্যাংক" : "Bank";
                    default:
                      return isBn ? "অন্যান্য" : "Other";
                  }
                };

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue("method", m, { shouldValidate: true, shouldDirty: true })}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#006a4e]/10 border-[#006a4e] text-[#006a4e] shadow-xs font-black ring-2 ring-[#006a4e]/20"
                        : "bg-slate-50/80 hover:bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-bold"
                    }`}
                  >
                    <PaymentMethodLogo method={m} className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] truncate">{getMethodName()}</span>
                  </button>
                );
              })}
            </div>
            {errors.method && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.method.message}
              </p>
            )}
          </div>

          {/* Date Received */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "গ্রহণের তারিখ" : "Date Received"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("receivedAt")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
              />
            </div>
            {errors.receivedAt && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.receivedAt.message}
              </p>
            )}
          </div>

          {/* Giver Type Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? "প্রদানকারী (Giver)" : "Giver"}
              </label>
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setValue("giverType", "MEMBER");
                    setValue("giverName", "");
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    giverType === "MEMBER"
                      ? "bg-white text-[#006a4e] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isBn ? "ক্লাব সদস্য" : "Club Member"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("giverType", "OUTSIDER");
                    setValue("giverMemberId", null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    giverType === "OUTSIDER"
                      ? "bg-white text-[#006a4e] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isBn ? "অন্যান্য / বহিরাগত" : "Outsider"}
                </button>
              </div>
            </div>

            {giverType === "MEMBER" ? (
              <MemberCombobox
                value={selectedGiverMemberId}
                onChange={(id) => setValue("giverMemberId", id, { shouldValidate: true })}
                placeholder={isBn ? "সদস্য নির্বাচন করুন..." : "Select club member..."}
                isBn={isBn}
                error={errors.giverMemberId?.message}
              />
            ) : (
              <div>
                <input
                  type="text"
                  placeholder={
                    isBn
                      ? "দাতার নাম (যেমন: ডা. কে এম রহমান / এপেক্স মোটরস)"
                      : "Enter giver's name / organization"
                  }
                  {...register("giverName")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
                />
                {errors.giverName && (
                  <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                    {errors.giverName.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Received By (Member Combobox - defaults to logged-in admin) */}
          <div>
            <MemberCombobox
              label={isBn ? "টাকা গ্রহণকারী (Received By)" : "Received By (Admin)"}
              required
              value={selectedReceiverId}
              onChange={(id) => setValue("receivedById", id || defaultReceiverId, { shouldValidate: true })}
              placeholder={isBn ? "প্রতিনিধি নির্বাচন করুন..." : "Select receiver admin..."}
              isBn={isBn}
              error={errors.receivedById?.message}
            />
          </div>

          {/* Reference */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "রেফারেন্স / ট্রানজেকশন আইডি" : "Reference / Trx ID"}{" "}
              <span className="text-slate-400 font-normal">
                ({isBn ? "ঐচ্ছিক" : "optional"})
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. TRX-BK9821 / CHQ-10293"
              {...register("reference")}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "মন্তব্য বা বিবরণ" : "Note / Remarks"}{" "}
              <span className="text-slate-400 font-normal">
                ({isBn ? "ঐচ্ছিক" : "optional"})
              </span>
            </label>
            <textarea
              rows={2}
              placeholder={
                isBn
                  ? "অনুদানের উদ্দেশ্য বা অতিরিক্ত কোনো তথ্য..."
                  : "Purpose of contribution or any extra note..."
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
            disabled={addContributionMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {isBn ? "বাতিল" : "Cancel"}
          </button>

          <button
            type="submit"
            form="contribution-form"
            disabled={
              isEditing
                ? updateContributionMutation.isPending
                : addContributionMutation.isPending
            }
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006a4e] via-emerald-600 to-teal-600 hover:from-[#00523c] hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-900/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            {(isEditing
              ? updateContributionMutation.isPending
              : addContributionMutation.isPending) ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {isEditing
                    ? isBn
                      ? "আপডেট হচ্ছে..."
                      : "Updating..."
                    : isBn
                    ? "জমা হচ্ছে..."
                    : "Submitting..."}
                </span>
              </span>
            ) : (
              <span>
                {isEditing
                  ? isBn
                    ? "আপডেট সংরক্ষণ করুন"
                    : "Update Contribution"
                  : isBn
                  ? "অনুদান সংরক্ষণ করুন"
                  : "Save Contribution"}
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
