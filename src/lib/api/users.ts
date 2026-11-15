/**
 * Admin User Management API Client (`/users`)
 *
 * Implements all 5 endpoints from the backend User Management specification:
 * 1. GET    /users                (paginated, filterable, sortable)
 * 2. GET    /users/:id            (single user details)
 * 3. PATCH  /users/:id            (profile + administrative updates)
 * 4. PATCH  /users/:id/toggle-block (toggle SUSPENDED <-> ACTIVE)
 * 5. DELETE /users/:id            (permanent delete)
 */

import { API_BASE_URL, apiRequest, type ApiResponse } from "@/lib/api";
import { normalizeRole, normalizeUserStatus } from "@/lib/authRole";
import { toPrismaBloodGroup } from "@/lib/bloodGroup";
import { MOCK_MANAGED_USERS } from "@/lib/mock/dashboard";
import type {
  ManagedUser,
  UpdateManagedUserPayload,
  UsersListResponse,
  UsersPaginationMeta,
  UsersQueryParams,
} from "@/lib/types/dashboard";
import type { MembershipType } from "@/types";

function asNullableString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeMembershipType(val: unknown): MembershipType | null {
  const upper = String(val ?? "").trim().toUpperCase();
  if (upper === "PERMANENT" || upper === "PLAYER_QUOTA") {
    return upper;
  }
  return null;
}

/** Map a raw backend user JSON object into the normalized `ManagedUser` model. */
export function mapApiUser(raw: Record<string, unknown>, idx = 0): ManagedUser {
  const id = String(raw.id ?? raw._id ?? `user-${idx + 1}`);
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
  const createdAt = asNullableString(raw.createdAt) ?? undefined;
  const updatedAt = asNullableString(raw.updatedAt) ?? undefined;

  return {
    id,
    fullName,
    name: fullName,
    fatherName: asNullableString(raw.fatherName),
    motherName: asNullableString(raw.motherName),
    email: typeof raw.email === "string" ? raw.email : "",
    profileImage,
    imagePublicId:
      asNullableString(raw.imagePublicId) || asNullableString(raw.publicId),
    picture: profileImage ?? undefined,
    phoneNumber,
    phone: phoneNumber,
    bloodGroup: asNullableString(raw.bloodGroup),
    bio:
      asNullableString(raw.bio) ||
      asNullableString(raw.summaryBn) ||
      asNullableString(raw.summaryEn),
    summary:
      asNullableString(raw.summary) ||
      asNullableString(raw.summaryBn) ||
      asNullableString(raw.summaryEn),
    status: normalizeUserStatus(raw.status) ?? "ACTIVE",
    role: normalizeRole(raw.role || raw.roleEn || raw.roleBn),
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
    membershipType: normalizeMembershipType(raw.membershipType),
    facebookProfile: asNullableString(raw.facebookProfile),
    authProvider: asNullableString(raw.authProvider),
    emailVerified:
      typeof raw.emailVerified === "boolean" ? raw.emailVerified : null,
    phoneVerified:
      typeof raw.phoneVerified === "string" || typeof raw.phoneVerified === "boolean"
        ? raw.phoneVerified
        : null,
    adminVerified:
      typeof (raw.adminVerified ?? raw.adminApproved) === "string" ||
      typeof (raw.adminVerified ?? raw.adminApproved) === "boolean"
        ? (raw.adminVerified ?? raw.adminApproved) as string | boolean
        : null,
    googleId: asNullableString(raw.googleId),
    createdAt,
    updatedAt,
    joinedAt: createdAt
      ? createdAt.slice(0, 10)
      : raw.joiningYear
        ? String(raw.joiningYear)
        : undefined,
  };
}

