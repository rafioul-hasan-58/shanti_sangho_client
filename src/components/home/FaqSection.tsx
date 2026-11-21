"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface Props {
  locale: Locale;
}

interface FaqItem {
  id: string;
  categoryBn: string;
  categoryEn: string;
  questionBn: string;
  questionEn: string;
  badgeBn?: string;
  badgeEn?: string;
  answerBn: React.ReactNode;
  answerEn: React.ReactNode;
  actionLink?: {
    href: string;
    labelBn: string;
    labelEn: string;
  };
}

export default function FaqSection({ locale }: Props) {
  const isBn = locale === "bn";
  // Initially closed so user sees only questions; clicking reveals the answer
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const faqItems: FaqItem[] = [
    {
      id: "founding",
      categoryBn: "প্রতিষ্ঠা ও ইতিহাস",
      categoryEn: "History & Heritage",
      badgeBn: "২০০৭ থেকে ১৯+ বছর",
      badgeEn: "19+ Years Heritage",
      questionBn: "সাভারচালা শান্তি সংঘ কবে প্রতিষ্ঠিত হয়েছিল?",
      questionEn: "When was Shavarchala Shanti Sangho founded?",
      answerBn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            সাভারচালা শান্তি সংঘ আনুষ্ঠানিকভাবে <strong>২০০৭ সালে</strong> প্রতিষ্ঠিত হয়। বিগত{" "}
            <span className="font-bold text-[#006a4e]">১৯+ বছর</span> ধরে সংগঠনটি সাভারচালা এবং পার্শ্ববর্তী
            এলাকায় শান্তি, সৌহার্দ্য, ভ্রাতৃত্ববোধ ও যুবসমাজকে মাদক ও অপসংস্কৃতি থেকে দূরে রেখে খেলাধুলা ও সুস্থ
            সমাজ গঠনে এক অবিচল ভূমিকা পালন করে আসছে।
          </p>
          <p className="text-slate-600">
            ২০০৭ সালে প্রতিষ্ঠাতা সভাপতি <strong>হারুন শেখ</strong> এবং এলাকার উদ্যমী যুবসমাজের হাত ধরে এই ঐতিহ্যবাহী
            সংগঠনের যাত্রা শুরু হয়।
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            Shavarchala Shanti Sangho was officially established in <strong>2007</strong>. For over{" "}
            <span className="font-bold text-[#006a4e]">19+ years</span>, the organization has consistently
            championed brotherhood, community welfare, athletic development, and positive youth leadership across
            Shavarchala and surrounding villages.
          </p>
          <p className="text-slate-600">
            The club began its historic journey under Founder President <strong>Harun Sheikh</strong> and dedicated
            local youth aiming to build a united and vibrant community.
          </p>
        </div>
      ),
    },
    {
      id: "president",
      categoryBn: "নেতৃত্ব ও প্রশাসন",
      categoryEn: "Leadership & Administration",
      badgeBn: "বর্তমান সভাপতি",
      badgeEn: "Club President",
      questionBn: "সাভারচালা শান্তি সংঘের বর্তমান সভাপতি কে?",
      questionEn: "Who is the current President of the club?",
      actionLink: {
        href: `/${locale}/mahfuz`,
        labelBn: "সভাপতির প্রোফাইল দেখুন",
        labelEn: "View President's Profile",
      },
      answerBn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            সাভারচালা শান্তি সংঘের বর্তমান সভাপতি হলেন <strong>মাহফুজুর রহমান (Mahfojor Rahman)</strong>।
          </p>
          <p className="text-slate-600">
            তাঁর গতিশীল ও দূরদর্শী নেতৃত্বে ১৬ সদস্যবিশিষ্ট কার্যনির্বাহী পরিষদ এবং সাধারণ সদস্যদের সমন্বয়ে ক্লাবের
            বাৎসরিক প্রিমিয়ার লিগ (SPL), বার্ষিক ক্রীড়া প্রতিযোগিতা, ওয়াজ মাহফিল ও বিভিন্ন জনকল্যাণমূলক কর্মসূচি
            সাফল্যের সাথে নিয়মিত পরিচালিত হচ্ছে।
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            The current President of Shavarchala Shanti Sangho is <strong>Mahfojor Rahman</strong>.
          </p>
          <p className="text-slate-600">
            Under his dedicated leadership, the 16-member executive council and club members successfully organize
            signature annual events including the SPL Premier League, annual athletics, community welfare initiatives,
            and cultural gatherings.
          </p>
        </div>
      ),
    },
    {
      id: "engineer",
      categoryBn: "সফটওয়্যার ও প্রকৌশল",
      categoryEn: "Software & Engineering",
      badgeBn: "লিড ইঞ্জিনিয়ার",
      badgeEn: "Lead Software Engineer",
      questionBn: "ওয়েবসাইট ও ডিজিটাল সিস্টেমের ইঞ্জিনিয়ার কে?",
      questionEn: "Who is the Software / Lead Engineer of this website?",
      actionLink: {
        href: `/${locale}/sourav`,
        labelBn: "ইঞ্জিনিয়ারের প্রোফাইল দেখুন",
        labelEn: "View Engineer's Profile",
      },
      answerBn: (
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            সাভারচালা শান্তি সংঘের আধুনিক অফিশিয়াল ওয়েবসাইট, ক্লাউড আর্কিটেকচার ও ডিজিটাল মেম্বার সিস্টেমের প্রধান রূপকার ও
            লিড ইঞ্জিনিয়ার হলেন <strong>সৌরভ প্রধান (Sourav Prodhan / Rafioul Hasan)</strong>।
          </p>
          <div className="p-3 rounded-xl bg-white/80 border border-[#006a4e]/20 space-y-1.5 text-xs text-slate-600">
            <p>
              • <strong>ক্লাব দায়িত্ব:</strong> ক্লাবের যুগ্ম সাধারণ সম্পাদক (Joint Secretary), ওয়েবসাইট লিড ইঞ্জিনিয়ার
              ও অফিশিয়াল ফেসবুক পেজের অ্যাডমিনিস্ট্রেটর।
            </p>
            <p>
              • <strong>শিক্ষাজীবন:</strong> ময়মনসিংহ পলিটেকনিক ইনস্টিটিউট থেকে কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি (CST)
              বিষয়ে ডিপ্লোমা ইন ইঞ্জিনিয়ারিং সম্পন্ন।
            </p>
            <p>
              • <strong>পেশাগত ক্যারিয়ার:</strong> পূর্বে Betopia Group-এ ব্যাকএন্ড ইঞ্জিনিয়ার হিসেবে অভিজ্ঞতা অর্জনের পর
              বর্তমানে <strong>MaxValid</strong>-এ রিমোট সফটওয়্যার ইঞ্জিনিয়ার হিসেবে কর্মরত রয়েছেন।
            </p>
          </div>
        </div>
      ),
      answerEn: (
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            The Lead Software Engineer and platform architect behind Shavarchala Shanti Sangho&apos;s digital system and
            official web platform is <strong>Sourav Prodhan (Rafioul Hasan)</strong>.
          </p>
          <div className="p-3 rounded-xl bg-white/80 border border-[#006a4e]/20 space-y-1.5 text-xs text-slate-600">
            <p>
              • <strong>Club Responsibilities:</strong> Joint General Secretary, Lead Software Engineer, and official
              Facebook Administrator.
            </p>
            <p>
              • <strong>Education:</strong> Diploma in Engineering in Computer Science &amp; Technology (CST) from
              Mymensingh Polytechnic Institute.
            </p>
            <p>
              • <strong>Professional Career:</strong> Following backend engineering experience at Betopia Group, he
              currently works remotely as a Software Engineer at <strong>MaxValid</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "technology",
      categoryBn: "প্রযুক্তি পরিকাঠামো",
      categoryEn: "Technology Stack",
      badgeBn: "Next.js 15 & Node.js",
      badgeEn: "Next.js 15 & Node.js",
      questionBn: "এই ওয়েবসাইটটিতে কী কী আধুনিক প্রযুক্তি ব্যবহার করা হয়েছে?",
      questionEn: "What technologies are used to build this website?",
      answerBn: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            ওয়েবসাইটটি অত্যন্ত দ্রুতগতির, নিরাপদ ও সম্পূর্ণ আধুনিক ফুল-স্ট্যাক এন্টারপ্রাইজ প্রযুক্তি ব্যবহার করে
            তৈরি করা হয়েছে:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">ফ্রন্টএন্ড ও ইউআই</span>
              <p className="text-slate-600">Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">ব্যাকএন্ড ও এপিআই</span>
              <p className="text-slate-600">Node.js, NestJS RESTful Architecture, JWT Auth, Token Rotation</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">ডাটাবেস ও ওআরএম</span>
              <p className="text-slate-600">MongoDB Database, Prisma ORM (Type-safe client)</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">ক্লাউড ও নিরাপত্তা</span>
              <p className="text-slate-600">Cloudinary CDN (1:1 WebP Crop), Google OAuth 2.0 Single Sign-On</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            ফিচারসমূহের মধ্যে রয়েছে পূর্ণাঙ্গ দ্বিভাষিক (বাংলা ও ইংরেজি) সাপোর্ট, লাইভ ম্যাচ ও মেম্বার ডিরেক্টরি,
            ইন্টারেক্টিভ ক্রপ ও রিয়েল-টাইম অ্যাডমিন ম্যানেজমেন্ট।
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            The website is engineered with a high-performance, responsive, and secure full-stack architecture:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">Frontend &amp; UI</span>
              <p className="text-slate-600">Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">Backend &amp; APIs</span>
              <p className="text-slate-600">Node.js, NestJS RESTful Architecture, JWT Auth, Token Rotation</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">Database &amp; ORM</span>
              <p className="text-slate-600">MongoDB Database, Prisma ORM with strict schema models</p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-2xs">
              <span className="font-extrabold text-[#006a4e] block mb-1">Cloud &amp; Media</span>
              <p className="text-slate-600">Cloudinary CDN (1:1 WebP image optimization), Google OAuth 2.0 SSO</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Key capabilities include seamless English/Bangla bilingual localization, role-based admin dashboard,
            interactive photo cropper, and live streaming match hubs.
          </p>
        </div>
      ),
    },
    {
      id: "members",
      categoryBn: "সদস্য ও সংগঠন",
      categoryEn: "Members & Community",
      badgeBn: "১৫০+ সদস্য",
      badgeEn: "150+ Members",
      questionBn: "সাভারচালা শান্তি সংঘে মোট কতজন সদস্য রয়েছে?",
      questionEn: "How many members does Shavarchala Shanti Sangho have?",
      actionLink: {
        href: `/${locale}/members`,
        labelBn: "সদস্য ডিরেক্টরি দেখুন",
        labelEn: "Explore Members Directory",
      },
      answerBn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            সাভারচালা শান্তি সংঘ স্থানীয় তরুণ, যুবক, মুরব্বি এবং প্রবাসীদের নিয়ে গঠিত একটি বিশাল পরিবার।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">১৬ জন</span>
              <span className="text-[11px] font-bold text-slate-600">কার্যনির্বাহী পরিষদ</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">১২ জন</span>
              <span className="text-[11px] font-bold text-slate-600">ডিজিটাল ও মিডিয়া উইং</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">১৫০+ জন</span>
              <span className="text-[11px] font-bold text-slate-600">নিবন্ধিত ও সক্রিয় সদস্য</span>
            </div>
          </div>
          <p className="text-slate-600 pt-1">
            এছাড়াও দেশ-বিদেশের অসংখ্য সম্মানিত শুভাকাঙ্ক্ষী ও প্রবাসী ভাইয়েরা ক্লাবের নানাবিধ মানবিক সহায়তা, টুর্নামেন্ট ও
            বাৎসরিক আয়োজনে সবসময় পাশে থাকেন।
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            Shavarchala Shanti Sangho represents a growing community spanning youth, community elders, and expatriates
            abroad.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">16</span>
              <span className="text-[11px] font-bold text-slate-600">Executive Council</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">12</span>
              <span className="text-[11px] font-bold text-slate-600">Digital &amp; Media Admins</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/90 border border-[#006a4e]/20 text-center">
              <span className="block text-xl font-black text-[#006a4e]">150+</span>
              <span className="text-[11px] font-bold text-slate-600">Registered Members</span>
            </div>
          </div>
          <p className="text-slate-600 pt-1">
            Additionally, numerous village supporters and expatriate brothers globally actively sponsor, advise, and
            support the club&apos;s social welfare and sports programs.
          </p>
        </div>
      ),
    },
    {
      id: "join",
      categoryBn: "সদস্যপদ ও নিবন্ধন",
      categoryEn: "Membership & Registration",
      badgeBn: "সরাসরি যুক্ত হোন",
      badgeEn: "Join Online",
      questionBn: "কীভাবে শান্তি সংঘের সদস্য হওয়া যায় বা যুক্ত থাকা যায়?",
      questionEn: "How can someone join or register as a member?",
      actionLink: {
        href: `/${locale}/register`,
        labelBn: "এখনই রেজিস্ট্রেশন করুন",
        labelEn: "Register Now",
      },
      answerBn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            আমাদের অফিসিয়াল প্ল্যাটফর্মে যে কেউ খুব সহজে গুগল সাইন-ইন বা ইমেইল দিয়ে রেজিস্ট্রেশন করতে পারেন।
          </p>
          <p className="text-slate-600">
            অ্যাকাউন্ট খোলার পর ব্যবহারকারী তাঁর ব্যক্তিগত ও পেশাগত তথ্য পূরণ করে স্থায়ী সদস্যপদ বা খেলোয়াড় কোটার জন্য
            আবেদন করতে পারেন। অ্যাডমিন প্যানেল কর্তৃক তথ্য যাচাইয়ের পর অ্যাকাউন্ট অনুমোদিত হয় এবং অফিসিয়াল মেম্বার
            ডিরেক্টরিতে প্রদর্শিত হয়।
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          <p>
            Joining our official community is quick and easy via Google Single Sign-On or Email registration.
          </p>
          <p className="text-slate-600">
            After registering, simply complete your personal and contact details from the dashboard and submit for club
            membership verification. Once reviewed and approved by the administration, your profile appears in the
            official directory.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section id="faq" className="mx-auto max-w-6xl px-3 sm:px-4 pt-12 pb-10 sm:pt-16 sm:pb-12 scroll-mt-20">
      {/* Distinctive Container Frame Matching Brand Theme */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#eaf6f0] via-[#f3f9f5] to-[#e5f4ec] border border-[#006a4e]/25 p-3.5 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Decorative Ambient Lighting */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#f2b705]/12 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="mb-6 sm:mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#006a4e]/10 text-[#006a4e] text-[11px] sm:text-xs font-extrabold uppercase px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full tracking-widest border border-[#006a4e]/25">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#006a4e] animate-pulse" />
            <span>{isBn ? "সাধারণ জিজ্ঞাসা" : "FREQUENTLY ASKED QUESTIONS"}</span>
          </div>
          <h2 className="font-display text-xl sm:text-3xl font-extrabold text-pitch mt-1.5 sm:mt-2 flex items-center gap-2">
            <span>{isBn ? "সাধারণ প্রশ্নোত্তর (FAQ)" : "Frequently Asked Questions"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-700 font-medium mt-1 max-w-2xl">
            {isBn
              ? "সাভারচালা শান্তি সংঘের ইতিহাস, নেতৃত্ব, ওয়েবসাইটের প্রকৌশল প্রযুক্তি ও সদস্য সম্পর্কিত সাধারণ তথ্যাবলী।"
              : "Learn more about Shavarchala Shanti Sangho, our leadership, website engineering, tech stack, and community."}
          </p>
        </div>

        {/* Accordion FAQ List: Just questions, clicking reveals answers */}
        <div className="space-y-2.5 sm:space-y-3.5 relative z-10">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            const question = isBn ? item.questionBn : item.questionEn;
            const answer = isBn ? item.answerBn : item.answerEn;
            const action = item.actionLink
              ? {
                  href: item.actionLink.href,
                  label: isBn ? item.actionLink.labelBn : item.actionLink.labelEn,
                }
              : null;

            return (
              <div
                key={item.id}
                className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#006a4e]/35 shadow-md"
                    : "bg-white/90 hover:bg-white border-[#006a4e]/15 hover:border-[#006a4e]/30 shadow-2xs"
                }`}
              >
                {/* Accordion Trigger Header: Compact balanced mobile padding */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-3.5 sm:px-6 py-3 sm:py-4.5 flex items-center justify-between gap-2.5 sm:gap-4 text-left transition-colors cursor-pointer select-none group"
                >
                  <h3
                    className={`font-bold text-[13px] sm:text-base leading-snug transition-colors pr-1 sm:pr-2 flex-1 ${
                      isOpen ? "text-[#006a4e]" : "text-pitch group-hover:text-[#006a4e]"
                    }`}
                  >
                    {question}
                  </h3>

                  {/* Toggle Arrow Pill */}
                  <span
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#006a4e] text-white border-[#006a4e] rotate-180"
                        : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-[#006a4e]/10 group-hover:text-[#006a4e]"
                    }`}
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Accordion Expandable Content: Shown only after clicking */}
                {isOpen && (
                  <div className="px-3.5 sm:px-6 pb-4 sm:pb-5 pt-1 border-t border-slate-100 animate-in fade-in duration-200">
                    <div className="pt-2">{answer}</div>

                    {/* Action link if available */}
                    {action && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end">
                        <Link
                          href={action.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#006a4e] text-[#006a4e] hover:text-white border border-[#006a4e]/20 text-xs font-bold transition-all shadow-2xs group/link"
                        >
                          <span>{action.label}</span>
                          <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">
                            →
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
