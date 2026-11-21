import { notFound } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileBottomNav from "@/components/admin/MobileBottomNav";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";
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

  return (
    <div className="min-h-screen bg-[#f7f4ea] flex flex-col md:flex-row text-[#12231d] overflow-x-hidden">
      {/* Desktop Collapsible Left Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content Wrapper (pb-20 keeps content clear of fixed mobile bottom bar) */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-6">
        {/* Mobile Top Header with Logo, Language Toggle & Hamburger Drawer */}
        <AdminMobileHeader locale={locale} />

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Mobile Fixed Bottom Navigation + One-Tap Slide-Up Sheet */}
      <MobileBottomNav locale={locale} />
    </div>
  );
}

