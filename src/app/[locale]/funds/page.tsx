import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";

export default async function PublicFundsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect("/bn/admin/finance");
  }
  redirect(`/${locale}/admin/finance`);
}
