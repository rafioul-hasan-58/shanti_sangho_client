import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { FULL_BRAND_NAME_EN } from "@/lib/constants/site";
import PublicFundDetail from "@/components/funds/public-fund-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const isBn = locale === "bn";
  return {
    title: isBn
      ? "তহবিল খতিয়ান ও হিসাব | সাভারচালা শান্তি সংঘ"
      : `Fund Ledger Details | ${FULL_BRAND_NAME_EN}`,
    description: isBn
      ? "ক্লাবের এই নির্দিষ্ট তহবিলের সকল অনুদান ও খরচের বিস্তারিত ভাউচার তালিকা।"
      : `Complete public ledger of contributions and verified expenditure vouchers of ${FULL_BRAND_NAME_EN}.`,
  };
}

export default async function PublicFundDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      <PublicFundDetail fundId={id} locale={locale} />
    </main>
  );
}
