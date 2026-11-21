import { z } from "zod";

export const PAYMENT_METHODS = [
  "CASH",
  "BANK",
  "BKASH",
  "NAGAD",
  "OTHER",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const contributionFormSchema = z
  .object({
    fundId: z.string().min(1, { message: "Please select a fund / অনুগ্রহ করে একটি তহবিল নির্বাচন করুন" }),
    amount: z.coerce
      .number({ message: "Amount must be a valid number" })
      .int("Amount must be a whole number / টাকা পূর্ণ সংখ্যা হতে হবে")
      .positive("Amount must be greater than 0 / টাকার পরিমাণ ০-এর বেশি হতে হবে"),
    method: z.enum(PAYMENT_METHODS, {
      message: "Select a payment method / পেমেন্ট মেথড নির্বাচন করুন",
    }),
    receivedAt: z.string().min(1, { message: "Received date is required" }),
    giverType: z.enum(["MEMBER", "OUTSIDER"]),
    giverMemberId: z.string().optional().nullable(),
    giverName: z.string().optional().nullable(),
    receivedById: z.string().min(1, { message: "Receiver (Admin) is required" }),
    reference: z.string().max(100).optional().nullable(),
    note: z.string().max(500).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.giverType === "MEMBER" && (!data.giverMemberId || data.giverMemberId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["giverMemberId"],
        message: "Please select a club member / অনুগ্রহ করে ক্লাব সদস্য নির্বাচন করুন",
      });
    }
    if (
      data.giverType === "OUTSIDER" &&
      (!data.giverName || data.giverName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["giverName"],
        message: "Please enter the giver's name / দাতার নাম লিখুন (কমপক্ষে ২ অক্ষর)",
      });
    }
  });

export type ContributionFormInput = z.input<typeof contributionFormSchema>;
export type ContributionFormValues = z.output<typeof contributionFormSchema>;

export const expenseFormSchema = z.object({
  fundId: z.string().min(1, { message: "Please select a fund / অনুগ্রহ করে একটি তহবিল নির্বাচন করুন" }),
  amount: z.coerce
    .number({ message: "Amount must be a valid number" })
    .int("Amount must be a whole number / টাকা পূর্ণ সংখ্যা হতে হবে")
    .positive("Amount must be greater than 0 / টাকার পরিমাণ ০-এর বেশি হতে হবে"),
  spentAt: z.string().min(1, { message: "Spent date is required" }),
  spentOn: z.string().min(2, { message: "Purpose of expense is required / ব্যয়ের খাত উল্লেখ করুন" }),
  spentById: z.string().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
