import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import AdminUsersView from "@/components/dashboard/AdminUsersView";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AdminUsersView locale={locale} />;
}