function buildUsersQueryString(params: UsersQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  if (params.membershipType) qs.set("membershipType", params.membershipType);
  if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
  if (typeof params.emailVerified === "boolean") {
    qs.set("emailVerified", String(params.emailVerified));
  }
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

function isNetworkFailure(err: unknown): boolean {
  return err instanceof TypeError;
}

export function queryMockUsers(params: UsersQueryParams = {}): UsersListResponse {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 10);
  const q = params.search?.trim().toLowerCase() ?? "";

  const filtered = MOCK_MANAGED_USERS.filter((u) => {
    if (params.role && u.role !== params.role) return false;
    if (params.status && u.status !== params.status) return false;
    if (params.membershipType && u.membershipType !== params.membershipType) return false;
    if (params.bloodGroup && toPrismaBloodGroup(u.bloodGroup) !== params.bloodGroup) {
      return false;
    }
    if (
      typeof params.emailVerified === "boolean" &&
      Boolean(u.emailVerified) !== params.emailVerified
    ) {
      return false;
    }
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phoneNumber?.toLowerCase().includes(q) ?? false) ||
      (u.village?.toLowerCase().includes(q) ?? false) ||
      (u.profession?.toLowerCase().includes(q) ?? false) ||
      (u.currentLocation?.toLowerCase().includes(q) ?? false)
    );
  });

  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";
  const sorted = [...filtered].sort((a, b) => {
    const valA = String(a[sortBy] ?? "").toLowerCase();
    const valB = String(b[sortBy] ?? "").toLowerCase();
    const cmp = valA.localeCompare(valB);
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  return {
    users: sorted.slice(start, start + limit).map((u) => ({ ...u })),
    meta: {
      total,
      page: safePage,
      limit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
    isMockFallback: true,
  };
}

/**
 * 1. `GET /api/v1/users` (or fallback `/api/v1/members`) — Live backend member list.
 * Only real user data from backend, NO dummy / static data.
 */
export async function fetchUsers(
  params: UsersQueryParams = {}
): Promise<UsersListResponse> {
  const query = buildUsersQueryString(params);
  let res: ApiResponse<any> | null = null;
  let lastError: Error | null = null;

  // 1. Try /users endpoint first (now public endpoint: skipAuth: true, no accessToken passed)
  try {
    res = await apiRequest<any>(`/users${query}`, { skipAuth: true });
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // 2. If /users was blocked or not found, try /members (also public: skipAuth: true)
  if (!res || !res.data) {
    try {
      res = await apiRequest<any>(`/members${query}`, { skipAuth: true });
    } catch {
      if (lastError) throw lastError;
    }
  }

  if (!res) {
    throw lastError || new Error("Failed to fetch user data from backend");
  }

  const d = res.data ?? res;
  let rawUsers: Record<string, unknown>[] = [];
  if (Array.isArray(d)) {
    rawUsers = d;
  } else if (d && typeof d === "object") {
    const obj = d as Record<string, unknown>;
    if (Array.isArray(obj.users)) rawUsers = obj.users as Record<string, unknown>[];
    else if (Array.isArray(obj.members)) rawUsers = obj.members as Record<string, unknown>[];
    else if (Array.isArray(obj.data)) rawUsers = obj.data as Record<string, unknown>[];
    else if (Array.isArray(obj.items)) rawUsers = obj.items as Record<string, unknown>[];
    else if (Array.isArray(obj.results)) rawUsers = obj.results as Record<string, unknown>[];
  }

  const users = rawUsers
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object")
    )
    .map(mapApiUser);

  const rawMeta =
    (res.data && typeof res.data === "object" ? (res.data as any).meta : null) ||
    (res.data && typeof res.data === "object" ? (res.data as any).pagination : null) ||
    (res as any)?.meta ||
    null;

  const page = Number(rawMeta?.page ?? params.page ?? 1);
  const limit = Number(rawMeta?.limit ?? params.limit ?? 10);
  const total = Number(rawMeta?.total ?? users.length);
  const totalPages = Math.max(
    1,
    Number(rawMeta?.totalPages ?? Math.ceil(total / Math.max(1, limit)))
  );

  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: Boolean(rawMeta?.hasNextPage ?? page < totalPages),
      hasPreviousPage: Boolean(rawMeta?.hasPreviousPage ?? page > 1),
    },
    isMockFallback: false,
  };
}

/**
 * Public-safe member directory fetch: always loads directly from live backend,
 * strictly NO dummy / static data.
 */
export async function fetchPublicMembers(
  params: UsersQueryParams = {}
): Promise<UsersListResponse> {
  return await fetchUsers(params);
}

/**
 * 2. `GET /api/v1/users/:id` — Retrieve a single sanitized user by ID from backend.
 */
export async function fetchUserById(id: string): Promise<ManagedUser> {
  let res: ApiResponse<Record<string, unknown>> | null = null;
  let lastError: Error | null = null;

  try {
    res = await apiRequest<Record<string, unknown>>(`/users/${id}`);
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
    try {
      res = await apiRequest<Record<string, unknown>>(`/members/${id}`);
    } catch {
      throw lastError;
    }
  }

  const userData = (res?.data && typeof res.data === "object"
    ? (res.data as any).user || (res.data as any).member || res.data
    : res) as Record<string, unknown>;

  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid user response from server");
  }

  return mapApiUser(userData);
}

