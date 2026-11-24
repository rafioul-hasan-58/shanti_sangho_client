import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";

export default async function PublicFundDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    redirect(`/bn/admin/finance/funds/${id}`);
  }
  redirect(`/${locale}/admin/finance/funds/${id}`);
}
