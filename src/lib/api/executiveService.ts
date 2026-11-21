/**
 * Executive Management API Service (`/api/v1/executives`)
 *
 * Implements CRUD endpoints for club committee leaders and executive council:
 * - GET    /api/v1/executives              (list executives, paginated / filter by ExecutiveType)
 * - GET    /api/v1/executives/:identifier  (single executive by ID or slug)
 * - POST   /api/v1/executives              (create executive with Cloudinary image & public ID)
 * - PATCH  /api/v1/executives/:id          (update executive details)
 * - DELETE /api/v1/executives/:id          (delete executive - backend auto-cleans image)
 */

import { getStoredAccessToken } from "@/lib/api";
import type {
  Executive,
  ExecutivesListResponse,
  ExecutiveType,
} from "@/types";

export type { Executive, ExecutiveType, ExecutivesListResponse };

export interface CreateExecutivePayload {
  slug?: string;
  nameEn: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  type?: ExecutiveType;
  image?: string | null;
  imagePublicId?: string | null;
  joiningYear: string;
  isKeyLeader?: boolean;
  order?: number;
  villageEn?: string;
  villageBn?: string;
  summaryEn?: string;
  summaryBn?: string;
  keyContributionEn?: string[];
  keyContributionBn?: string[];
  mottoEn?: string | null;
  mottoBn?: string | null;

  // Legacy compatibility fields
  category?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
}

export type UpdateExecutivePayload = Partial<CreateExecutivePayload>;

// Legacy type alias for existing components
export type Member = Executive & {
  category?: string;
  phone?: string | null;
  bloodGroup?: string | null;
};
export type CreateMemberPayload = CreateExecutivePayload;
export type UpdateMemberPayload = UpdateExecutivePayload;

function getExecutivesApiBaseUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    ""
  ).replace(/\/+$/, "");

  if (base.endsWith("/api/v1")) {
    return `${base}/executives`;
  }
  return `${base}/api/v1/executives`;
}

function normalizeExecutiveType(val?: string | null): ExecutiveType {
  const upper = String(val ?? "").trim().toUpperCase();
  if (upper === "COMMITTEE" || upper === "EXECUTIVE") return "COMMITTEE";
  if (upper === "ADVISORY" || upper === "ADVISOR") return "ADVISORY";
  return "GENERAL";
}

export function mapApiExecutive(raw: Record<string, unknown>, idx = 0): Executive {
  const id = String(raw.id ?? raw._id ?? `exec-${idx + 1}`);
  const slug = String(raw.slug || raw.id || `executive-${idx + 1}`);
  const nameEn = String(raw.nameEn || raw.name || "Executive");
  const nameBn = String(raw.nameBn || raw.name || "কার্যনির্বাহী সদস্য");
  const roleEn = String(raw.roleEn || raw.role || "Member");
  const roleBn = String(raw.roleBn || raw.role || "সদস্য");
  const type = normalizeExecutiveType(
    (raw.type as string) || (raw.category as string) || "COMMITTEE"
  );
  const image = (raw.image as string) || (raw.picture as string) || null;
  const imagePublicId = (raw.imagePublicId as string) || (raw.publicId as string) || null;
  const joiningYear = String(raw.joiningYear || new Date().getFullYear());
  const isKeyLeader = Boolean(raw.isKeyLeader);
  const order = Number(raw.order ?? idx);
  const villageEn = String(raw.villageEn || raw.village || "Shavarchala");
  const villageBn = String(raw.villageBn || raw.village || "সাভারচালা");
  const summaryEn = String(raw.summaryEn || raw.summary || "");
  const summaryBn = String(raw.summaryBn || raw.summary || "");
  const keyContributionEn = Array.isArray(raw.keyContributionEn)
    ? (raw.keyContributionEn as string[])
    : [];
  const keyContributionBn = Array.isArray(raw.keyContributionBn)
    ? (raw.keyContributionBn as string[])
    : [];
  const mottoEn = (raw.mottoEn as string) || null;
  const mottoBn = (raw.mottoBn as string) || null;
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const updatedAt = String(raw.updatedAt || new Date().toISOString());

  return {
    id,
    slug,
    nameEn,
    nameBn,
    roleEn,
    roleBn,
    type,
    image,
    imagePublicId,
    joiningYear,
    isKeyLeader,
    order,
    villageEn,
    villageBn,
    summaryEn,
    summaryBn,
    keyContributionEn,
    keyContributionBn,
    mottoEn,
    mottoBn,
    createdAt,
    updatedAt,
  };
}

/**
 * 1. `GET /api/v1/executives`
 * Fetch all executives (public, searchable, filterable by ExecutiveType).
 * Array property in response is `data.executives` (formerly `data.members`).
 */
