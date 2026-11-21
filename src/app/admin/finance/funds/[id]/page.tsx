import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export default async function AdminFundDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/${defaultLocale}/admin/finance/funds/${id}`);
}
