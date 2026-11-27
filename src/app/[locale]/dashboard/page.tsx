import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function UserDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resolvedSearchParams = await searchParams;
  const tab =
    typeof resolvedSearchParams?.tab === "string"
      ? (resolvedSearchParams.tab as any)
      : undefined;
  const dict = await getDictionary(locale);
  return (
    <Suspense fallback={null}>
      <DashboardShell
        title={dict.dashboard.userTitle}
        stats={dict.dashboard.userStats}
        dict={dict}
        locale={locale}
        initialTab={tab}
      />
    </Suspense>
  );
}
