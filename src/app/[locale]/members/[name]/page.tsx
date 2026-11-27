import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getPersonBySlug, getAllPersonSlugs } from "@/data/people";
import { SAVARCHALA_FULL_BRAND_NAME_EN } from "@/lib/constants/site";
import PersonDetailsView from "@/components/profile/PersonDetailsView";
import MemberFullPageView from "@/components/members/MemberFullPageView";
import { fetchMemberById } from "@/lib/api/memberService";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string; name: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPersonSlugs();
  const params: { locale: string; name: string }[] = [];
  for (const locale of locales) {
    for (const name of slugs) {
      params.push({ locale, name });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, name } = await params;
  if (!isLocale(locale)) return {};
  const person = getPersonBySlug(name);
  if (person) {
    const isBn = locale === "bn";
    const personName = isBn ? person.nameBn : person.nameEn;
    const personRole = isBn ? person.roleBn : person.roleEn;
    const title = `${personName} (${personRole}) | ${
      isBn ? "সাভারচালা শান্তি সংঘ" : SAVARCHALA_FULL_BRAND_NAME_EN
    }`;
    const description = isBn ? person.bioBn : person.bioEn;

    return {
      title,
      description: description.slice(0, 160),
      openGraph: {
        title,
        description: description.slice(0, 160),
        images: [
          {
            url: person.image,
            width: 600,
            height: 600,
            alt: personName,
          },
        ],
      },
    };
  }

  // Dynamic member metadata fallback
  try {
    const member = await fetchMemberById(name);
    if (member) {
      const isBn = locale === "bn";
      const title = `${member.fullName} | ${
        isBn ? "সাভারচালা শান্তি সংঘ" : SAVARCHALA_FULL_BRAND_NAME_EN
      }`;
      const desc =
        member.summary ||
        member.bio ||
        `${member.fullName} - ${member.profession || "Club Member"}`;
      return {
        title,
        description: desc.slice(0, 160),
      };
    }
  } catch {}

  return {};
}

export default async function MemberPersonPage({ params }: PageProps) {
  const { locale, name } = await params;
  if (!isLocale(locale)) notFound();

  const person = getPersonBySlug(name);
  if (person) {
    return <PersonDetailsView person={person} locale={locale} />;
  }

  // Fallback for registered dynamic member ID or slug
  try {
    const member = await fetchMemberById(name);
    if (member) {
      return (
        <main className="min-h-screen bg-chalk">
          <MemberFullPageView
            member={member}
            locale={locale}
            isBn={locale === "bn"}
          />
        </main>
      );
    }
  } catch {
    // not found
  }

  notFound();
}

