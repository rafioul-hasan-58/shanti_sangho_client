"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Check,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Briefcase,
  User as UserIcon,
  ShieldCheck,
  Droplet,
  Home,
  Award,
  Sparkles,
  Clock,
  IdCard,
} from "lucide-react";
import UserAvatar from "@/components/layout/UserAvatar";
import RoleBadge from "@/components/layout/RoleBadge";
import VerifiedTick from "@/components/common/VerifiedTick";
import { isAdminVerified } from "@/lib/authRole";
import type { ManagedUser } from "@/lib/types/dashboard";
import {
  formatMemberJoinDate,
  getMemberBloodLabel,
  isMemberGoogleLogin,
  MemberAuthProviderIcon,
  PlayerQuotaBadgeIcon,
} from "./MemberCardShared";
import { formatRegistrationTime } from "@/lib/format";
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
  const [copiedLink, setCopiedLink] = useState(false);

  const bloodLabel = getMemberBloodLabel(member.bloodGroup);
  const isGoogle = isMemberGoogleLogin(member);
  const isPlayerQuota = member.membershipType === "PLAYER_QUOTA";
  const joinedDate = formatMemberJoinDate(member, isBn);
  const registrationTime = formatRegistrationTime(
    member.createdAt || member.joinedAt,
    isBn
  );
  const phoneDisplay = member.whatsappNumber || member.phoneNumber;
  const whatsappClean = member.whatsappNumber?.replace(/[^\d+]/g, "");

  const membershipMeta = member.membershipType
    ? MEMBERSHIP_BADGE_MAP[member.membershipType]
    : null;

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f2] text-slate-900 pb-16 animate-in fade-in duration-200">
      {/* 1. TOP SUB-NAVBAR & BREADCRUMB */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  {isBn ? "সকল সদস্য তালিকায় ফিরুন" : "Back to Members"}
                </span>
              </button>
            ) : (
              <Link
                href={`/${locale}/members`}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>
                  {isBn ? "সকল সদস্য তালিকায় ফিরুন" : "Back to Members"}
                </span>
              </Link>
            )}

            {/* Breadcrumb (hidden on narrow screens) */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 truncate">
              <span>/</span>
              <Link
                href={`/${locale}/members`}
                className="hover:text-[#006a4e] transition-colors"
              >
                {isBn ? "সদস্যবৃন্দ" : "Members Directory"}
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-extrabold truncate max-w-[200px]">
                {member.fullName}
              </span>
            </div>
          </div>

          {/* Quick Share Link */}
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-extrabold">
                  {isBn ? "লিংক কপি হয়েছে!" : "Link Copied!"}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isBn ? "প্রোফাইল শেয়ার" : "Share Profile"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. HERO SHOWCASE BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#005a42] via-[#006a4e] to-[#0A3123] text-white pt-8 pb-12 sm:pb-16 shadow-lg border-b-4 border-emerald-700">
        {/* Ambient Decorative Glow Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Big Avatar */}
            <div className="relative shrink-0">
              <UserAvatar
                src={member.profileImage || member.picture}
                name={member.fullName}
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl ring-4 ring-white/90 shadow-2xl bg-white object-cover"
              />
              {isAdminVerified(member.adminVerified) && (
                <div
                  title={isBn ? "যাচাইকৃত সদস্য" : "Verified Member"}
                  className="absolute -bottom-2 -right-2 p-1.5 rounded-2xl bg-white shadow-md flex items-center justify-center ring-2 ring-emerald-500"
                >
                  <VerifiedTick isBn={isBn} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </div>

            {/* Profile Header Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    {member.fullName}
                  </h1>
                </div>

                {member.name && member.name !== member.fullName && (
                  <p className="text-sm font-semibold text-emerald-200 mt-0.5">
                    ({member.name})
                  </p>
                )}

                <p className="text-xs sm:text-sm font-bold text-emerald-100/90 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {member.profession || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                  </span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{member.village || (isBn ? "সাভারচালা" : "Shavarchala")}</span>
                </p>
              </div>

              {/* Status & Category Badges Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <RoleBadge role={member.role} isBn={isBn} />

                {isPlayerQuota ? (
                  <PlayerQuotaBadgeIcon isBn={isBn} withLabel />
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs text-white border border-white/30 shadow-2xs">
                    {isBn ? "স্থায়ী সদস্য" : "Permanent Member"}
                  </span>
                )}

                {bloodLabel && bloodLabel !== "N/A" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/25 text-rose-100 border border-rose-400/40 shadow-2xs">
                    <span>🩸</span>
                    <span>{bloodLabel}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white/95 border border-white/25">
                  <MemberAuthProviderIcon isGoogle={isGoogle} isBn={isBn} />
                  <span>
                    {isGoogle
                      ? isBn
                        ? "গুগল ভেরিফাইড"
                        : "Google Account"
                      : isBn
                      ? "ইমেইল একাউন্ট"
                      : "Email Account"}
                  </span>
                </span>
              </div>

              {/* Hero Contact Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                {whatsappClean && (
                  <a
                    href={`https://wa.me/${whatsappClean.replace(/^\+/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs sm:text-sm font-extrabold shadow-sm transition-transform active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isBn ? "ইমেইল পাঠান" : "Email"}</span>
                  </a>
                )}

                {member.phoneNumber && (
                  <a
                    href={`tel:${member.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs sm:text-sm font-extrabold shadow-sm transition-transform active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{member.phoneNumber}</span>
                  </a>
                )}

                {member.facebookProfile && (
                  <a
                    href={member.facebookProfile}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ORGANIZED DETAILS GRID CONTENT */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* LEFT COLUMN: 2 Cols on Large Screen */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Bio / Summary (if available) */}
            {(member.summary || member.bio) && (
              <div className="rounded-3xl bg-white p-5 sm:p-7 border border-emerald-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base border-b border-emerald-100/80 pb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? "পরিচিতি ও বক্তব্য" : "Bio & Introduction"}</span>
                </div>
                {member.summary && (
                  <blockquote className="text-sm sm:text-base text-slate-700 italic font-medium leading-relaxed bg-emerald-50/60 p-4 rounded-2xl border-l-4 border-[#006a4e]">
                    “{member.summary}”
                  </blockquote>
                )}
                {member.bio && member.bio !== member.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {member.bio}
                  </p>
                )}
              </div>
            )}

            {/* Card 1: Primary Profile & Membership Overview */}
            <div className="rounded-3xl bg-white p-5 sm:p-7 border border-emerald-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3.5">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base">
                  <UserIcon className="w-4 h-4 text-[#006a4e]" />
                  <span>{isBn ? "ব্যক্তিগত ও মেম্বারশিপ বিবরণ" : "Personal & Membership Details"}</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#006a4e] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ID: #{member.id.slice(-6)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm">
                {/* Full Name */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {isBn ? "পূর্ণ নাম" : "Full Name"}
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {member.fullName}
                  </p>
                </div>

                {/* Profession */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {isBn ? "পেশা" : "Profession"}
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {member.profession || (isBn ? "ক্লাব সদস্য" : "Club Member")}
                  </p>
                </div>

                {/* Father's Name */}
                {member.fatherName && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {isBn ? "পিতার নাম" : "Father's Name"}
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {member.fatherName}
                    </p>
                  </div>
                )}

                {/* Mother's Name */}
                {member.motherName && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {isBn ? "মাতার নাম" : "Mother's Name"}
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {member.motherName}
                    </p>
                  </div>
                )}

                {/* Membership Category */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {isBn ? "মেম্বারশিপ টাইপ" : "Membership Category"}
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

                {/* Club Role */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {isBn ? "ক্লাব পদবী / রোল" : "Club Role"}
                  </p>
                  <div className="pt-0.5">
                    <RoleBadge role={member.role} isBn={isBn} />
                  </div>
                </div>

                {/* Registration Timestamp */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{isBn ? "নিবন্ধন সময়" : "Registration Time"}</span>
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {registrationTime}
                  </p>
                </div>

                {/* Verification Status */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-0.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isBn ? "ভেরিফিকেশন অবস্থা" : "Verification Status"}</span>
                  </p>
                  <p className="font-extrabold text-emerald-800 text-sm flex items-center gap-1">
                    {isAdminVerified(member.adminVerified) ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>{isBn ? "অ্যাডমিন যাচাইকৃত" : "Admin Verified"}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>{isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Verification"}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Address & Location Details */}
            <div className="rounded-3xl bg-white p-5 sm:p-7 border border-emerald-200/90 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base border-b border-emerald-100/80 pb-3.5">
                <Home className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "ঠিকানা ও এলাকা বিবরণ" : "Address & Location"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm">
                {/* Permanent Village */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                    {isBn ? "স্থায়ী গ্রাম" : "Permanent Village"}
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    🏡 {member.village || (isBn ? "সাভারচালা" : "Shavarchala")}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isBn ? "পোস্ট: সাভারচালা, মির্জাপুর, টাঙ্গাইল" : "Post: Shavarchala, Mirzapur, Tangail"}
                  </p>
                </div>

                {/* Current Location */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {isBn ? "বর্তমান অবস্থান / ঠিকানা" : "Current Location"}
                  </p>
                  <p className="font-extrabold text-slate-900 text-sm">
                    📍 {member.currentLocation || (isBn ? "সাভারচালা" : "Shavarchala")}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isBn ? "বর্তমান বসবাস বা কর্মস্থলের ঠিকানা" : "Present residence or work address"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Blood Donation & Direct Contact */}
          <div className="space-y-5 sm:space-y-6">
            {/* Card 3: Blood Group Profile */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-black text-sm sm:text-base border-b border-rose-100 pb-3">
                <Droplet className="w-4 h-4 text-rose-600" />
                <span>{isBn ? "রক্তদান নেটওয়ার্ক" : "Blood Donation Network"}</span>
              </div>

              <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 text-center space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                  {isBn ? "রক্তের গ্রুপ" : "Blood Group"}
                </p>
                <p className="text-3xl font-black text-rose-600 tracking-tight">
                  🩸 {formatBloodGroupDisplay(member.bloodGroup)}
                </p>
                <p className="text-[11px] text-slate-600 leading-snug pt-1">
                  {isBn
                    ? "সাভারচালা শান্তি সংঘের জরুরি রক্তদান নেটওয়ার্কের একজন সম্মানিত সদস্য।"
                    : "Registered member of Shanti Sangho Emergency Blood Donor Network."}
                </p>
              </div>

              {phoneDisplay && (
                <a
                  href={`tel:${phoneDisplay}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-2xs transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isBn ? "জরুরি প্রয়োজনে কল করুন" : "Emergency Call"}</span>
                </a>
              )}
            </div>

            {/* Card 4: Contact & Social Links */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm sm:text-base border-b border-emerald-100/80 pb-3">
                <Phone className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? "যোগাযোগ ও সোশ্যাল প্রোফাইল" : "Contact & Social Info"}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Email */}
                <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {isBn ? "ইমেইল ঠিকানা" : "Email Address"}
                    </p>
                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        className="font-bold text-[#006a4e] hover:underline break-all block mt-0.5"
                      >
                        {member.email}
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-400 mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {isBn ? "মোবাইল ফোন" : "Phone Number"}
                    </p>
                    {member.phoneNumber ? (
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="font-bold text-slate-900 hover:text-[#006a4e] block mt-0.5"
                      >
                        {member.phoneNumber}
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-400 mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      WhatsApp
                    </p>
                    {whatsappClean ? (
                      <a
                        href={`https://wa.me/${whatsappClean.replace(/^\+/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#128C7E] hover:underline block mt-0.5"
                      >
                        {member.whatsappNumber || member.phoneNumber}
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-400 mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Facebook */}
                {member.facebookProfile && (
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#1877F2] mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Facebook
                      </p>
                      <a
                        href={member.facebookProfile}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#1877F2] hover:underline block mt-0.5 truncate max-w-[210px]"
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

        {/* 4. BOTTOM ACTION & RETURN BAR */}
        <div className="mt-8 rounded-3xl bg-white border border-emerald-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {isBn ? "সাভারচালা শান্তি সংঘ" : "Shavarchala Shanti Sangho"}
            </h4>
            <p className="text-xs text-slate-500">
              {isBn
                ? "ঐক্য, সেবা ও প্রগতির অঙ্গীকার নিয়ে আমাদের সামাজিক অগ্রযাত্রা।"
                : "A community united for peace, service, and youth leadership."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 font-extrabold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
              >
                {isBn ? "← সকল সদস্য দেখুন" : "← Back to All Members"}
              </button>
            ) : (
              <Link
                href={`/${locale}/members`}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] border border-emerald-200/90 font-extrabold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
              >
                {isBn ? "← সকল সদস্য দেখুন" : "← Back to All Members"}
              </Link>
            )}

            <Link
              href={`/${locale}/register`}
              className="px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#00523c] text-white font-extrabold text-xs sm:text-sm shadow-2xs transition-all"
            >
              {isBn ? "সদস্য হিসেবে যোগ দিন" : "Join As Member"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
