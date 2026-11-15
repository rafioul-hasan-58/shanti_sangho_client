"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Check } from "lucide-react";
import UserAvatar from "@/components/layout/UserAvatar";
import RoleBadge from "@/components/layout/RoleBadge";
import ThemedSelect from "@/components/common/ThemedSelect";
import VerifiedTick from "@/components/common/VerifiedTick";
import { isAdminVerified } from "@/lib/authRole";
import type { ManagedUser } from "@/lib/types/dashboard";
import type { Role } from "@/types";
import { formatBloodGroupDisplay } from "@/lib/bloodGroup";
import {
  DeleteActionIcon,
  EditActionIcon,
  SuspendActionIcon,
  ViewActionIcon,
} from "./UserActionIcons";
import {
  MEMBERSHIP_BADGE_MAP,
  ROLE_OPTIONS,
  STATUS_BADGE_MAP,
} from "./userManagementConfig";

interface UserManagementTableProps {
  users: ManagedUser[];
  isBn: boolean;
  currentUserId?: string;
  busyUserId?: string | null;
  isPendingView?: boolean;
  onApprove?: (user: ManagedUser) => void;
  onRoleChange: (userId: string, role: Role) => void;
  onToggleBlock: (user: ManagedUser) => void;
  onView: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

/** Desktop-only responsive table view for all managed users. */
export default function UserManagementTable({
  users,
  isBn,
  currentUserId,
  busyUserId,
  isPendingView = false,
  onApprove,
  onRoleChange,
  onToggleBlock,
  onView,
  onEdit,
  onDelete,
}: UserManagementTableProps) {
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuUserId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuUserId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuUserId(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuUserId]);

  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white min-h-[300px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4">{isBn ? "সদস্য" : "User"}</th>
            <th className="py-3.5 px-4">{isBn ? "যোগাযোগ" : "Contact"}</th>
            <th className="py-3.5 px-4">{isBn ? "রোল" : "Role"}</th>
            <th className="py-3.5 px-4">{isBn ? "স্ট্যাটাস" : "Status"}</th>
            <th className="py-3.5 px-4">{isBn ? "রক্ত ও ঠিকানা" : "Blood & Area"}</th>
            <th className="py-3.5 px-4 text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {users.map((u, idx) => {
            const statusMeta = STATUS_BADGE_MAP[u.status] ?? STATUS_BADGE_MAP.ACTIVE;
            const membershipMeta = u.membershipType
              ? MEMBERSHIP_BADGE_MAP[u.membershipType]
              : null;
            const isBlocked = u.status === "SUSPENDED";
            const isSelf = Boolean(currentUserId && currentUserId === u.id);
            const isBusy = busyUserId === u.id;
            const isMenuOpen = openMenuUserId === u.id;
            const isLastRows = idx >= users.length - 2 && users.length >= 3;

            return (
              <tr key={u.id} className="hover:bg-[#f7f4ea]/45 transition-colors">
                <td className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => onView(u)}
                    className="flex items-center gap-3 min-w-[190px] text-left group cursor-pointer"
                  >
                    <UserAvatar
                      src={u.profileImage || u.picture}
                      name={u.fullName}
                      className="h-10 w-10 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)]">
                          {u.fullName}
                        </p>
                        {isAdminVerified(u.adminVerified) && <VerifiedTick isBn={isBn} />}
                        {isSelf && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                            {isBn ? "আপনি" : "You"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {membershipMeta && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${membershipMeta.className}`}>
                            {isBn ? membershipMeta.labelBn : membershipMeta.labelEn}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {u.joinedAt ? u.joinedAt : u.id}
                        </span>
                      </div>
                    </div>
                  </button>
                </td>

                <td className="py-3.5 px-4">
                  <p className="text-xs font-semibold text-slate-700">{u.email}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    {u.phoneNumber && <span>{u.phoneNumber}</span>}
                    {u.profession && <span>• {u.profession}</span>}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} isBn={isBn} />
                    <ThemedSelect
                      ariaLabel={`${isBn ? "রোল পরিবর্তন" : "Change role for"} ${u.fullName}`}
                      value={u.role}
                      disabled={isSelf || isBusy}
                      size="xs"
                      onChange={(nextRole) => onRoleChange(u.id, nextRole as Role)}
                      options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
                    />
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusMeta.className}`}
                  >
                    {isBn ? statusMeta.labelBn : statusMeta.labelEn}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">
                    {formatBloodGroupDisplay(u.bloodGroup)}
                  </span>
                  {(u.village || u.currentLocation) && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[160px]">
                      {[u.village, u.currentLocation].filter(Boolean).join(", ")}
                    </p>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    {isPendingView && onApprove && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onApprove(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#006a4e] hover:bg-[#004d38] text-white text-xs font-bold transition-colors disabled:opacity-45 cursor-pointer shadow-2xs"
                      >
                        {isBn ? "✓ অনুমোদন" : "✓ Approve"}
                      </button>
                    )}

                    <div
                      className="relative inline-block text-left"
                      ref={isMenuOpen ? menuRef : null}
                    >
                      <button
                        type="button"
                        aria-label={isBn ? "ইউজার অ্যাকশন মেনু" : "User actions menu"}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuUserId((prev) => (prev === u.id ? null : u.id));
                        }}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006a4e] ${
                          isMenuOpen
                            ? "bg-[#006a4e]/10 text-[#006a4e]"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <MoreVertical className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className={`absolute right-0 z-50 w-44 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 ${
                            isLastRows
                              ? "bottom-full mb-1.5 origin-bottom-right"
                              : "top-full mt-1.5 origin-top-right"
                          }`}
                        >
                          {isPendingView && onApprove && (
                            <button
                              type="button"
                              role="menuitem"
                              disabled={isBusy}
                              onClick={() => {
                                setOpenMenuUserId(null);
                                onApprove(u);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-[#006a4e] hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-45"
                            >
                              <Check className="w-4 h-4 text-[#006a4e] stroke-[2.4]" />
                              <span>{isBn ? "অনুমোদন করুন" : "Approve"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuUserId(null);
                              onView(u);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 hover:text-[#006a4e] transition-colors cursor-pointer"
                          >
                            <ViewActionIcon className="w-4 h-4 text-slate-500" />
                            <span>{isBn ? "বিস্তারিত দেখুন" : "View Details"}</span>
                          </button>

                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuUserId(null);
                              onEdit(u);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-[#006a4e] hover:bg-[#006a4e]/10 transition-colors cursor-pointer"
                          >
                            <EditActionIcon className="w-4 h-4 text-[#006a4e]" />
                            <span>{isBn ? "এডিট করুন" : "Edit User"}</span>
                          </button>

                          <button
                            type="button"
                            role="menuitem"
                            disabled={isSelf || isBusy}
                            onClick={() => {
                              setOpenMenuUserId(null);
                              onToggleBlock(u);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                              isBlocked
                                ? "text-emerald-700 hover:bg-emerald-50"
                                : "text-amber-800 hover:bg-amber-50"
                            }`}
                          >
                            <SuspendActionIcon suspended={isBlocked} className="w-4 h-4" />
                            <span>
                              {isBlocked
                                ? isBn ? "সক্রিয় করুন" : "Unsuspend"
                                : isBn ? "স্থগিত করুন" : "Suspend"}
                            </span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            role="menuitem"
                            disabled={isSelf || isBusy}
                            onClick={() => {
                              setOpenMenuUserId(null);
                              onDelete(u);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-[#f42a41] hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <DeleteActionIcon className="w-4 h-4 text-[#f42a41]" />
                            <span>{isBn ? "ডিলিট করুন" : "Delete"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
