import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { FundDetailClient } from "../../_components/fund-detail-client";

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  return <FundDetailClient fundId={id} locale={locale} />;
}
