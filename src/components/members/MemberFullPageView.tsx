"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  MapPin,
  Briefcase,
  User as UserIcon,
  Droplet,
  Home,
  Award,
  IdCard,
  Building2,
  Navigation,
} from "lucide-react";
import UserAvatar from "@/components/layout/UserAvatar";
import RoleBadge from "@/components/layout/RoleBadge";
import VerifiedTick from "@/components/common/VerifiedTick";
import { isAdminVerified } from "@/lib/authRole";
import type { ManagedUser } from "@/lib/types/dashboard";
import {
  getMemberBloodLabel,
  PlayerQuotaBadgeIcon,
} from "./MemberCardShared";
import { formatBloodGroupDisplay } from "@/lib/bloodGroup";
import { MEMBERSHIP_BADGE_MAP } from "@/components/dashboard/userManagementConfig";

interface MemberFullPageViewProps {
  member: ManagedUser;
  paletteIndex?: number;
  locale?: string;
  isBn?: boolean;
  onBack?: () => void;
}

export default function MemberFullPageView({
  member,
  paletteIndex = 0,
  locale = "en",
  isBn = false,
  onBack,
}: MemberFullPageViewProps) {
  // Hide global website footer and chatbot while viewing this member profile page
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.add("member-details-active");
      return () => {
        document.body.classList.remove("member-details-active");
      };
    }
  }, []);

  const bloodLabel = getMemberBloodLabel(member.bloodGroup);
  const hasBloodGroup =
    Boolean(member.bloodGroup) &&
    member.bloodGroup !== "UNKNOWN" &&
    bloodLabel !== "N/A";
  const isPlayerQuota = member.membershipType === "PLAYER_QUOTA";

  const phoneDisplay = member.phoneNumber || member.whatsappNumber;
  const whatsappClean = (member.whatsappNumber || member.phoneNumber)?.replace(
    /[^\d+]/g,
    ""
  );

  const membershipMeta = member.membershipType
    ? MEMBERSHIP_BADGE_MAP[member.membershipType]
    : null;

  const notProvidedText = isBn ? "প্রদান করা হয়নি" : "Not Provided";

  return (
    <div className="min-h-screen bg-chalk text-slate-900 pb-12 sm:pb-16 animate-in fade-in duration-200">
      {/* Global CSS override ensuring website footer and chatbot are removed on this profile page */}
      <style dangerouslySetInnerHTML={{ __html: `
        body.member-details-active footer,
        body.member-details-active .chatbot-root,
        body.member-details-active [aria-label="Open chatbot"],
        body.member-details-active [aria-label="Close chatbot"],
        body.member-details-active div[class*="animate-radiate"] {
          display: none !important;
        }
      `}} />

      {/* 1. TOP SUB-NAVBAR & BREADCRUMB */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  {isBn ? "সকল সদস্য তালিকায় ফিরুন" : "Back to Members"}
                </span>
              </button>
            ) : (
              <Link
                href={`/${locale}/members`}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  {isBn ? "সকল সদস্য তালিকায় ফিরুন" : "Back to Members"}
                </span>
              </Link>
            )}

            {/* Breadcrumb path */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 truncate">
              <span>/</span>
              <Link
                href={`/${locale}/members`}
                className="hover:text-[#006a4e] transition-colors"
              >
                {isBn ? "সদস্যবৃন্দ" : "Members Directory"}
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-extrabold truncate max-w-[200px]">
                {member.fullName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-7">
        {/* 2. MEMBER PROFILE HERO SECTION (Centered, Clean, No Green Cover) */}
        <section
          aria-label="Member Profile Header"
          className="rounded-3xl bg-white border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col items-center text-center space-y-3"
        >
          {/* Centered Avatar with Blue Verified Tick in Profile Frame */}
          <div className="relative inline-block">
            <UserAvatar
              src={member.profileImage || member.picture}
              name={member.fullName}
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-full ring-4 ring-slate-100 shadow-md bg-white object-cover"
            />
            {isAdminVerified(member.adminVerified) && (
              <div
                title={isBn ? "যাচাইকৃত সদস্য" : "Verified Member"}
                className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-sm ring-2 ring-white flex items-center justify-center"
              >
                <VerifiedTick isBn={isBn} className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}
          </div>

          {/* Centered Details */}
          <div className="space-y-2 max-w-lg">
            {/* 1st Line: Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {member.fullName}
              </h1>
              {member.name && member.name !== member.fullName && (
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                  ({member.name})
                </p>
              )}
            </div>

            {/* 2nd Line: Email */}
            {member.email && (
              <div>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#006a4e] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.email}</span>
                </a>
              </div>
            )}

            {/* 3rd Line: Member (Role) and Membership Type two in one line */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <RoleBadge role={member.role} isBn={isBn} />

              {isPlayerQuota ? (
                <PlayerQuotaBadgeIcon isBn={isBn} withLabel />
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#006a4e] border border-emerald-200/80 shadow-2xs">
                  {membershipMeta
                    ? isBn
                      ? membershipMeta.labelBn
                      : membershipMeta.labelEn
                    : isBn
                    ? "স্থায়ী সদস্য"
                    : "Permanent Member"}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 3. ORGANIZED DETAILS SECTION (2-Column Desktop Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-start">
          {/* LEFT 2 COLUMNS: Personal, Membership & Location Information */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-7">
            {/* Bio / Summary (if available) */}
            {(member.summary || member.bio) && (
              <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2.5">
                  <span className="text-emerald-700">✦</span>
                  <span>{isBn ? "পরিচিতি ও সংক্ষিপ্ত বক্তব্য" : "About & Statement"}</span>
                </div>
                {member.summary && (
                  <p className="text-sm sm:text-base text-slate-700 italic font-medium leading-relaxed bg-slate-50/70 p-4 rounded-2xl border-l-3 border-[#006a4e]">
                    “{member.summary}”
                  </p>
                )}
                {member.bio && member.bio !== member.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
                    {member.bio}
                  </p>
                )}
              </div>
            )}

            {/* CARD 1: Personal & Membership Details */}
            <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-3.5">
                <UserIcon className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "ব্যক্তিগত ও মেম্বারশিপ বিবরণ" : "Personal & Membership Details"}</span>
              </div>

              {/* Responsive Grid: 1 Col Mobile, 2 Col Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* 1. Full Name */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isBn ? "পূর্ণ নাম" : "Full Name"}</span>
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {member.fullName}
                  </p>
                </div>

                {/* 2. Profession */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isBn ? "পেশা" : "Profession"}</span>
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {member.profession || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                  </p>
                </div>

                {/* 3. Club Role */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isBn ? "ক্লাব রোল / পদবী" : "Club Role"}</span>
                  </p>
                  <div className="pt-0.5">
                    <RoleBadge role={member.role} isBn={isBn} />
                  </div>
                </div>

                {/* 4. Membership Type */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isBn ? "মেম্বারশিপ টাইপ" : "Membership Type"}</span>
                  </p>
                  <p className="font-extrabold text-[#006a4e] text-sm">
                    {membershipMeta
                      ? isBn
                        ? membershipMeta.labelBn
                        : membershipMeta.labelEn
                      : isPlayerQuota
                      ? isBn
                        ? "খেলোয়াড় কোটা"
                        : "Player Quota"
                      : isBn
                      ? "স্থায়ী সদস্য"
                      : "Permanent Member"}
                  </p>
                </div>

                {/* Father's Name (if available) */}
                {member.fatherName && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {isBn ? "পিতার নাম" : "Father's Name"}
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {member.fatherName}
                    </p>
                  </div>
                )}

                {/* Mother's Name (if available) */}
                {member.motherName && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {isBn ? "মাতার নাম" : "Mother's Name"}
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {member.motherName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: Address & Location Card */}
            <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-3.5">
                <MapPin className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "ঠিকানা ও এলাকা বিবরণ" : "Address & Location"}</span>
              </div>

              <div className="space-y-4">
                {/* Subtle visual separation between Permanent and Current addresses */}
                {/* Permanent Address Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#006a4e] uppercase tracking-wider">
                    <Home className="w-3.5 h-3.5" />
                    <span>{isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isBn ? "গ্রাম" : "Village"}
                      </p>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                        {member.village || (isBn ? "সাভারচালা" : "Shavarchala")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isBn ? "ডাকঘর" : "Post Office"}
                      </p>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                        {isBn ? "সাভারচালা" : "Shavarchala"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isBn ? "উপজেলা" : "Upazila"}
                      </p>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                        {isBn ? "মির্জাপুর" : "Mirzapur"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isBn ? "জেলা" : "District"}
                      </p>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                        {isBn ? "টাঙ্গাইল" : "Tangail"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Location Box */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Navigation className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>{isBn ? "বর্তমান অবস্থান" : "Current Location"}</span>
                  </div>

                  <p className="font-extrabold text-slate-900 text-sm">
                    {member.currentLocation || notProvidedText}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isBn
                      ? "বর্তমান বসবাস বা কর্মস্থলের অবস্থান"
                      : "Present residence or current workplace"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Blood Group & Contact Cards */}
          <div className="space-y-6 sm:space-y-7">
            {/* CARD 3: Blood Group & Emergency Donor Information */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-3">
                <Droplet className="w-4 h-4 text-rose-500" />
                <span>{isBn ? "রক্তদান ও জরুরি তথ্য" : "Blood Group Information"}</span>
              </div>

              {/* Clean emergency blood donor presentation with subtle red accent */}
              <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800/80">
                    {isBn ? "রক্তের গ্রুপ" : "Blood Group"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-rose-700 border border-rose-200 shadow-2xs">
                    <Droplet className="w-3 h-3 text-rose-500" />
                    <span>{isBn ? "রক্তদান নেটওয়ার্ক" : "Blood Network"}</span>
                  </span>
                </div>

                {hasBloodGroup ? (
                  <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                    🩸 {formatBloodGroupDisplay(member.bloodGroup)}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 italic">
                    {notProvidedText}
                  </p>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                  {isBn
                    ? "সাভারচালা শান্তি সংঘের জরুরি রক্তদান নেটওয়ার্কের তালিকাভুক্ত সদস্য।"
                    : "Registered member of Shavarchala Shanti Sangho Emergency Blood Donor Network."}
                </p>
              </div>

              {phoneDisplay && hasBloodGroup && (
                <a
                  href={`tel:${phoneDisplay}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all active:scale-95 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isBn ? "জরুরি প্রয়োজনে কল করুন" : "Emergency Contact"}</span>
                </a>
              )}
            </div>

            {/* CARD 4: Contact & Social Information */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-3">
                <Phone className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "যোগাযোগ ও সোশ্যাল তথ্য" : "Contact & Social Info"}</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. Email Address */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isBn ? "ইমেইল ঠিকানা" : "Email Address"}
                    </p>
                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        className="font-bold text-[#006a4e] hover:underline break-all block mt-0.5 text-xs sm:text-sm"
                      >
                        {member.email}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5 italic">
                        {notProvidedText}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Phone Number */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isBn ? "মোবাইল ফোন" : "Phone Number"}
                    </p>
                    {member.phoneNumber ? (
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="font-bold text-slate-900 hover:text-[#006a4e] block mt-0.5 text-xs sm:text-sm"
                      >
                        {member.phoneNumber}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5 italic">
                        {notProvidedText}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      WhatsApp
                    </p>
                    {whatsappClean ? (
                      <a
                        href={`https://wa.me/${whatsappClean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#128C7E] hover:underline block mt-0.5 text-xs sm:text-sm"
                      >
                        {member.whatsappNumber || member.phoneNumber}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5 italic">
                        {notProvidedText}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Facebook */}
                {member.facebookProfile && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Facebook
                      </p>
                      <a
                        href={member.facebookProfile}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-600 hover:underline block mt-0.5 truncate max-w-[200px]"
                      >
                        {member.facebookProfile}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