function sanitizeUpdatePayload(
  payload: UpdateManagedUserPayload
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  // 1. fullName (Must be trimmed non-empty string. Backend User model strictly uses 'fullName', NOT 'name')
  const rawName = (
    payload.fullName ||
    (payload as any).name ||
    ""
  ).trim();
  if (rawName.length > 0) {
    clean.fullName = rawName;
  }

  // 2. Strict optional string fields matching `model User` Prisma schema exactly:
  // fatherName, motherName, profileImage, phoneNumber, bio, summary, profession, village, currentLocation, whatsappNumber, facebookProfile
  // NOTE: Do NOT send 'name', 'phone', 'image', 'picture', or 'imagePublicId' as NestJS ValidationPipe with
  // `forbidNonWhitelisted: true` rejects unknown properties with 400 Bad Request.
  const addStringIfValid = (field: string, val: unknown) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.length > 0) {
        clean[field] = trimmed;
      }
    }
  };

  addStringIfValid("fatherName", payload.fatherName);
  addStringIfValid("motherName", payload.motherName);
  addStringIfValid("profileImage", payload.profileImage);
  addStringIfValid("phoneNumber", payload.phoneNumber);
  addStringIfValid("bio", payload.bio);
  addStringIfValid("summary", payload.summary);
  addStringIfValid("profession", payload.profession);
  addStringIfValid("village", payload.village);
  addStringIfValid("currentLocation", payload.currentLocation);
  addStringIfValid("whatsappNumber", payload.whatsappNumber);
  addStringIfValid("facebookProfile", payload.facebookProfile);

  // 3. bloodGroup (Enum BloodGroup: A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE, UNKNOWN)
  if (
    payload.bloodGroup &&
    typeof payload.bloodGroup === "string" &&
    payload.bloodGroup.trim().length > 0
  ) {
    clean.bloodGroup = payload.bloodGroup.trim();
  }

  // 4. membershipType (Enum MembershipType: PERMANENT, PLAYER_QUOTA)
  if (payload.membershipType) {
    clean.membershipType = payload.membershipType;
  }

  // 5. role (Enum Role: USER, MODERATOR, ADMIN, SUPER_ADMIN)
  if (payload.role) {
    clean.role = payload.role;
  }

  // 6. status (Enum UserStatus: ACTIVE, SUSPENDED)
  if (payload.status) {
    clean.status = payload.status;
  }

  // 7. Booleans
  if (typeof payload.emailVerified === "boolean") {
    clean.emailVerified = payload.emailVerified;
  }
  if (typeof (payload as any).phoneVerified === "boolean") {
    clean.phoneVerified = (payload as any).phoneVerified;
  }
  if (typeof payload.adminVerified === "boolean") {
    clean.adminVerified = payload.adminVerified;
  }

  return clean;
}

/**
 * 3. `PATCH /api/v1/users/:id` — Update profile and/or administrative fields.
 */
export async function updateUserById(
  id: string,
  payload: UpdateManagedUserPayload
): Promise<{ user: ManagedUser; message: string }> {
  const body = sanitizeUpdatePayload(payload);

  const res = await apiRequest<Record<string, unknown>>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  const rawUserData =
    res.data && typeof res.data === "object"
      ? (res.data as any).user && typeof (res.data as any).user === "object"
        ? (res.data as any).user
        : res.data
      : body;

  return {
    user: mapApiUser(rawUserData),
    message: res.message || "User updated successfully",
  };
}

/**
 * 4. `PATCH /api/v1/users/:id/toggle-block` — Toggle `SUSPENDED` <-> `ACTIVE`.
 */
export async function toggleBlockUserById(
  id: string
): Promise<{ user: ManagedUser; message: string }> {
  const res = await apiRequest<Record<string, unknown>>(
    `/users/${id}/toggle-block`,
    { method: "PATCH" }
  );

  if (!res.data || typeof res.data !== "object") {
    throw new Error("Invalid toggle-block response from server");
  }

  return {
    user: mapApiUser(res.data),
    message: res.message || "User status updated",
  };
}

/**
 * 5. `DELETE /api/v1/users/:id` — Permanently delete a user.
 */
export async function deleteUserById(
  id: string
): Promise<{ user: ManagedUser; message: string }> {
  const res = await apiRequest<Record<string, unknown>>(`/users/${id}`, {
    method: "DELETE",
  });

  if (!res.data || typeof res.data !== "object") {
    throw new Error("Invalid delete response from server");
  }

  return {
    user: mapApiUser(res.data),
    message: res.message || "User deleted successfully",
  };
}

/**
 * Payload interface for user profile updates matching the 14 allowed fields.
 */
