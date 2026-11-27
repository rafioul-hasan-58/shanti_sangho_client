/**
 * Member Management API Service (`/api/v1/members`)
 *
 * Implements all endpoints for authenticated and administrative Member accounts:
 * - GET    /api/v1/members/profile         (authenticated member profile)
 * - PATCH  /api/v1/members/update-profile  (update own profile)
 * - GET    /api/v1/members/get-all         (public/paginated list of registered members)
 * - GET    /api/v1/members/details/:id     (admin: single member details)
 * - PATCH  /api/v1/members/update/:id      (admin: update member details/role/status)
 * - PATCH  /api/v1/members/:id/toggle-block (admin: toggle SUSPENDED <-> ACTIVE)
 * - DELETE /api/v1/members/delete/:id      (admin: delete member)
 */

import { apiRequest, type ApiResponse } from "@/lib/api";
import { normalizeRole, normalizeUserStatus } from "@/lib/authRole";
import { toPrismaBloodGroup } from "@/lib/bloodGroup";
import type {
  ManagedUser,
  Member,
  MembersListResponse,
  MembersQueryParams,
  UpdateManagedUserPayload,
  UsersListResponse,
  UsersPaginationMeta,
  UsersQueryParams,
} from "@/lib/types/dashboard";
import type { BloodGroup, MemberRole, MemberStatus, MembershipType } from "@/types";

export type {
  Member,
  MemberRole,
  MemberStatus,
  MembershipType,
  BloodGroup,
  MembersListResponse,
  MembersQueryParams,
  UpdateManagedUserPayload,
};

function asNullableString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeMembershipType(val: unknown): MembershipType {
  const upper = String(val ?? "").trim().toUpperCase();
  if (
    upper === "GENERAL" ||
    upper === "LIFETIME" ||
    upper === "DONOR" ||
    upper === "HONORARY" ||
    upper === "STUDENT" ||
    upper === "PERMANENT"
  ) {
    return upper as MembershipType;
  }
  return "PERMANENT";
}

/** Map a raw backend member JSON object into the normalized `Member` / `ManagedUser` model. */
export function mapApiMember(raw: Record<string, unknown>, idx = 0): ManagedUser {
  const id = String(raw.id ?? raw._id ?? `member-${idx + 1}`);
  const fullName =
    asNullableString(raw.fullName) ||
    asNullableString(raw.name) ||
    asNullableString(raw.nameBn) ||
    asNullableString(raw.nameEn) ||
    "Club Member";
  const profileImage =
    asNullableString(raw.profileImage) ||
    asNullableString(raw.avatar) ||
    asNullableString(raw.picture) ||
    asNullableString(raw.image);
  const phoneNumber =
    asNullableString(raw.phoneNumber) ||
    asNullableString(raw.phone) ||
    asNullableString(raw.whatsappNumber);
  const createdAt = asNullableString(raw.createdAt) ?? new Date().toISOString();
  const updatedAt = asNullableString(raw.updatedAt) ?? new Date().toISOString();

  const role = (normalizeRole(raw.role || raw.roleEn || raw.roleBn) as MemberRole) ?? "USER";
  const status = (normalizeUserStatus(raw.status) as MemberStatus) ?? "ACTIVE";
  const bloodGroup =
    (toPrismaBloodGroup(raw.bloodGroup as string | null | undefined) as BloodGroup) ||
    "UNKNOWN";
  const membershipType = normalizeMembershipType(raw.membershipType);

  const authProviderRaw = String(raw.authProvider ?? "").toUpperCase();
  const authProvider: "EMAIL" | "GOOGLE" = authProviderRaw === "GOOGLE" ? "GOOGLE" : "EMAIL";

  return {
    id,
    fullName,
    name: fullName,
    fatherName: asNullableString(raw.fatherName),
    motherName: asNullableString(raw.motherName),
    email: typeof raw.email === "string" ? raw.email : "",
    profileImage,
    imagePublicId: asNullableString(raw.imagePublicId) || asNullableString(raw.publicId),
    picture: profileImage ?? undefined,
    phoneNumber,
    phone: phoneNumber,
    bloodGroup,
    bio:
      asNullableString(raw.bio) ||
      asNullableString(raw.summaryBn) ||
      asNullableString(raw.summaryEn),
    summary:
      asNullableString(raw.summary) ||
      asNullableString(raw.summaryBn) ||
      asNullableString(raw.summaryEn),
    status,
    role,
    profession:
      asNullableString(raw.profession) ||
      asNullableString(raw.roleBn) ||
      asNullableString(raw.roleEn),
    village:
      asNullableString(raw.village) ||
      asNullableString(raw.villageBn) ||
      asNullableString(raw.villageEn) ||
      "সাভারচালা",
    currentLocation:
      asNullableString(raw.currentLocation) ||
      asNullableString(raw.villageBn) ||
      asNullableString(raw.villageEn),
    whatsappNumber: asNullableString(raw.whatsappNumber) || phoneNumber,
    membershipType,
    facebookProfile: asNullableString(raw.facebookProfile),
    authProvider,
    emailVerified: Boolean(raw.emailVerified),
    phoneVerified: Boolean(raw.phoneVerified),
    adminVerified: Boolean(raw.adminVerified ?? raw.adminApproved),
    googleId: asNullableString(raw.googleId),
    createdAt,
    updatedAt,
    joinedAt: createdAt,
  };
}

