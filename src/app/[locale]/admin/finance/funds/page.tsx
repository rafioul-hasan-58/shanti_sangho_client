import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { AllFundsPageClient } from "../_components/all-funds-page-client";

export default async function AdminAllFundsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AllFundsPageClient locale={locale} />;
}