export interface UpdateProfilePayload {
  fullName?: string;
  fatherName?: string | null;
  motherName?: string | null;
  profileImage?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  bloodGroup?: string | null;
  membershipType?: MembershipType | null;
  bio?: string | null;
  summary?: string | null;
  profession?: string | null;
  village?: string | null;
  currentLocation?: string | null;
  facebookProfile?: string | null;

  // Frontend aliases that may be passed from forms / state:
  name?: string;
  picture?: string | null;
  phone?: string | null;
}

/**
 * Strictly filters the payload for `PATCH /api/v1/users/update-profile`.
 * The server rejects unknown/extra properties with 400 Bad Request.
 * Read-only fields (id, email, password, role, status, authProvider,
 * emailVerified, phoneVerified, adminVerified, createdAt, updatedAt)
 * are NEVER included.
 * Cleared optional fields are converted to `null` or trimmed strings.
 */
export function sanitizeUpdateProfilePayload(
  payload: UpdateProfilePayload
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  // 1. fullName (string, min 2 chars)
  const rawFullName = payload.fullName ?? payload.name;
  if (typeof rawFullName === "string") {
    const trimmed = rawFullName.trim();
    if (trimmed.length >= 2) {
      clean.fullName = trimmed;
    }
  }

  // Helper for optional string or null fields
  const sanitizeOptionalField = (val: unknown): string | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return undefined;
  };

  // 2. fatherName (string or null)
  if (payload.fatherName !== undefined) {
    clean.fatherName = sanitizeOptionalField(payload.fatherName);
  }

  // 3. motherName (string or null)
  if (payload.motherName !== undefined) {
    clean.motherName = sanitizeOptionalField(payload.motherName);
  }

  // 4. profileImage (string URL or null)
  const rawImage = payload.profileImage !== undefined ? payload.profileImage : payload.picture;
  if (rawImage !== undefined) {
    clean.profileImage = sanitizeOptionalField(rawImage);
  }

  // 5. phoneNumber (string or null)
  const rawPhone = payload.phoneNumber !== undefined ? payload.phoneNumber : payload.phone;
  if (rawPhone !== undefined) {
    clean.phoneNumber = sanitizeOptionalField(rawPhone);
  }

  // 6. whatsappNumber (string or null)
  if (payload.whatsappNumber !== undefined) {
    clean.whatsappNumber = sanitizeOptionalField(payload.whatsappNumber);
  }

  // 7. bloodGroup (enum: 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE' | 'UNKNOWN')
  if (payload.bloodGroup !== undefined) {
    clean.bloodGroup = toPrismaBloodGroup(payload.bloodGroup);
  }

  // 8. membershipType (enum: 'PERMANENT' | 'PLAYER_QUOTA')
  if (payload.membershipType !== undefined) {
    if (payload.membershipType === "PLAYER_QUOTA" || payload.membershipType === "PERMANENT") {
      clean.membershipType = payload.membershipType;
    } else if (payload.membershipType === null) {
      clean.membershipType = "PERMANENT";
    }
  }

  // 9. bio (string or null)
  if (payload.bio !== undefined) {
    clean.bio = sanitizeOptionalField(payload.bio);
  }

  // 10. summary (string or null)
  if (payload.summary !== undefined) {
    clean.summary = sanitizeOptionalField(payload.summary);
  }

  // 11. profession (string or null)
  if (payload.profession !== undefined) {
    clean.profession = sanitizeOptionalField(payload.profession);
  }

  // 12. village (string or null)
  if (payload.village !== undefined) {
    clean.village = sanitizeOptionalField(payload.village);
  }

  // 13. currentLocation (string or null)
  if (payload.currentLocation !== undefined) {
    clean.currentLocation = sanitizeOptionalField(payload.currentLocation);
  }

  // 14. facebookProfile (string URL or null)
  if (payload.facebookProfile !== undefined) {
    clean.facebookProfile = sanitizeOptionalField(payload.facebookProfile);
  }

  return clean;
}

/**
 * Update authenticated user's own profile:
 * `PATCH /api/v1/users/update-profile`
 */
export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<{ user: Record<string, unknown>; message: string }> {
  const body = sanitizeUpdateProfilePayload(payload);

  const res = await apiRequest<Record<string, unknown>>("/users/update-profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawUserData =
    res.data && typeof res.data === "object"
      ? (res.data as any).user && typeof (res.data as any).user === "object"
        ? (res.data as any).user
        : res.data
      : body;

  return {
    user: rawUserData,
    message: res.message || "Profile updated successfully",
  };
}

