import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { FinanceOverviewClient } from "./_components/finance-overview-client";

export default async function AdminFinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <FinanceOverviewClient locale={locale} />;
}
