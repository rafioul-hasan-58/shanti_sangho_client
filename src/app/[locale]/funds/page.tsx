import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { FULL_BRAND_NAME_EN } from "@/lib/constants/site";
import PublicFundsDirectory from "@/components/funds/public-funds-directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isBn = locale === "bn";
  return {
    title: isBn
      ? "তহবিল ও আর্থিক বিবরণী | সাভারচালা শান্তি সংঘ"
      : `Public Funds & Treasury | ${FULL_BRAND_NAME_EN}`,
    description: isBn
      ? "সাভারচালা শান্তি সংঘের টুর্নামেন্ট, উৎসব ও সমাজকল্যাণমূলক সকল তহবিলের স্বচ্ছ ও বাস্তব সময়ের উন্মুক্ত হিসাব বিবরণী।"
      : `Transparent financial balances, public donation logs, and expenditure records of ${FULL_BRAND_NAME_EN}.`,
  };
}

export default async function PublicFundsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      <PublicFundsDirectory locale={locale} />
    </main>
  );
}