/** Map Api Member alias for backward compatibility with `mapApiUser`. */
export const mapApiUser = mapApiMember;

export function buildMembersQueryString(params: MembersQueryParams = {}): string {
  const sp = new URLSearchParams();

  if (params.page && params.page > 0) sp.set("page", String(params.page));
  if (params.limit && params.limit > 0) sp.set("limit", String(params.limit));
  if (params.role && params.role !== ("ALL" as any)) sp.set("role", params.role);
  if (params.status && params.status !== ("ALL" as any)) sp.set("status", params.status);
  if (params.membershipType && params.membershipType !== ("ALL" as any)) {
    sp.set("membershipType", params.membershipType);
  }
  if (params.bloodGroup && params.bloodGroup !== ("ALL" as any)) {
    sp.set("bloodGroup", toPrismaBloodGroup(params.bloodGroup));
  }
  if (typeof params.emailVerified === "boolean") {
    sp.set("emailVerified", String(params.emailVerified));
  }
  if (typeof params.adminVerified === "boolean") {
    sp.set("adminVerified", String(params.adminVerified));
  }
  // API route update: searchTerm replaces search
  const term = (params.searchTerm ?? params.search ?? "").trim();
  if (term) {
    sp.set("searchTerm", term);
  }
  // API route update: sortOrder replaces sort & sortBy (sorting is statically locked to createdAt)
  const sortOrder = params.sortOrder || (params as any).sort;
  if (sortOrder) {
    sp.set("sortOrder", sortOrder);
  }

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const buildUsersQueryString = buildMembersQueryString;

/** Empty fallback for members queries - no dummy/mock data permitted. */
export function queryMockMembers(params: MembersQueryParams = {}): UsersListResponse {
  return {
    users: [],
    members: [],
    meta: {
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isMockFallback: false,
  };
}

export const queryMockUsers = queryMockMembers;

/**
 * 1. `GET /api/v1/members/get-all`
 * List all club members (paginated, filterable, sortable).
 * Matches backend response contract: `response.data.members`.
 */
export async function fetchMembers(
  params: MembersQueryParams = {}
): Promise<UsersListResponse> {
  const query = buildMembersQueryString(params);
  let res: ApiResponse<any> | null = null;
  let lastError: Error | null = null;

  try {
    // Primary: GET /api/v1/members/get-all
    res = await apiRequest<any>(`/members/get-all${query}`, { skipAuth: true });
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // Fallback to /members during backend cutover if /get-all returns 404
  if (!res || !res.data) {
    try {
      res = await apiRequest<any>(`/members${query}`, { skipAuth: true });
    } catch {
      try {
        res = await apiRequest<any>(`/users${query}`, { skipAuth: true });
      } catch {
        if (lastError) throw lastError;
      }
    }
  }

  if (!res) {
    throw lastError || new Error("Failed to fetch member data from backend");
  }

  const d = res.data ?? res;
  let rawMembers: Record<string, unknown>[] = [];
  let meta: UsersPaginationMeta = {
    total: 0,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  if (Array.isArray(d)) {
    rawMembers = d;
    meta.total = d.length;
    meta.totalPages = Math.max(1, Math.ceil(d.length / meta.limit));
  } else if (d && typeof d === "object") {
    const obj = d as Record<string, unknown>;
    // Key response contract: data.members (renamed from data.users)
    if (Array.isArray(obj.members)) rawMembers = obj.members as Record<string, unknown>[];
    else if (Array.isArray(obj.users)) rawMembers = obj.users as Record<string, unknown>[];
    else if (Array.isArray(obj.data)) rawMembers = obj.data as Record<string, unknown>[];
    else if (Array.isArray(obj.items)) rawMembers = obj.items as Record<string, unknown>[];
    else if (Array.isArray(obj.results)) rawMembers = obj.results as Record<string, unknown>[];

    if (obj.meta && typeof obj.meta === "object") {
      const m = obj.meta as Record<string, unknown>;
      meta = {
        total: Number(m.total ?? rawMembers.length),
        page: Number(m.page ?? params.page ?? 1),
        limit: Number(m.limit ?? params.limit ?? 10),
        totalPages: Number(m.totalPages ?? 1),
        hasNextPage: Boolean(m.hasNextPage),
        hasPreviousPage: Boolean(m.hasPreviousPage),
      };
    } else {
      meta.total = rawMembers.length;
      meta.totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
    }
  }

  const members = rawMembers
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map(mapApiMember);

  return {
    members,
    users: members,
    meta,
    isMockFallback: false,
  };
}

export const fetchUsers = fetchMembers;

export async function fetchPublicMembers(
  params: MembersQueryParams = {}
): Promise<UsersListResponse> {
  const publicParams: MembersQueryParams = {
    ...params,
    adminVerified: true,
  };
  // Real database fetch via GET /api/v1/members/get-all?adminVerified=true
  // Strictly no mock or dummy members permitted
  const res = await fetchMembers(publicParams);
  const verifiedUsers = (res.users || []).filter((u) => Boolean(u.adminVerified));
  return {
    ...res,
    users: verifiedUsers,
    members: verifiedUsers,
    meta: {
      ...res.meta,
      total: res.meta?.total ?? verifiedUsers.length,
    },
    isMockFallback: false,
  };
}

/**
 * 2. `GET /api/v1/members/profile`
 * Retrieve authenticated member's own profile.
 */
export async function fetchMemberProfile(): Promise<Member> {
  const res = await apiRequest<Record<string, unknown>>("/members/profile");
  const raw =
    res.data && typeof res.data === "object"
      ? (res.data as any).member || (res.data as any).user || res.data
      : (res as any).member || (res as any).user || res;

  return mapApiMember(raw as Record<string, unknown>);
}

/**
 * 3. `GET /api/v1/members/details/:id`
 * Retrieve a single member by ID (Admin only).
 */
export async function fetchMemberById(id: string): Promise<ManagedUser> {
  if (!id) throw new Error("Member ID is required");

  let res: ApiResponse<Record<string, unknown>> | null = null;
  try {
    // Primary: GET /api/v1/members/details/:id
    res = await apiRequest<Record<string, unknown>>(`/members/details/${encodeURIComponent(id)}`);
  } catch (err) {
    try {
      res = await apiRequest<Record<string, unknown>>(`/members/${encodeURIComponent(id)}`);
    } catch {
      try {
        res = await apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(id)}`);
      } catch {
        throw err;
      }
    }
  }

  const d = res?.data ?? res;
  const raw =
    d && typeof d === "object"
      ? (d as any).member ?? (d as any).user ?? d
      : null;

  if (!raw || typeof raw !== "object") {
    throw new Error(`Member not found for ID "${id}"`);
  }

  return mapApiMember(raw as Record<string, unknown>);
}

export const fetchUserById = fetchMemberById;

/** Clean and sanitize an administrative update payload. */
export function sanitizeUpdateMemberPayload(
  payload: UpdateManagedUserPayload
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  if (payload.fullName !== undefined) clean.fullName = payload.fullName.trim();
  if (payload.fatherName !== undefined) clean.fatherName = asNullableString(payload.fatherName);
  if (payload.motherName !== undefined) clean.motherName = asNullableString(payload.motherName);
  if (payload.profileImage !== undefined) clean.profileImage = asNullableString(payload.profileImage);
  if (payload.imagePublicId !== undefined) clean.imagePublicId = asNullableString(payload.imagePublicId);
  if (payload.phoneNumber !== undefined) clean.phoneNumber = asNullableString(payload.phoneNumber);
  if (payload.whatsappNumber !== undefined) clean.whatsappNumber = asNullableString(payload.whatsappNumber);
  if (payload.bloodGroup !== undefined) clean.bloodGroup = toPrismaBloodGroup(payload.bloodGroup);
  if (payload.membershipType !== undefined) clean.membershipType = normalizeMembershipType(payload.membershipType);
  if (payload.bio !== undefined) clean.bio = asNullableString(payload.bio);
  if (payload.summary !== undefined) clean.summary = asNullableString(payload.summary);
  if (payload.profession !== undefined) clean.profession = asNullableString(payload.profession);
  if (payload.village !== undefined) clean.village = asNullableString(payload.village);
  if (payload.currentLocation !== undefined) clean.currentLocation = asNullableString(payload.currentLocation);
  if (payload.facebookProfile !== undefined) clean.facebookProfile = asNullableString(payload.facebookProfile);

  if (payload.role !== undefined) clean.role = normalizeRole(payload.role);
  if (payload.status !== undefined) clean.status = normalizeUserStatus(payload.status);
  if (payload.emailVerified !== undefined) clean.emailVerified = Boolean(payload.emailVerified);
  if (payload.adminVerified !== undefined) clean.adminVerified = Boolean(payload.adminVerified);

  return clean;
}

export const sanitizeUpdatePayload = sanitizeUpdateMemberPayload;

/**
 * 4. `PATCH /api/v1/members/update/:id`
 * Update profile and/or administrative fields (Admin only).
 */
export async function updateMemberById(
  id: string,
  payload: UpdateManagedUserPayload
): Promise<{ member: ManagedUser; user: ManagedUser; message: string }> {
  if (!id) throw new Error("Member ID is required");

  const body = sanitizeUpdateMemberPayload(payload);
  let res: ApiResponse<Record<string, unknown>> | null = null;

  try {
    // Primary: PATCH /api/v1/members/update/:id
    res = await apiRequest<Record<string, unknown>>(`/members/update/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    try {
      res = await apiRequest<Record<string, unknown>>(`/members/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      res = await apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
  }

  const raw =
    res?.data && typeof res.data === "object"
      ? (res.data as any).member ?? (res.data as any).user ?? res.data
      : body;

  const mapped = mapApiMember(raw as Record<string, unknown>);
  return {
    member: mapped,
    user: mapped,
    message: res?.message || "Member updated successfully",
  };
}

export const updateUserById = updateMemberById;

/**
 * 5. `PATCH /api/v1/members/:id/toggle-block`
 * Toggle member status between `SUSPENDED` <-> `ACTIVE`.
 */
export async function toggleBlockMemberById(
  id: string
): Promise<{ member: ManagedUser; user: ManagedUser; message: string }> {
  if (!id) throw new Error("Member ID is required");

  let res: ApiResponse<Record<string, unknown>> | null = null;
  try {
    res = await apiRequest<Record<string, unknown>>(
      `/members/${encodeURIComponent(id)}/toggle-block`,
      { method: "PATCH" }
    );
  } catch (err) {
    res = await apiRequest<Record<string, unknown>>(
      `/users/${encodeURIComponent(id)}/toggle-block`,
      { method: "PATCH" }
    );
  }

  const raw =
    res?.data && typeof res.data === "object"
      ? (res.data as any).member ?? (res.data as any).user ?? res.data
      : {};

  const mapped = mapApiMember(raw as Record<string, unknown>);
  return {
    member: mapped,
    user: mapped,
    message: res?.message || "Member status toggled successfully",
  };
}

export const toggleBlockUserById = toggleBlockMemberById;

/**
 * 6. `DELETE /api/v1/members/delete/:id`
 * Permanently delete a member (Admin only).
 */
export async function deleteMemberById(
  id: string
): Promise<{ member: ManagedUser; user: ManagedUser; message: string }> {
  if (!id) throw new Error("Member ID is required");

  let res: ApiResponse<Record<string, unknown>> | null = null;
  try {
    // Primary: DELETE /api/v1/members/delete/:id
    res = await apiRequest<Record<string, unknown>>(`/members/delete/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    try {
      res = await apiRequest<Record<string, unknown>>(`/members/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      res = await apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }
  }

  const raw =
    res?.data && typeof res.data === "object"
      ? (res.data as any).member ?? (res.data as any).user ?? res.data
      : { id };

  const mapped = mapApiMember(raw as Record<string, unknown>);
  return {
    member: mapped,
    user: mapped,
    message: res?.message || "Member deleted successfully",
  };
}

export const deleteUserById = deleteMemberById;

export interface UpdateProfilePayload {
  fullName?: string;
  name?: string;
  fatherName?: string | null;
  motherName?: string | null;
  profileImage?: string | null;
  picture?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  bloodGroup?: BloodGroup | string | null;
  membershipType?: MembershipType | null;
  bio?: string | null;
  summary?: string | null;
  profession?: string | null;
  village?: string | null;
  currentLocation?: string | null;
  facebookProfile?: string | null;
}

export function sanitizeUpdateProfilePayload(
  payload: UpdateProfilePayload
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  const rawFullName = payload.fullName ?? payload.name;
  if (typeof rawFullName === "string") {
    const trimmed = rawFullName.trim();
    if (trimmed.length >= 2) clean.fullName = trimmed;
  }

  const sanitizeOptional = (val: unknown): string | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return undefined;
  };

  if (payload.fatherName !== undefined) clean.fatherName = sanitizeOptional(payload.fatherName);
  if (payload.motherName !== undefined) clean.motherName = sanitizeOptional(payload.motherName);

  const rawImage = payload.profileImage !== undefined ? payload.profileImage : payload.picture;
  if (rawImage !== undefined) clean.profileImage = sanitizeOptional(rawImage);

  const rawPhone = payload.phoneNumber !== undefined ? payload.phoneNumber : payload.phone;
  if (rawPhone !== undefined) clean.phoneNumber = sanitizeOptional(rawPhone);

  if (payload.whatsappNumber !== undefined) clean.whatsappNumber = sanitizeOptional(payload.whatsappNumber);
  if (payload.bloodGroup !== undefined) clean.bloodGroup = toPrismaBloodGroup(payload.bloodGroup);
  if (payload.membershipType !== undefined) {
    clean.membershipType = normalizeMembershipType(payload.membershipType);
  }
  if (payload.bio !== undefined) clean.bio = sanitizeOptional(payload.bio);
  if (payload.summary !== undefined) clean.summary = sanitizeOptional(payload.summary);
  if (payload.profession !== undefined) clean.profession = sanitizeOptional(payload.profession);
  if (payload.village !== undefined) clean.village = sanitizeOptional(payload.village);
  if (payload.currentLocation !== undefined) clean.currentLocation = sanitizeOptional(payload.currentLocation);
  if (payload.facebookProfile !== undefined) clean.facebookProfile = sanitizeOptional(payload.facebookProfile);

  return clean;
}

/**
 * 7. `PATCH /api/v1/members/update-profile`
 * Update authenticated member's own profile.
 */
export async function updateMemberProfile(
  payload: UpdateProfilePayload
): Promise<{ member: Record<string, unknown>; user: Record<string, unknown>; message: string }> {
  const body = sanitizeUpdateProfilePayload(payload);

  let res: ApiResponse<Record<string, unknown>> | null = null;
  try {
    // Primary: PATCH /api/v1/members/update-profile
    res = await apiRequest<Record<string, unknown>>("/members/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Fallback: PATCH /api/v1/users/update-profile
    res = await apiRequest<Record<string, unknown>>("/users/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const rawMemberData =
    res?.data && typeof res.data === "object"
      ? (res.data as any).member || (res.data as any).user || res.data
      : body;

  return {
    member: rawMemberData,
    user: rawMemberData,
    message: res?.message || "Profile updated successfully",
  };
}

export const updateUserProfile = updateMemberProfile;
