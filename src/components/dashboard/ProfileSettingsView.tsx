"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Lock,
  UserCheck,
  Heart,
  Droplet,
  Briefcase,
  FileText,
  MapPin,
  Home,
  Phone,
  MessageCircle,
  Share2,
  Save,
  RotateCcw,
  Check,
  Copy,
  Crown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import type { Area } from "react-easy-crop";
import { ImageCropModal } from "@/components/common/ImageCropModal";
import { getCroppedFile } from "@/lib/image/cropImage";
import {
  validateImageFile,
  compressAndOptimizeImage,
} from "@/lib/image/compress";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/lib/api/upload";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import VerifiedTick from "@/components/common/VerifiedTick";
import type { BloodGroup, MembershipType } from "@/types";
import { BLOOD_GROUP_OPTIONS, formatBloodGroupDisplay } from "@/lib/bloodGroup";
import {
  getRoleDisplayMeta,
  isAdminVerified,
  normalizeRole,
} from "@/lib/authRole";

interface ProfileSettingsViewProps {
  locale?: string;
}

export default function ProfileSettingsView({ locale = "bn" }: ProfileSettingsViewProps) {
  const isBn = locale === "bn";
  const { user, updateProfile } = useAuth();
  const { role } = useRole();

  const userRole = normalizeRole(user?.role || role || "USER");
  const roleMeta = getRoleDisplayMeta(userRole);
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  // Build form model from user data
  const buildProfileForm = useCallback(
    (u: typeof user) => ({
      name: u?.name || (u as any)?.fullName || "",
      fatherName: u?.fatherName || "",
      motherName: u?.motherName || "",
      phoneNumber: u?.phoneNumber || (u as any)?.phone || "",
      bloodGroup: (u?.bloodGroup as BloodGroup) || "UNKNOWN",
      membershipType: (u?.membershipType as MembershipType) || "PERMANENT",
      bio: u?.bio || "",
      summary: u?.summary || "",
      profession: u?.profession || "",
      village: u?.village || "সাভারচালা",
      currentLocation: u?.currentLocation || "সাভারচালা, সখিপুর, টাঙ্গাইল",
      whatsappNumber: u?.whatsappNumber || "",
      facebookProfile: u?.facebookProfile || "",
    }),
    []
  );

  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user));
  const [savedProfileForm, setSavedProfileForm] = useState(() => buildProfileForm(user));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // 3-tab segmented navigation
  const [profileSectionTab, setProfileSectionTab] = useState<
    "personal" | "profession" | "location"
  >("personal");

  // Dirty check: true if any field modified from saved baseline
  const isProfileDirty = useMemo(() => {
    return (Object.keys(profileForm) as Array<keyof typeof profileForm>).some(
      (key) => profileForm[key] !== savedProfileForm[key]
    );
  }, [profileForm, savedProfileForm]);

  // Sync state when user object updates
  useEffect(() => {
    if (user) {
      const next = buildProfileForm(user);
      setProfileForm(next);
      setSavedProfileForm(next);
    }
  }, [user, buildProfileForm]);

  // Copy email to clipboard helper
  const handleCopyEmail = async () => {
    const emailToCopy = user?.email || "";
    if (!emailToCopy) return;
    try {
      await navigator.clipboard.writeText(emailToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Profile completion score calculation (0 - 100%)
  const completionStats = useMemo(() => {
    const checks = [
      { key: "name", label: isBn ? "নাম" : "Full Name", weight: 10, valid: Boolean(profileForm.name?.trim()) },
      { key: "photo", label: isBn ? "প্রোফাইল ছবি" : "Profile Photo", weight: 15, valid: Boolean(user?.profileImage || user?.picture) },
      { key: "bloodGroup", label: isBn ? "রক্তের গ্রুপ" : "Blood Group", weight: 10, valid: profileForm.bloodGroup !== "UNKNOWN" },
      { key: "phone", label: isBn ? "মোবাইল নম্বর" : "Phone", weight: 10, valid: Boolean(profileForm.phoneNumber?.trim()) },
      { key: "father", label: isBn ? "বাবার নাম" : "Father's Name", weight: 5, valid: Boolean(profileForm.fatherName?.trim()) },
      { key: "mother", label: isBn ? "মায়ের নাম" : "Mother's Name", weight: 5, valid: Boolean(profileForm.motherName?.trim()) },
      { key: "profession", label: isBn ? "পেশা" : "Profession", weight: 10, valid: Boolean(profileForm.profession?.trim()) },
      { key: "summary", label: isBn ? "সারসংক্ষেপ" : "Summary", weight: 10, valid: Boolean(profileForm.summary?.trim()) },
      { key: "bio", label: isBn ? "বায়ো" : "Biography", weight: 10, valid: Boolean(profileForm.bio?.trim()) },
      { key: "village", label: isBn ? "গ্রাম" : "Village", weight: 5, valid: Boolean(profileForm.village?.trim()) },
      { key: "location", label: isBn ? "বর্তমান অবস্থান" : "Location", weight: 5, valid: Boolean(profileForm.currentLocation?.trim()) },
      { key: "social", label: isBn ? "সামাজিক লিংক" : "Social Link", weight: 5, valid: Boolean(profileForm.whatsappNumber?.trim() || profileForm.facebookProfile?.trim()) },
    ];

    const percentage = checks.reduce((acc, curr) => (curr.valid ? acc + curr.weight : acc), 0);
    const missing = checks.filter((c) => !c.valid);

    return { percentage, missing };
  }, [profileForm, user, isBn]);

  // Profile Photo Upload & Crop State
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const rawPhotoObjectUrlRef = useRef<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [photoOptimizationNote, setPhotoOptimizationNote] = useState<string | null>(null);
  const [photoStatusMessage, setPhotoStatusMessage] = useState<{ bn: string; en: string } | null>(null);
  const [photoError, setPhotoError] = useState<{ bn: string; en: string } | null>(null);
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(null);
  const [currentPhotoPublicId, setCurrentPhotoPublicId] = useState<string | null>(null);

  const cleanupPhotoObjectUrl = useCallback(() => {
    if (rawPhotoObjectUrlRef.current) {
      URL.revokeObjectURL(rawPhotoObjectUrlRef.current);
      rawPhotoObjectUrlRef.current = null;
    }
  }, []);

  const handleProfilePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPhotoError(null);
    setPhotoStatusMessage(null);
    setPhotoOptimizationNote(null);

    const validation = validateImageFile(file);
    if (!validation.valid && validation.errorEn && validation.errorBn) {
      setPhotoError({ bn: validation.errorBn, en: validation.errorEn });
      return;
    }

    cleanupPhotoObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    rawPhotoObjectUrlRef.current = objectUrl;

    setSelectedPhotoFile(file);
    setRawPhotoSrc(objectUrl);
    setCropModalOpen(true);
  };

  const handleCloseCropModal = () => {
    setCropModalOpen(false);
    setRawPhotoSrc(null);
    setSelectedPhotoFile(null);
    cleanupPhotoObjectUrl();
  };

  const handleCropConfirm = async (pixelCrop: Area) => {
    if (!rawPhotoSrc) return;
    setIsPhotoProcessing(true);
    setPhotoError(null);

    try {
      const croppedFile = await getCroppedFile(
        rawPhotoSrc,
        pixelCrop,
        "profile-photo.webp"
      );

      const originalBytes = selectedPhotoFile?.size;
      const compressionResult = await compressAndOptimizeImage(croppedFile);

      const reader = new FileReader();
      const previewDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressionResult.file);
      });

      try {
        const uploadResult = await uploadProfilePhoto({
          file: compressionResult.file,
          oldPublicId: currentPhotoPublicId,
        });

        setCurrentPhotoPublicId(uploadResult.publicId);
        setLocalProfilePicture(uploadResult.url);
        await updateProfile({
          picture: uploadResult.url,
          profileImage: uploadResult.url,
        });
      } catch (uploadErr) {
        console.warn("Backend upload notification (using local preview):", uploadErr);
        setLocalProfilePicture(previewDataUrl);
        await updateProfile({
          picture: previewDataUrl,
          profileImage: previewDataUrl,
        });
      }

      const displayOriginal = originalBytes
        ? `${(originalBytes / (1024 * 1024)).toFixed(1)} MB`
        : compressionResult.formattedOriginalSize;
      setPhotoOptimizationNote(
        `Optimized: ${displayOriginal} → ${compressionResult.formattedCompressedSize}`
      );
      setPhotoStatusMessage({
        bn: "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!",
        en: "Profile photo updated successfully!",
      });

      handleCloseCropModal();
      setTimeout(() => setPhotoStatusMessage(null), 5000);
    } catch (err) {
      console.error("Profile photo processing error:", err);
      setPhotoError({
        bn: "ছবি প্রসেস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        en: "Failed to process photo. Please try again.",
      });
      handleCloseCropModal();
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  // Form submission handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = profileForm.name.trim();
    if (!trimmedName) {
      alert(isBn ? "অনুগ্রহ করে আপনার পুরো নাম লিখুন।" : "Please enter your full name.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: trimmedName,
        fatherName: profileForm.fatherName.trim() || null,
        motherName: profileForm.motherName.trim() || null,
        phoneNumber: profileForm.phoneNumber.trim() || null,
        bloodGroup: profileForm.bloodGroup,
        membershipType: profileForm.membershipType,
        bio: profileForm.bio.trim() || null,
        summary: profileForm.summary.trim() || null,
        profession: profileForm.profession.trim() || null,
        village: profileForm.village.trim() || null,
        currentLocation: profileForm.currentLocation.trim() || null,
        whatsappNumber: profileForm.whatsappNumber.trim() || null,
        facebookProfile: profileForm.facebookProfile.trim() || null,
      });

      setSavedProfileForm(profileForm);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4500);
    } catch (err) {
      console.error("Profile save error:", err);
      const errMsg = err instanceof Error ? err.message : "";
      alert(errMsg || (isBn ? "প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to save profile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Cancel / Reset modifications to saved baseline
  const handleCancelChanges = () => {
    setProfileForm(savedProfileForm);
  };

  const displayName = profileForm.name || user?.name || (isBn ? "শান্তি সংঘ সদস্য" : "Club Member");
  const displayEmail = user?.email || "member@shantisangha.org";
  const currentPhoto = localProfilePicture || user?.profileImage || user?.picture || null;
  const formattedBlood = formatBloodGroupDisplay(profileForm.bloodGroup);

  const formatLastUpdated = (dateStr?: string) => {
    if (!dateStr) return isBn ? "আজকের" : "Today";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ========================================================= */}
      {/* 1. PROFILE HEADER CARD WITH GRADIENT BANNER & OVERLAP AVATAR */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
        {/* Cover Banner (120px to 140px Emerald-to-Teal Gradient with Pattern) */}
        <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-emerald-600 via-[#006a4e] to-teal-700 relative overflow-hidden">
          {/* Subtle geometric dot pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Ambient light glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-teal-300/20 blur-xl" />
        </div>

        {/* Content Below Banner */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar & Camera Button */}
            <div className="relative shrink-0 mx-auto sm:mx-0 group">
              {/* Hidden file input */}
              <input
                ref={profilePhotoInputRef}
                id="profile-settings-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleProfilePhotoSelected}
                disabled={isPhotoProcessing}
              />

              {/* 96px circular avatar with 4px white border and soft shadow */}
              <button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
                disabled={isPhotoProcessing}
                aria-label={isBn ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Change profile photo"}
                title={isBn ? "ছবি পরিবর্তন করতে ক্লিক করুন" : "Click to change photo"}
                className="relative block h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-[#006a4e] transition-transform duration-200 cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006a4e]/40"
              >
                {currentPhoto ? (
                  <Image
                    src={currentPhoto}
                    alt={displayName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-black text-3xl sm:text-4xl bg-gradient-to-br from-[#006a4e] to-teal-800">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Processing overlay */}
                {isPhotoProcessing && (
                  <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <div className="w-7 h-7 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-1" />
                    <span className="text-[10px] font-bold text-emerald-300">
                      {isBn ? "আপলোড হচ্ছে..." : "Uploading..."}
                    </span>
                  </div>
                )}
              </button>

              {/* Small Green Camera Action Button (Bottom-Right Badge) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  profilePhotoInputRef.current?.click();
                }}
                disabled={isPhotoProcessing}
                aria-label={isBn ? "ছবি আপলোড বা পরিবর্তন করুন" : "Upload or change photo"}
                title={isBn ? "ছবি আপলোড করতে ক্লিক করুন" : "Click to upload photo"}
                className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#006a4e] hover:bg-emerald-700 active:scale-90 text-white ring-3 ring-white shadow-md transition-all duration-150 flex items-center justify-center cursor-pointer z-20 hover:scale-105"
              >
                <Camera className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Top Right: Profile Completion Progress Bar */}
            <div className="w-full sm:w-64 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-[#006a4e]" />
                  <span>{isBn ? "প্রোফাইল সম্পন্নতা" : "Profile Completeness"}</span>
                </span>
                <span className="text-[#006a4e] font-black">{completionStats.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#006a4e] rounded-full transition-all duration-500"
                  style={{ width: `${completionStats.percentage}%` }}
                />
              </div>
              {completionStats.missing.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-1.5 truncate">
                  {isBn ? "বাকি আছে:" : "Next to add:"}{" "}
                  <span className="text-slate-600 font-semibold">
                    {completionStats.missing.slice(0, 2).map((m) => m.label).join(", ")}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* User Details Row: Name, Verified Badge, Email, Pills */}
          <div className="space-y-3 text-center sm:text-left">
            {/* Name + Verified */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {displayName}
              </h1>
              {isAdminVerified(user?.adminVerified ?? (user as any)?.adminApproved) && (
                <VerifiedTick isBn={isBn} className="w-5 h-5" />
              )}
            </div>

            {/* Email with Copy Button */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-none">{displayEmail}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                title={isBn ? "ইমেইল কপি করুন" : "Copy email address"}
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{isBn ? "কপি হয়েছে!" : "Copied!"}</span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Badges Row: Role + Blood Group + Member status */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
              {/* Role Pill: Amber with Crown */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 text-xs font-black shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-600 stroke-[2.4]" />
                <span>
                  {isAdmin
                    ? isBn
                      ? roleMeta.labelBn
                      : roleMeta.labelEn
                    : isBn
                    ? "রেজিস্টার্ড সদস্য"
                    : "Club Member"}
                </span>
              </span>

              {/* Blood Group Pill: Red with Droplet */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200/90 text-xs font-black shadow-2xs">
                <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span>
                  {!formattedBlood || formattedBlood.trim().toUpperCase() === "UNKNOWN"
                    ? isBn
                      ? "রক্তের গ্রুপ দেওয়া হয়নি"
                      : "Blood: N/A"
                    : `${isBn ? "গ্রুপ" : "Blood"}: ${formattedBlood}`}
                </span>
              </span>

              {/* Village Pill */}
              {profileForm.village && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span>{profileForm.village}</span>
                </span>
              )}
            </div>

            {/* Photo Notification / Error Alerts */}
            {photoOptimizationNote && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold animate-fadeIn mt-2">
                <Sparkles className="w-3.5 h-3.5 text-[#006a4e]" />
                <span>{photoOptimizationNote}</span>
              </div>
            )}
            {photoStatusMessage && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn mt-2">
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
                <span>{isBn ? photoStatusMessage.bn : photoStatusMessage.en}</span>
              </div>
            )}
            {photoError && (
              <div className="w-full max-w-md rounded-xl bg-red-50 border border-red-200 p-2.5 text-red-700 text-xs font-medium flex items-start gap-2 animate-fadeIn mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-bold">{photoError.bn}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoError(null)}
                  className="text-red-400 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB NAVIGATION (Segmented Control Pill Style)           */}
      {/* ========================================================= */}
      <div className="p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 flex items-center gap-1.5 w-full overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => setProfileSectionTab("personal")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
            profileSectionTab === "personal"
              ? "bg-[#006a4e] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
          }`}
        >
          <User className="w-4 h-4" />
          <span className="whitespace-nowrap">{isBn ? "ব্যক্তিগত তথ্য" : "Personal Info"}</span>
        </button>

        <button
          type="button"
          onClick={() => setProfileSectionTab("profession")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
            profileSectionTab === "profession"
              ? "bg-[#006a4e] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="whitespace-nowrap">{isBn ? "পেশা ও বায়ো" : "Profession & Bio"}</span>
        </button>

        <button
          type="button"
          onClick={() => setProfileSectionTab("location")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
            profileSectionTab === "location"
              ? "bg-[#006a4e] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="whitespace-nowrap">{isBn ? "ঠিকানা ও যোগাযোগ" : "Location & Links"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. PROFILE FORM SECTIONS                                  */}
      {/* ========================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* --------------------------------------------------------- */}
        {/* TAB 1: Personal & Family Information                      */}
        {/* --------------------------------------------------------- */}
        {profileSectionTab === "personal" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-fadeIn">
            {/* Section Header with Tinted Circle Icon */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#006a4e] border border-emerald-100/90 flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                  {isBn ? "ব্যক্তিগত ও পারিবারিক তথ্য" : "Personal & Family Information"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isBn
                    ? "আপনার পূর্ণ নাম, পারিবারিক পরিচিতি ও জরুরি রক্তের গ্রুপ"
                    : "Your legal full name, parents' identity, and emergency blood group"}
                </p>
              </div>
            </div>

            {/* Inputs 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "পুরো নাম" : "Full Name"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    placeholder={isBn ? "আপনার পুরো নাম লিখুন" : "Enter your full name"}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Email (Read only + Verified Chip) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-700">
                    {isBn ? "ইমেইল ঠিকানা" : "Email Address"}
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{isBn ? "যাচাইকৃত" : "Verified"}</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-500 cursor-not-allowed outline-none select-all"
                  />
                </div>
              </div>

              {/* Father's Name */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "বাবার নাম" : "Father's Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.fatherName}
                    onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                    placeholder={isBn ? "বাবার পুরো নাম" : "Enter father's name"}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "মায়ের নাম" : "Mother's Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.motherName}
                    onChange={(e) => setProfileForm({ ...profileForm, motherName: e.target.value })}
                    placeholder={isBn ? "মায়ের পুরো নাম" : "Enter mother's name"}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-700">
                    {isBn ? "রক্তের গ্রুপ" : "Blood Group"}
                  </label>
                  <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    <Droplet className="w-3 h-3 fill-rose-600" />
                    <span>{isBn ? "জরুরি রক্তদানে ব্যবহৃত" : "Used for emergency blood matching"}</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
                    <Droplet className="w-4 h-4 fill-rose-500" />
                  </div>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        bloodGroup: e.target.value as BloodGroup,
                      })
                    }
                    className="w-full h-12 pl-10 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                  >
                    {BLOOD_GROUP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-slate-800 font-medium">
                        {isBn ? opt.labelBn : opt.labelEn}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step Navigation to Next Tab */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setProfileSectionTab("profession")}
                className="h-11 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>{isBn ? "পরবর্তী: পেশা ও বায়ো" : "Next: Profession & Bio"}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 2: Profession, Summary & Biography                    */}
        {/* --------------------------------------------------------- */}
        {profileSectionTab === "profession" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-fadeIn">
            {/* Section Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Briefcase className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                  {isBn ? "পেশা, সারসংক্ষেপ ও জীবনবৃত্তান্ত" : "Profession, Summary & Biography"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isBn
                    ? "ক্লাবে আপনার পেশাগত পরিচিতি, ছোট সারসংক্ষেপ ও বিস্তারিত বায়ো"
                    : "Your professional role, short description, and club biography"}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Profession */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "পেশা / বর্তমান পদবি" : "Profession / Designation"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.profession}
                    onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                    placeholder={
                      isBn
                        ? "যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ব্যবসায়ী / শিক্ষার্থী"
                        : "e.g. Software Engineer, Teacher, Student"
                    }
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Short Summary (One-liner) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "সংক্ষিপ্ত সারসংক্ষেপ (এক লাইন)" : "Short Summary (One-liner)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.summary}
                    onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                    placeholder={
                      isBn
                        ? "শান্তি সংঘের নিবেদিত সমাজকর্মী ও ক্রীড়াপ্রেমী..."
                        : "Dedicated community volunteer and sports enthusiast..."
                    }
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Biography (Textarea) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "বিস্তারিত বায়ো / পরিচিতি" : "Detailed Biography"}
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder={
                      isBn
                        ? "আপনার সম্পর্কে বিস্তারিত লিখুন... ক্লাবের সাথে আপনার সম্পৃক্ততা ও লক্ষ্য।"
                        : "Write about yourself, background, and association with the club..."
                    }
                    className="w-full p-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none resize-y min-h-[110px] leading-relaxed shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setProfileSectionTab("personal")}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>{isBn ? "ব্যক্তিগত তথ্য" : "Personal Info"}</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileSectionTab("location")}
                className="h-11 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>{isBn ? "পরবর্তী: ঠিকানা ও যোগাযোগ" : "Next: Location & Links"}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: Address & Social Channels                          */}
        {/* --------------------------------------------------------- */}
        {profileSectionTab === "location" && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-fadeIn">
            {/* Section Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                  {isBn ? "ঠিকানা ও সামাজিক যোগাযোগ" : "Location & Contact Channels"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isBn
                    ? "স্থায়ী গ্রাম, বর্তমান ঠিকানা এবং মোবাইল ও সামাজিক যোগাযোগ লিংক"
                    : "Village origin, current location, phone and direct communication channels"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Village */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "গ্রাম / স্থায়ী এলাকা" : "Village / Native Area"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.village}
                    onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                    placeholder={isBn ? "যেমন: সাভারচালা, সখিপুর" : "e.g. Shavarchala, Sakhipur"}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                  {isBn ? "বর্তমান বাসস্থান / ঠিকানা" : "Current Location"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileForm.currentLocation}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, currentLocation: e.target.value })
                    }
                    placeholder={isBn ? "যেমন: ঢাকা, বাংলাদেশ" : "e.g. Dhaka, Bangladesh"}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-700">
                    {isBn ? "মোবাইল নম্বর" : "Phone Number"}
                  </label>
                  <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    {isBn ? "কল ও এসএমএস" : "Call & SMS"}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                    }
                    placeholder="+8801700000000"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-700">
                    {isBn ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"}
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    WhatsApp
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={profileForm.whatsappNumber}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, whatsappNumber: e.target.value })
                    }
                    placeholder="+8801700000000"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Facebook Profile Link */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-700">
                    {isBn ? "ফেসবুক প্রোফাইল লিংক" : "Facebook Profile Link"}
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Facebook
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={profileForm.facebookProfile}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, facebookProfile: e.target.value })
                    }
                    placeholder="https://facebook.com/username"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-[#006a4e]/20 transition-all outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-start">
              <button
                type="button"
                onClick={() => setProfileSectionTab("profession")}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>{isBn ? "পেশা ও বায়ো" : "Profession & Bio"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info: Last Updated timestamp */}
        <div className="text-center text-[11px] text-slate-400 font-medium py-2">
          <span>
            {isBn ? "সর্বশেষ তথ্য আপডেট:" : "Last updated:"}{" "}
            {formatLastUpdated((user as any)?.updatedAt)}
          </span>
        </div>

        {/* ========================================================= */}
        {/* 4. STICKY BOTTOM BAR (Active on changes / saving / saved) */}
        {/* ========================================================= */}
        {(isProfileDirty || isSavingProfile || profileSaveSuccess) && (
          <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="text-xs">
              {profileSaveSuccess && !isProfileDirty ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? "সকল তথ্য সফলভাবে সংরক্ষিত হয়েছে!" : "All changes saved successfully!"}</span>
                </span>
              ) : (
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    {isBn
                      ? "অসংরক্ষিত পরিবর্তন রয়েছে। সংরক্ষণ করতে ক্লিক করুন।"
                      : "You have unsaved changes."}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Cancel Button (Ghost) */}
              {isProfileDirty && !isSavingProfile && (
                <button
                  type="button"
                  onClick={handleCancelChanges}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? "বাতিল" : "Cancel"}</span>
                </button>
              )}

              {/* Save Button (Primary Emerald) */}
              {(isProfileDirty || isSavingProfile) && (
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005a42] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#006a4e]/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{isBn ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isBn ? "তথ্য সংরক্ষণ করুন" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* ========================================================= */}
      {/* 5. IMAGE CROP MODAL                                       */}
      {/* ========================================================= */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawPhotoSrc}
        aspectRatio={1 / 1}
        locale={locale}
        onClose={handleCloseCropModal}
        onConfirm={handleCropConfirm}
        isProcessing={isPhotoProcessing}
      />
    </div>
  );
}
