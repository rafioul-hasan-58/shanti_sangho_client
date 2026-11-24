import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { RecentTransactionsClient } from "../_components/recent-transactions-client";

export default async function AdminRecentTransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <RecentTransactionsClient locale={locale} />;
}
