"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X, Plus, AlertCircle, CheckCircle2, DollarSign, Calendar, FileText, UserCheck, Users, HelpCircle } from "lucide-react";
import { useFunds, useAddContribution } from "@/lib/hooks/use-finance";
import { useAuth } from "@/context/AuthContext";
import {
  contributionFormSchema,
  PAYMENT_METHODS,
  type ContributionFormInput,
  type ContributionFormValues,
  type PaymentMethod,
} from "@/lib/schemas/finance";
import { MemberCombobox } from "./member-combobox";
import { formatMoney } from "@/lib/format";

interface ContributionFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFundId?: string;
  isBn?: boolean;
}

export function ContributionFormSheet({
  isOpen,
  onClose,
  defaultFundId,
  isBn = false,
}: ContributionFormSheetProps) {
  const { user } = useAuth();
  const { data: funds = [], isLoading: isLoadingFunds } = useFunds();
  const addContributionMutation = useAddContribution();

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

  // Sync defaultFundId or initial fund
  useEffect(() => {
    if (defaultFundId) {
      setValue("fundId", defaultFundId);
    } else if (funds.length > 0 && !selectedFundId) {
      setValue("fundId", funds[0].id);
    }
  }, [defaultFundId, funds, selectedFundId, setValue]);

  // Handle Close with dirty check
  const handleAttemptClose = () => {
    if (isDirty && !addContributionMutation.isPending) {
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

      setTimeout(() => {
        setSuccessToast(null);
        handleFinalClose();
      }, 1200);
    } catch {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={handleAttemptClose}
    >
      <div
        className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-[#006a4e]">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                {isBn ? "নতুন অনুদান জমা করুন" : "Add Contribution"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? "তহবিলে অর্থ সংগ্রহের বিবরণ রেকর্ড করুন"
                  : "Record new incoming money to a fund"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
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
                  {f.name} [{f.category || "OTHER"}] (Balance: {formatMoney(f.remaining)})
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.fundId.message}
              </p>
            )}
          </div>

          {/* Amount (Taka) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "টাকার পরিমাণ (টাকা)" : "Amount (Taka)"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                ৳
              </span>
              <input
                type="number"
                step="1"
                placeholder="0"
                {...register("amount")}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-900 tracking-tight tabular-nums placeholder:text-slate-300 focus:outline-none focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all"
              />
            </div>
            {errors.amount && (
              <p className="text-[11px] font-semibold text-[#f42a41] mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Method Segmented Control */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBn ? "পেমেন্ট মেথড" : "Payment Method"}{" "}
              <span className="text-[#f42a41]">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = selectedMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue("method", m, { shouldValidate: true })}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#006a4e] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m === "BKASH" ? "bKash" : m === "NAGAD" ? "Nagad" : m}
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

        {/* Sticky Footer Actions */}
        <footer className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
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
            disabled={addContributionMutation.isPending}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b705]"
          >
            {addContributionMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isBn ? "জমা হচ্ছে..." : "Submitting..."}</span>
              </span>
            ) : (
              <span>{isBn ? "অনুদান সংরক্ষণ করুন" : "Save Contribution"}</span>
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
    </div>
  );
}
