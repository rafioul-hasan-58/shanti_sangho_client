import { notFound } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { isLocale } from "@/i18n/config";

export default async function AdminLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AdminLayoutClient locale={locale}>{children}</AdminLayoutClient>;
}