export async function fetchExecutives(params?: {
  search?: string;
  type?: ExecutiveType;
  category?: string; // Legacy fallback
  page?: number;
  limit?: number;
}): Promise<Executive[]> {
  const baseUrl = getExecutivesApiBaseUrl();
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  const resolvedType = params?.type || (params?.category ? normalizeExecutiveType(params.category) : undefined);
  if (resolvedType && resolvedType !== ("ALL" as any)) {
    searchParams.set("type", resolvedType);
  }
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const queryString = searchParams.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  const token = getStoredAccessToken();

  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Fallback to /api/v1/members during backend cutover if /executives returns 404
  if (!res.ok && res.status === 404) {
    const fallbackBase = baseUrl.replace(/\/executives$/, "/members");
    const fallbackUrl = queryString ? `${fallbackBase}?${queryString}` : fallbackBase;
    res = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch executives: ${res.statusText}`);
  }

  const json = await res.json().catch(() => ({}));

  // Key response contract: data.executives (formerly data.members)
  let rawList: Record<string, unknown>[] = [];
  if (json?.data?.executives && Array.isArray(json.data.executives)) {
    rawList = json.data.executives;
  } else if (json?.executives && Array.isArray(json.executives)) {
    rawList = json.executives;
  } else if (json?.data?.members && Array.isArray(json.data.members)) {
    rawList = json.data.members;
  } else if (Array.isArray(json?.data)) {
    rawList = json.data;
  } else if (Array.isArray(json?.members)) {
    rawList = json.members;
  } else if (Array.isArray(json)) {
    rawList = json;
  }

  return rawList.map(mapApiExecutive);
}

export const fetchMembers = fetchExecutives;

/**
 * 2. `GET /api/v1/executives/:identifier`
 * Fetch single executive by ObjectId or slug.
 */
export async function fetchExecutiveById(identifier: string): Promise<Executive> {
  const baseUrl = getExecutivesApiBaseUrl();
  const token = getStoredAccessToken();

  let res = await fetch(`${baseUrl}/${encodeURIComponent(identifier)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok && res.status === 404) {
    const fallbackBase = baseUrl.replace(/\/executives$/, "/members");
    res = await fetch(`${fallbackBase}/${encodeURIComponent(identifier)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  if (!res.ok) {
    throw new Error(`Executive not found: ${res.statusText}`);
  }

  const json = await res.json();
  const raw = json.data?.executive || json.data?.member || json.data || json;
  return mapApiExecutive(raw);
}

export const fetchMemberById = fetchExecutiveById;

/**
 * 3. `POST /api/v1/executives`
 * Create a new executive with Cloudinary photo reference (Admin only).
 */
export async function createExecutive(payload: CreateExecutivePayload): Promise<Executive> {
  const baseUrl = getExecutivesApiBaseUrl();
  const token = getStoredAccessToken();

  const formattedPayload = {
    ...payload,
    type: payload.type || (payload.category ? normalizeExecutiveType(payload.category) : "COMMITTEE"),
  };

  let res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(formattedPayload),
  });

  if (!res.ok && res.status === 404) {
    const fallbackBase = baseUrl.replace(/\/executives$/, "/members");
    res = await fetch(fallbackBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(formattedPayload),
    });
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      json.message ||
      json.error ||
      `Failed to create executive (${res.status})`;
    throw new Error(errorMsg);
  }

  const raw = json.data?.executive || json.data?.member || json.data || json;
  return mapApiExecutive(raw);
}

export const createMember = createExecutive;

/**
 * 4. `PATCH /api/v1/executives/:id`
 * Update an existing executive (Admin only).
 */
export async function updateExecutive(
  id: string,
  payload: UpdateExecutivePayload
): Promise<Executive> {
  const baseUrl = getExecutivesApiBaseUrl();
  const token = getStoredAccessToken();

  const formattedPayload = {
    ...payload,
    ...(payload.type || payload.category
      ? { type: payload.type || normalizeExecutiveType(payload.category) }
      : {}),
  };

  let res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(formattedPayload),
  });

  if (res.status === 404 || res.status === 405) {
    // Try fallback to /api/v1/members or PUT
    const fallbackBase = baseUrl.replace(/\/executives$/, "/members");
    res = await fetch(`${fallbackBase}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(formattedPayload),
    });
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      json.message ||
      json.error ||
      `Failed to update executive (${res.status})`;
    throw new Error(errorMsg);
  }

  const raw = json.data?.executive || json.data?.member || json.data || json;
  return mapApiExecutive(raw);
}

export const updateMember = updateExecutive;

/**
 * 5. `DELETE /api/v1/executives/:id`
 * Delete executive (backend automatically cleans up the Cloudinary image).
 */
export async function deleteExecutive(id: string): Promise<boolean> {
  const baseUrl = getExecutivesApiBaseUrl();
  const token = getStoredAccessToken();

  let res = await fetch(`${baseUrl}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok && res.status === 404) {
    const fallbackBase = baseUrl.replace(/\/executives$/, "/members");
    res = await fetch(`${fallbackBase}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  return res.ok;
}

export const deleteMember = deleteExecutive;
