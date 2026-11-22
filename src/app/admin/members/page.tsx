import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export default function AdminMembersRedirect() {
  redirect(`/${defaultLocale}/dashboard?tab=admin_users`);
}
