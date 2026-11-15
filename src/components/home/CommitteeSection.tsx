"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { committeeMembers } from "@/data/committee";

export default function CommitteeSection({ locale }: { locale: Locale }) {
  const [showAll, setShowAll] = useState(false);
  const isBn = locale === "bn";

  // Initially show 8 members (2 rows of 4 on desktop), expand to all 16 on click
  const visibleMembers = showAll ? committeeMembers : committeeMembers.slice(0, 8);

  return (
    <section id="committee" className="mx-auto max-w-6xl px-4 pt-16 scroll-mt-20">
      {/* Distinctive Section Container Frame */}
      <div className="rounded-3xl bg-gradient-to-b from-[#eaf6f0] via-[#f3f9f5] to-[#e5f4ec] border border-[#006a4e]/25 p-5 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#f2b705]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#006a4e]/10 text-[#006a4e] text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-widest border border-[#006a4e]/25">
              <span className="w-2 h-2 rounded-full bg-[#006a4e] animate-pulse" />
              <span>{isBn ? "নেতৃত্ব ও ব্যবস্থাপনা" : "LEADERSHIP & MANAGEMENT"}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-pitch mt-2 flex items-center gap-2">
              <span>{isBn ? "কার্যনির্বাহী কমিটি" : "Executive Committee"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-700 font-medium mt-1">
              {isBn
                ? `মোট ${committeeMembers.length} জন সদস্য দ্বারা পরিচালিত পরিষদ`
                : `Governing council of ${committeeMembers.length} executive members`}
            </p>
          </div>
        </div>

        {/* Grid of Committee Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
          {visibleMembers.map((member, idx) => {
            const name = isBn ? member.nameBn : member.nameEn;
            const role = isBn ? member.roleBn : member.roleEn;

            return (
              <Link
                key={member.id}
                href={`/${locale}/${member.id}`}
                className="group rounded-2xl border border-[#006a4e]/20 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-xl hover:border-[#006a4e] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center animate-in fade-in block cursor-pointer"
              >
                {/* Photo Frame: with visible gradient frame ring, keeping current rounded-2xl shape */}
                <div className="relative mb-4 shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-[3px] bg-gradient-to-tr from-[#006a4e] via-[#059669] to-[#1877F2] shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
                    <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-white">
                      <Image
                        src={member.image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        priority={idx < 4}
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-sm sm:text-base text-pitch group-hover:text-[#006a4e] transition-colors leading-snug">
                  {name}
                </h3>

                {/* Role badge */}
                <div className="mt-2.5">
                  <span className="inline-block rounded-full bg-[#006a4e]/10 border border-[#006a4e]/25 px-3 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide text-[#006a4e]">
                    {role}
                  </span>
                </div>

                {/* View Details Link */}
                <div className="mt-3 text-[11px] font-bold text-[#006a4e] inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                  <span>{isBn ? "বিস্তারিত দেখুন" : "View Details"}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All / Show Less Button */}
        <div className="mt-10 flex justify-center relative z-10">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full bg-[#006a4e] px-8 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[#005a42] hover:shadow-lg active:scale-95 transition-all"
          >
            <span>
              {showAll
                ? isBn
                  ? "সংক্ষেপ করুন"
                  : "Show Less"
                : isBn
                ? `সকল সদস্য দেখুন (${committeeMembers.length})`
                : `View All Committee Members (${committeeMembers.length})`}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                showAll ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

