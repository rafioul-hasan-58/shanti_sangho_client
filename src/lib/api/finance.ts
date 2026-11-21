/**
 * Club Financial Management System API Client
 *
 * Implements full backend contracts for:
 * 1. Funds         (/api/v1/funds)         - Campaigns, categories & real-time balance calculations
 * 2. Contributions (/api/v1/contributions) - Inflow of money (donations, sponsorships, membership fees)
 * 3. Expenses      (/api/v1/expenses)      - Outflow of money (purchases, match fees, logistics) with receipts
 *
 * Gracefully integrates with live backend and provides local mock fallback for seamless offline dev.
 */

import { fetchWithAuth } from "@/lib/api";
import type {
  FundCategory,
  ReceiveMethod,
  PaymentMethod,
} from "@/lib/schemas/finance";

export type { FundCategory, ReceiveMethod, PaymentMethod };

// ---------------------------------------------------------------------------
// 1. TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface FundSummary {
  totalCollected: number;
  totalSpent: number;
  balance: number;
  contributionsCount: number;
  expensesCount: number;
  // Backward compatibility aliases
  totalIn: number;
  totalOut: number;
  remaining: number;
}

export interface Fund {
  id: string;
  name: string;
  category: FundCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  summary: FundSummary;
  // Flat compatibility properties for UI components
  totalIn: number;
  totalOut: number;
  remaining: number;
  description?: string;
}

export interface Contribution {
  id: string;
  fundId: string;
  amount: number;
  method: ReceiveMethod;
  receivedAt: string;
  giverName?: string | null;
  giverMemberId?: string | null;
  receivedById: string;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    name: string;
    category: FundCategory;
    isActive: boolean;
  };
  giverMember?: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string | null;
    village?: string | null;
  } | null;
  receivedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  // Flat compatibility aliases
  fundName: string;
  receivedByName: string;
  giverAvatar?: string | null;
}

export interface Expense {
  id: string;
  fundId: string;
  amount: number;
  spentOn: string;
  spentAt: string;
  spentById?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    name: string;
    category: FundCategory;
    isActive: boolean;
  };
  spentBy?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string | null;
  } | null;
  // Flat compatibility aliases
  fundName: string;
  spentByName?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalAmount?: number;
}

export interface FundQueryParams {
  page?: number;
  limit?: number;
  category?: FundCategory | "ALL";
  isActive?: boolean;
  search?: string;
  sortBy?: "createdAt" | "name" | "category" | "isActive";
  sortOrder?: "asc" | "desc";
}

export interface ContributionQueryParams {
  fundId?: string;
  giverMemberId?: string;
  receivedById?: string;
  method?: ReceiveMethod | "ALL";
  startDate?: string;
  endDate?: string;
  from?: string; // Compatibility alias
  to?: string;   // Compatibility alias
  search?: string;
  q?: string;    // Compatibility alias
  page?: number;
  limit?: number;
  sortBy?: "receivedAt" | "amount" | "createdAt" | "date";
  sortOrder?: "asc" | "desc";
}

export interface ExpenseQueryParams {
  fundId?: string;
  spentById?: string;
  startDate?: string;
  endDate?: string;
  from?: string; // Compatibility alias
  to?: string;   // Compatibility alias
  search?: string;
  q?: string;    // Compatibility alias
  page?: number;
  limit?: number;
  sortBy?: "spentAt" | "amount" | "createdAt" | "date";
  sortOrder?: "asc" | "desc";
}

export interface CreateFundPayload {
  name: string;
  category: FundCategory;
  isActive?: boolean;
}

export type UpdateFundPayload = Partial<CreateFundPayload>;

export interface CreateContributionPayload {
  fundId: string;
  amount: number;
  method: ReceiveMethod;
  receivedAt?: string;
  giverMemberId?: string | null;
  giverName?: string | null;
  reference?: string | null;
  note?: string | null;
  receivedById?: string;
}

export interface CreateExpensePayload {
  fundId: string;
  amount: number;
  spentOn: string;
  spentAt?: string;
  spentById?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
}

export interface FinanceMember {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  phone?: string | null;
  email?: string | null;
}

export interface MonthlyFlow {
  month: string;
  in: number;
  out: number;
}

export interface RecentActivityItem {
  id: string;
  type: "contribution" | "expense";
  date: string;
  amount: number;
  title: string;
  subtitle?: string;
  fundName: string;
  fundId: string;
  method?: ReceiveMethod;
  note?: string | null;
  reference?: string | null;
}

export interface FinanceOverview {
  totalRaised: number;
  totalSpent: number;
  totalRemaining: number;
  funds: Fund[];
  monthlyFlow: MonthlyFlow[];
  recentActivity: RecentActivityItem[];
}

// ---------------------------------------------------------------------------
// 2. Normalization Helpers
// ---------------------------------------------------------------------------

function normalizeCategory(cat?: string | null): FundCategory {
  const upper = String(cat ?? "").toUpperCase().trim();
  if (
    upper === "GPL" ||
    upper === "SPORTS" ||
    upper === "OWAJ" ||
    upper === "IFTER_MAHFIL" ||
    upper === "FOOTBALL" ||
    upper === "OTHERS"
  ) {
    return upper as FundCategory;
  }
  if (upper === "OWAG") return "OWAJ";
  if (upper === "MAINTENANCE" || upper === "OTHER") return "OTHERS";
  return "OTHERS";
}

export function normalizeFund(raw: Record<string, unknown>, idx = 0): Fund {
  const id = String(raw.id ?? raw._id ?? `fund-${idx + 1}`);
  const name = String(raw.name ?? "Club Fund");
  const category = normalizeCategory(raw.category as string);
  const isActive = raw.isActive !== false;
  const createdAt = String(raw.createdAt || new Date().toISOString());
  const updatedAt = String(raw.updatedAt || new Date().toISOString());

  const rawSummary = (raw.summary as Record<string, unknown> | undefined) || {};
  const totalCollected = Number(rawSummary.totalCollected ?? raw.totalIn ?? 0);
  const totalSpent = Number(rawSummary.totalSpent ?? raw.totalOut ?? 0);
  const balance = Number(rawSummary.balance ?? raw.remaining ?? totalCollected - totalSpent);
  const contributionsCount = Number(rawSummary.contributionsCount ?? 0);
  const expensesCount = Number(rawSummary.expensesCount ?? 0);

  const summary: FundSummary = {
    totalCollected,
    totalSpent,
    balance,
    contributionsCount,
    expensesCount,
    totalIn: totalCollected,
    totalOut: totalSpent,
    remaining: balance,
  };

  return {
    id,
    name,
    category,
    isActive,
    createdAt,
    updatedAt,
    summary,
    totalIn: totalCollected,
    totalOut: totalSpent,
    remaining: balance,
    description: (raw.description as string) || undefined,
  };
}

export function normalizeContribution(raw: Record<string, unknown>, idx = 0): Contribution {
  const id = String(raw.id ?? raw._id ?? `cnt-${idx + 1}`);
  const fundId = String(raw.fundId ?? "");
  const amount = Number(raw.amount ?? 0);
  const method = (String(raw.method ?? "CASH").toUpperCase() as ReceiveMethod) || "CASH";
  const receivedAt = String(raw.receivedAt || raw.createdAt || new Date().toISOString());
  const createdAt = String(raw.createdAt || receivedAt);
  const updatedAt = String(raw.updatedAt || createdAt);

  const fundObj = raw.fund as Record<string, unknown> | undefined;
  const giverMemberObj = raw.giverMember as Record<string, unknown> | undefined;
  const receivedByObj = raw.receivedBy as Record<string, unknown> | undefined;

  const fundName = String(raw.fundName ?? fundObj?.name ?? "Club Fund");
  const giverName =
    (raw.giverName as string) ||
    (giverMemberObj?.fullName as string) ||
    (giverMemberObj?.name as string) ||
    null;
  const giverMemberId = (raw.giverMemberId as string) || (giverMemberObj?.id as string) || null;
  const giverAvatar =
    (raw.giverAvatar as string) ||
    (giverMemberObj?.profileImage as string) ||
    (giverMemberObj?.avatar as string) ||
    null;
  const receivedById = String(raw.receivedById ?? receivedByObj?.id ?? "admin");
  const receivedByName = String(
    raw.receivedByName ?? receivedByObj?.fullName ?? receivedByObj?.name ?? "Admin"
  );
  const reference = (raw.reference as string) || null;
  const note = (raw.note as string) || null;

  return {
    id,
    fundId,
    amount,
    method,
    receivedAt,
    giverName,
    giverMemberId,
    receivedById,
    reference,
    note,
    createdAt,
    updatedAt,
    fund: fundObj
      ? {
          id: String(fundObj.id || fundId),
          name: String(fundObj.name || fundName),
          category: normalizeCategory(fundObj.category as string),
          isActive: fundObj.isActive !== false,
        }
      : undefined,
    giverMember: giverMemberObj
      ? {
          id: String(giverMemberObj.id || giverMemberId || ""),
          fullName: String(giverMemberObj.fullName || giverMemberObj.name || ""),
          email: String(giverMemberObj.email || ""),
          profileImage: giverAvatar,
          village: (giverMemberObj.village as string) || null,
        }
      : null,
    receivedBy: receivedByObj
      ? {
          id: String(receivedByObj.id || receivedById),
          fullName: String(receivedByObj.fullName || receivedByObj.name || receivedByName),
          email: String(receivedByObj.email || ""),
          role: String(receivedByObj.role || "ADMIN"),
        }
      : undefined,
    fundName,
    receivedByName,
    giverAvatar,
  };
}

export function normalizeExpense(raw: Record<string, unknown>, idx = 0): Expense {
  const id = String(raw.id ?? raw._id ?? `exp-${idx + 1}`);
  const fundId = String(raw.fundId ?? "");
  const amount = Number(raw.amount ?? 0);
  const spentOn = String(raw.spentOn ?? "Club Expenditure");
  const spentAt = String(raw.spentAt || raw.createdAt || new Date().toISOString());
  const createdAt = String(raw.createdAt || spentAt);
  const updatedAt = String(raw.updatedAt || createdAt);

  const fundObj = raw.fund as Record<string, unknown> | undefined;
  const spentByObj = raw.spentBy as Record<string, unknown> | undefined;

  const fundName = String(raw.fundName ?? fundObj?.name ?? "Club Fund");
  const spentById = (raw.spentById as string) || (spentByObj?.id as string) || null;
  const spentByName = String(
    raw.spentByName ?? spentByObj?.fullName ?? spentByObj?.name ?? "Admin"
  );
  const receiptUrl = (raw.receiptUrl as string) || null;
  const note = (raw.note as string) || null;

  return {
    id,
    fundId,
    amount,
    spentOn,
    spentAt,
    spentById,
    receiptUrl,
    note,
    createdAt,
    updatedAt,
    fund: fundObj
      ? {
          id: String(fundObj.id || fundId),
          name: String(fundObj.name || fundName),
          category: normalizeCategory(fundObj.category as string),
          isActive: fundObj.isActive !== false,
        }
      : undefined,
    spentBy: spentByObj
      ? {
          id: String(spentByObj.id || spentById || ""),
          fullName: String(spentByObj.fullName || spentByObj.name || spentByName),
          email: String(spentByObj.email || ""),
          role: String(spentByObj.role || "ADMIN"),
          profileImage: (spentByObj.profileImage as string) || null,
        }
      : null,
    fundName,
    spentByName,
  };
}

// ---------------------------------------------------------------------------
// 3. Fallback Initial Mock Store (for offline development)
// ---------------------------------------------------------------------------

const INITIAL_FUNDS: Fund[] = [
  normalizeFund({
    id: "fund-gpl-2026",
    name: "গোরান প্রিমিয়ার লীগ ২০২৬ (GPL Season 5)",
    category: "GPL",
    description: "ক্লাবের বার্ষিক ফ্ল্যাগশিপ ক্রিকেট টুর্নামেন্ট",
    isActive: true,
    summary: {
      totalCollected: 450000,
      totalSpent: 310000,
      balance: 140000,
      contributionsCount: 18,
      expensesCount: 12,
    },
  }),
  normalizeFund({
    id: "fund-owaj",
    name: "শীতবস্ত্র ও জরুরি চিকিৎসা সহায়তা",
    category: "OWAJ",
    description: "ওয়ান ওয়ার্ল্ড এইড গ্রুপ দুস্থ ও সামাজিক কল্যাণ তহবিল",
    isActive: true,
    summary: {
      totalCollected: 320000,
      totalSpent: 210000,
      balance: 110000,
      contributionsCount: 14,
      expensesCount: 8,
    },
  }),
  normalizeFund({
    id: "fund-sports",
    name: "বার্ষিক ক্রীড়া সরঞ্জাম ও টুর্নামেন্ট",
    category: "SPORTS",
    description: "ক্লাবের সামগ্রিক খেলাধুলা, ব্যাডমিন্টন ও ক্রীড়া সামগ্রী",
    isActive: true,
    summary: {
      totalCollected: 185000,
      totalSpent: 145000,
      balance: 40000,
      contributionsCount: 9,
      expensesCount: 6,
    },
  }),
  normalizeFund({
    id: "fund-football",
    name: "ক্লাব ফুটবল টিম ও অফিশিয়াল জার্সি",
    category: "FOOTBALL",
    description: "স্থানীয় ফুটবল লীগ দল ও প্র্যাকটিস কিটস",
    isActive: true,
    summary: {
      totalCollected: 220000,
      totalSpent: 215000,
      balance: 5000, // Low balance (<10%)
      contributionsCount: 11,
      expensesCount: 10,
    },
  }),
  normalizeFund({
    id: "fund-ifter",
    name: "পবিত্র মাহে রমজান ইফতার মাহফিল ২০২৬",
    category: "IFTER_MAHFIL",
    description: "ক্লাব সদস্য ও গ্রামবাসীর সম্মিলিত ইফতার আয়োজন",
    isActive: true,
    summary: {
      totalCollected: 95000,
      totalSpent: 62000,
      balance: 33000,
      contributionsCount: 8,
      expensesCount: 4,
    },
  }),
  normalizeFund({
    id: "fund-other",
    name: "সাধারণ আপৎকালীন ও বিবিধ তহবিল",
    category: "OTHERS",
    description: "জরুরি ক্লাব ফান্ড ও অন্যান্য আকস্মিক খরচ",
    isActive: true,
    summary: {
      totalCollected: 65000,
      totalSpent: 30000,
      balance: 35000,
      contributionsCount: 5,
      expensesCount: 3,
    },
  }),
];

const INITIAL_MEMBERS: FinanceMember[] = [
  { id: "usr-mahfuz", name: "Mahfojor Rahman (সভাপতি)", avatar: "/images/committee/mahfuz.png", role: "ADMIN" },
  { id: "usr-rakib", name: "Rakib Hasan (সিনিয়র সহ-সভাপতি)", avatar: "/images/committee/rakib.png", role: "ADMIN" },
  { id: "usr-rasel", name: "Rasel Shuvo (সিনিয়র সহ-সভাপতি)", avatar: "/images/committee/rasel.png", role: "ADMIN" },
  { id: "usr-mustakim", name: "Mostakim (সাধারণ সম্পাদক)", avatar: "/images/committee/mustakim.png", role: "ADMIN" },
  { id: "usr-sourav", name: "Rafioul Hasan Sourav (ডিজিটাল সিস্টেম)", avatar: "/images/committee/sourav.png", role: "SUPER_ADMIN" },
];

const STORAGE_KEY_FUNDS = "shanti_finance_funds";
const STORAGE_KEY_CONTRIBUTIONS = "shanti_finance_contributions";
const STORAGE_KEY_EXPENSES = "shanti_finance_expenses";

function getMockStore(): {
  funds: Fund[];
  contributions: Contribution[];
  expenses: Expense[];
} {
  if (typeof window === "undefined") {
    return {
      funds: INITIAL_FUNDS,
      contributions: [],
      expenses: [],
    };
  }

  let funds = INITIAL_FUNDS;
  let contributions: Contribution[] = [];
  let expenses: Expense[] = [];

  try {
    const storedFunds = localStorage.getItem(STORAGE_KEY_FUNDS);
    if (storedFunds) {
      const parsed = JSON.parse(storedFunds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        funds = parsed.map(normalizeFund);
      }
    }
  } catch {}

  try {
    const storedContributions = localStorage.getItem(STORAGE_KEY_CONTRIBUTIONS);
    if (storedContributions) {
      const parsed = JSON.parse(storedContributions);
      if (Array.isArray(parsed)) contributions = parsed.map(normalizeContribution);
    }
  } catch {}

  try {
    const storedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (storedExpenses) {
      const parsed = JSON.parse(storedExpenses);
      if (Array.isArray(parsed)) expenses = parsed.map(normalizeExpense);
    }
  } catch {}

  return { funds, contributions, expenses };
}

function saveMockStore(partial: {
  funds?: Fund[];
  contributions?: Contribution[];
  expenses?: Expense[];
}) {
  if (typeof window === "undefined") return;
  try {
    if (partial.funds) localStorage.setItem(STORAGE_KEY_FUNDS, JSON.stringify(partial.funds));
    if (partial.contributions) {
      localStorage.setItem(STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(partial.contributions));
    }
    if (partial.expenses) localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(partial.expenses));
  } catch {}
}

// ---------------------------------------------------------------------------
// 4. Funds API Methods (/api/v1/funds)
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/funds (Public)
 * List all funds with filters, pagination & balance summaries.
 */
export async function getFunds(params: FundQueryParams = {}): Promise<Fund[]> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category && params.category !== "ALL") query.set("category", params.category);
  if (typeof params.isActive === "boolean") query.set("isActive", String(params.isActive));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString() ? `?${query.toString()}` : "";

  // 1. Primary: GET /api/v1/funds
  try {
    const res = await fetchWithAuth(`/funds${qs}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const payload = json?.data?.funds ?? json?.data ?? json?.funds ?? json;
      if (Array.isArray(payload)) {
        return payload.map(normalizeFund);
      }
    }
  } catch {}

  // 2. Legacy fallback: /finance/funds
  try {
    const res = await fetchWithAuth(`/finance/funds${qs}`);
    if (res.ok) {
      const json = await res.json();
      const payload = json?.data ?? json;
      if (Array.isArray(payload)) {
        return payload.map(normalizeFund);
      }
    }
  } catch {}

  // 3. Fallback to local mock store
  let { funds } = getMockStore();
  if (params.category && params.category !== "ALL") {
    funds = funds.filter((f) => f.category === params.category);
  }
  if (typeof params.isActive === "boolean") {
    funds = funds.filter((f) => f.isActive === params.isActive);
  }
  if (params.search) {
    const q = params.search.toLowerCase().trim();
    funds = funds.filter((f) => f.name.toLowerCase().includes(q));
  }
  return funds;
}

/**
 * GET /api/v1/funds/:id (Public)
 * Get single fund details with financial summary.
 */
export async function getFundById(fundId: string): Promise<Fund | null> {
  try {
    const res = await fetchWithAuth(`/funds/${encodeURIComponent(fundId)}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const payload = json?.data?.fund ?? json?.data ?? json;
      if (payload && typeof payload === "object") {
        return normalizeFund(payload);
      }
    }
  } catch {}

  const funds = await getFunds();
  return funds.find((f) => f.id === fundId || f.name.toLowerCase() === fundId.toLowerCase()) ?? null;
}

/**
 * POST /api/v1/funds (Admin / Super Admin)
 * Create a new fund: { name, category, isActive }
 */
export async function createFund(
  nameOrPayload: string | CreateFundPayload,
  categoryInput?: string
): Promise<Fund> {
  const payload: CreateFundPayload =
    typeof nameOrPayload === "string"
      ? {
          name: nameOrPayload.trim(),
          category: normalizeCategory(categoryInput),
          isActive: true,
        }
      : {
          name: nameOrPayload.name.trim(),
          category: normalizeCategory(nameOrPayload.category),
          isActive: nameOrPayload.isActive !== false,
        };

  try {
    const res = await fetchWithAuth("/funds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.data?.fund ?? json?.data ?? json;
      return normalizeFund(raw);
    }
  } catch {}

  // Fallback to local mock store
  const { funds } = getMockStore();
  const id = `fund-${payload.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
  const newFund: Fund = normalizeFund({
    id,
    name: payload.name,
    category: payload.category,
    isActive: payload.isActive !== false,
    summary: {
      totalCollected: 0,
      totalSpent: 0,
      balance: 0,
      contributionsCount: 0,
      expensesCount: 0,
    },
  });

  saveMockStore({ funds: [...funds, newFund] });
  return newFund;
}

/**
 * PATCH /api/v1/funds/:id (Admin / Super Admin)
 * Update fund name, category, or active status.
 */
export async function updateFund(id: string, payload: UpdateFundPayload): Promise<Fund> {
  try {
    const res = await fetchWithAuth(`/funds/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.data?.fund ?? json?.data ?? json;
      return normalizeFund(raw);
    }
  } catch {}

  // Mock store update
  const { funds } = getMockStore();
  const updatedFunds = funds.map((f) => {
    if (f.id === id) {
      return normalizeFund({
        ...f,
        ...payload,
        name: payload.name ? payload.name.trim() : f.name,
        category: payload.category ? normalizeCategory(payload.category) : f.category,
        isActive: payload.isActive !== undefined ? payload.isActive : f.isActive,
      });
    }
    return f;
  });

  saveMockStore({ funds: updatedFunds });
  const updated = updatedFunds.find((f) => f.id === id);
  if (!updated) throw new Error("Fund not found");
  return updated;
}

/**
 * DELETE /api/v1/funds/:id (Admin / Super Admin)
 * Delete empty fund (rejects if fund has contributions/expenses).
 */
export async function deleteFund(id: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`/funds/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) return true;
    const json = await res.json().catch(() => null);
    if (json?.message) throw new Error(json.message);
  } catch (err: any) {
    if (err?.message) throw err;
  }

  const { funds } = getMockStore();
  const remainingFunds = funds.filter((f) => f.id !== id);
  saveMockStore({ funds: remainingFunds });
  return true;
}

/**
 * GET /api/v1/funds/:id/summary (Public)
 */
export async function getFundSummary(fundId: string): Promise<FundSummary> {
  try {
    const res = await fetchWithAuth(`/funds/${encodeURIComponent(fundId)}/summary`, {
      skipAuth: true,
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.data ?? json;
      const totalCollected = Number(raw.totalCollected ?? raw.totalIn ?? 0);
      const totalSpent = Number(raw.totalSpent ?? raw.totalOut ?? 0);
      const balance = Number(raw.balance ?? raw.remaining ?? totalCollected - totalSpent);
      return {
        totalCollected,
        totalSpent,
        balance,
        contributionsCount: Number(raw.contributionsCount ?? 0),
        expensesCount: Number(raw.expensesCount ?? 0),
        totalIn: totalCollected,
        totalOut: totalSpent,
        remaining: balance,
      };
    }
  } catch {}

  const fund = await getFundById(fundId);
  if (fund) return fund.summary;
  return {
    totalCollected: 0,
    totalSpent: 0,
    balance: 0,
    contributionsCount: 0,
    expensesCount: 0,
    totalIn: 0,
    totalOut: 0,
    remaining: 0,
  };
}

// ---------------------------------------------------------------------------
// 5. Contributions API Methods (/api/v1/contributions)
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/contributions (Public)
 * List contributions with filters, date range & total sum.
 */
export async function getContributions(
  params: ContributionQueryParams = {}
): Promise<PaginatedResponse<Contribution>> {
  const query = new URLSearchParams();
  if (params.fundId) query.set("fundId", params.fundId);
  if (params.giverMemberId) query.set("giverMemberId", params.giverMemberId);
  if (params.receivedById) query.set("receivedById", params.receivedById);
  if (params.method && params.method !== "ALL") query.set("method", params.method);

  const startDate = params.startDate || params.from;
  const endDate = params.endDate || params.to;
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);

  const search = params.search || params.q;
  if (search) query.set("search", search);

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const sortBy = params.sortBy === "date" ? "receivedAt" : params.sortBy;
  if (sortBy) query.set("sortBy", sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString() ? `?${query.toString()}` : "";

  // 1. Primary: GET /api/v1/contributions
  try {
    const res = await fetchWithAuth(`/contributions${qs}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.contributions ?? json?.data ?? json?.contributions;
      if (Array.isArray(list)) {
        const total = Number(json?.data?.meta?.total ?? json?.meta?.total ?? list.length);
        const limit = Number(params.limit || 10);
        return {
          data: list.map(normalizeContribution),
          total,
          page: Number(params.page || 1),
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          totalAmount: Number(json?.data?.totalAmount ?? json?.totalAmount ?? 0),
        };
      }
    }
  } catch {}

  // 2. Mock store fallback
  const { contributions } = getMockStore();
  let filtered = [...contributions];

  if (params.fundId) filtered = filtered.filter((c) => c.fundId === params.fundId);
  if (params.giverMemberId) filtered = filtered.filter((c) => c.giverMemberId === params.giverMemberId);
  if (params.method && params.method !== "ALL") filtered = filtered.filter((c) => c.method === params.method);

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.giverName?.toLowerCase().includes(q) ||
        c.reference?.toLowerCase().includes(q) ||
        c.note?.toLowerCase().includes(q) ||
        c.fundName.toLowerCase().includes(q) ||
        c.receivedByName.toLowerCase().includes(q)
    );
  }

  if (startDate) {
    const fromTime = new Date(startDate).getTime();
    filtered = filtered.filter((c) => new Date(c.receivedAt).getTime() >= fromTime);
  }
  if (endDate) {
    const toTime = new Date(endDate).getTime() + 86400000;
    filtered = filtered.filter((c) => new Date(c.receivedAt).getTime() <= toTime);
  }

  filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const total = filtered.length;
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);
  const totalAmount = filtered.reduce((acc, c) => acc + c.amount, 0);

  return { data, total, page, limit, totalPages, totalAmount };
}

/**
 * GET /api/v1/contributions/:id (Public)
 */
export async function getContributionById(id: string): Promise<Contribution | null> {
  try {
    const res = await fetchWithAuth(`/contributions/${encodeURIComponent(id)}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const payload = json?.data?.contribution ?? json?.data ?? json;
      return normalizeContribution(payload);
    }
  } catch {}

  const { contributions } = getMockStore();
  return contributions.find((c) => c.id === id) ?? null;
}

/**
 * POST /api/v1/contributions (Admin / Super Admin / Moderator)
 * Record new contribution/donation.
 */
export async function createContribution(
  payload: CreateContributionPayload
): Promise<Contribution> {
  try {
    const res = await fetchWithAuth("/contributions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.data?.contribution ?? json?.data ?? json;
      return normalizeContribution(raw);
    }
  } catch {}

  // Mock store
  const { funds, contributions } = getMockStore();
  const fund = funds.find((f) => f.id === payload.fundId);
  const fundName = fund?.name || "Fund";
  const receiver = INITIAL_MEMBERS.find((m) => m.id === payload.receivedById);
  const giver = payload.giverMemberId
    ? INITIAL_MEMBERS.find((m) => m.id === payload.giverMemberId)
    : null;

  const newContribution = normalizeContribution({
    id: `cnt-${Date.now()}`,
    fundId: payload.fundId,
    fundName,
    amount: Math.round(Number(payload.amount)),
    method: payload.method,
    receivedAt: payload.receivedAt || new Date().toISOString(),
    receivedById: payload.receivedById || "admin",
    receivedByName: receiver?.name || "Admin",
    giverMemberId: payload.giverMemberId || null,
    giverName: payload.giverName || giver?.name || "Club Member",
    giverAvatar: giver?.avatar || null,
    reference: payload.reference || null,
    note: payload.note || null,
    createdAt: new Date().toISOString(),
  });

  const updatedContributions = [newContribution, ...contributions];
  const updatedFunds = funds.map((f) => {
    if (f.id === payload.fundId) {
      const nextIn = f.totalIn + newContribution.amount;
      const nextRemaining = nextIn - f.totalOut;
      return normalizeFund({
        ...f,
        totalIn: nextIn,
        remaining: nextRemaining,
        summary: {
          ...f.summary,
          totalCollected: nextIn,
          balance: nextRemaining,
          contributionsCount: (f.summary.contributionsCount || 0) + 1,
        },
      });
    }
    return f;
  });

  saveMockStore({ funds: updatedFunds, contributions: updatedContributions });
  return newContribution;
}

/**
 * PATCH /api/v1/contributions/:id (Admin / Super Admin)
 */
export async function updateContribution(
  id: string,
  payload: Partial<CreateContributionPayload>
): Promise<Contribution> {
  try {
    const res = await fetchWithAuth(`/contributions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return normalizeContribution(json?.data?.contribution ?? json?.data ?? json);
    }
    const json = await res.json().catch(() => null);
    if (json?.message) throw new Error(json.message);
  } catch (err: any) {
    if (err?.message) throw err;
  }

  const { contributions } = getMockStore();
  const updatedList = contributions.map((c) =>
    c.id === id ? normalizeContribution({ ...c, ...payload }) : c
  );
  saveMockStore({ contributions: updatedList });
  const found = updatedList.find((c) => c.id === id);
  if (!found) throw new Error("Contribution not found");
  return found;
}

/**
 * DELETE /api/v1/contributions/:id (Admin / Super Admin)
 */
export async function deleteContribution(id: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`/contributions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) return true;
    const json = await res.json().catch(() => null);
    if (json?.message) throw new Error(json.message);
  } catch (err: any) {
    if (err?.message) throw err;
  }

  const { contributions } = getMockStore();
  saveMockStore({ contributions: contributions.filter((c) => c.id !== id) });
  return true;
}

// ---------------------------------------------------------------------------
// 6. Expenses API Methods (/api/v1/expenses)
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/expenses (Public)
 * List expenditures with filters, date range & total sum.
 */
export async function getExpenses(
  params: ExpenseQueryParams = {}
): Promise<PaginatedResponse<Expense>> {
  const query = new URLSearchParams();
  if (params.fundId) query.set("fundId", params.fundId);
  if (params.spentById) query.set("spentById", params.spentById);

  const startDate = params.startDate || params.from;
  const endDate = params.endDate || params.to;
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);

  const search = params.search || params.q;
  if (search) query.set("search", search);

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const sortBy = params.sortBy === "date" ? "spentAt" : params.sortBy;
  if (sortBy) query.set("sortBy", sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString() ? `?${query.toString()}` : "";

  // 1. Primary: GET /api/v1/expenses
  try {
    const res = await fetchWithAuth(`/expenses${qs}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.expenses ?? json?.data ?? json?.expenses;
      if (Array.isArray(list)) {
        const total = Number(json?.data?.meta?.total ?? json?.meta?.total ?? list.length);
        const limit = Number(params.limit || 10);
        return {
          data: list.map(normalizeExpense),
          total,
          page: Number(params.page || 1),
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          totalAmount: Number(json?.data?.totalAmount ?? json?.totalAmount ?? 0),
        };
      }
    }
  } catch {}

  // 2. Mock store fallback
  const { expenses } = getMockStore();
  let filtered = [...expenses];

  if (params.fundId) filtered = filtered.filter((e) => e.fundId === params.fundId);
  if (params.spentById) filtered = filtered.filter((e) => e.spentById === params.spentById);

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.spentOn.toLowerCase().includes(q) ||
        e.note?.toLowerCase().includes(q) ||
        e.fundName.toLowerCase().includes(q) ||
        e.spentByName?.toLowerCase().includes(q)
    );
  }

  if (startDate) {
    const fromTime = new Date(startDate).getTime();
    filtered = filtered.filter((e) => new Date(e.spentAt).getTime() >= fromTime);
  }
  if (endDate) {
    const toTime = new Date(endDate).getTime() + 86400000;
    filtered = filtered.filter((e) => new Date(e.spentAt).getTime() <= toTime);
  }

  filtered.sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime());

  const total = filtered.length;
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);
  const totalAmount = filtered.reduce((acc, e) => acc + e.amount, 0);

  return { data, total, page, limit, totalPages, totalAmount };
}

/**
 * GET /api/v1/expenses/:id (Public)
 */
export async function getExpenseById(id: string): Promise<Expense | null> {
  try {
    const res = await fetchWithAuth(`/expenses/${encodeURIComponent(id)}`, { skipAuth: true });
    if (res.ok) {
      const json = await res.json();
      const payload = json?.data?.expense ?? json?.data ?? json;
      return normalizeExpense(payload);
    }
  } catch {}

  const { expenses } = getMockStore();
  return expenses.find((e) => e.id === id) ?? null;
}

/**
 * POST /api/v1/expenses (Admin / Super Admin)
 * Record new expenditure. Deducts from fund remaining balance.
 */
export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  try {
    const res = await fetchWithAuth("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.data?.expense ?? json?.data ?? json;
      return normalizeExpense(raw);
    }
  } catch {}

  const { funds, expenses } = getMockStore();
  const fund = funds.find((f) => f.id === payload.fundId);
  const fundName = fund?.name || "Fund";
  const handler = payload.spentById
    ? INITIAL_MEMBERS.find((m) => m.id === payload.spentById)
    : null;

  const newExpense = normalizeExpense({
    id: `exp-${Date.now()}`,
    fundId: payload.fundId,
    fundName,
    amount: Math.round(Number(payload.amount)),
    spentAt: payload.spentAt || new Date().toISOString(),
    spentOn: payload.spentOn,
    spentById: payload.spentById || null,
    spentByName: handler?.name || "Admin",
    note: payload.note || null,
    receiptUrl: payload.receiptUrl || null,
    createdAt: new Date().toISOString(),
  });

  const updatedExpenses = [newExpense, ...expenses];
  const updatedFunds = funds.map((f) => {
    if (f.id === payload.fundId) {
      const nextOut = f.totalOut + newExpense.amount;
      const nextRemaining = f.totalIn - nextOut;
      return normalizeFund({
        ...f,
        totalOut: nextOut,
        remaining: nextRemaining,
        summary: {
          ...f.summary,
          totalSpent: nextOut,
          balance: nextRemaining,
          expensesCount: (f.summary.expensesCount || 0) + 1,
        },
      });
    }
    return f;
  });

  saveMockStore({ funds: updatedFunds, expenses: updatedExpenses });
  return newExpense;
}

/**
 * PATCH /api/v1/expenses/:id (Admin / Super Admin)
 */
export async function updateExpense(
  id: string,
  payload: Partial<CreateExpensePayload>
): Promise<Expense> {
  try {
    const res = await fetchWithAuth(`/expenses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return normalizeExpense(json?.data?.expense ?? json?.data ?? json);
    }
    const json = await res.json().catch(() => null);
    if (json?.message) throw new Error(json.message);
  } catch (err: any) {
    if (err?.message) throw err;
  }

  const { expenses } = getMockStore();
  const updatedList = expenses.map((e) =>
    e.id === id ? normalizeExpense({ ...e, ...payload }) : e
  );
  saveMockStore({ expenses: updatedList });
  const found = updatedList.find((e) => e.id === id);
  if (!found) throw new Error("Expense not found");
  return found;
}

/**
 * DELETE /api/v1/expenses/:id (Admin / Super Admin)
 */
export async function deleteExpense(id: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`/expenses/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) return true;
    const json = await res.json().catch(() => null);
    if (json?.message) throw new Error(json.message);
  } catch (err: any) {
    if (err?.message) throw err;
  }

  const { expenses } = getMockStore();
  saveMockStore({ expenses: expenses.filter((e) => e.id !== id) });
  return true;
}

// ---------------------------------------------------------------------------
// 7. Member Combobox & Finance Overview
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/members?search=
 * Search members for contribution giver / receiver comboboxes.
 */
export async function searchFinanceMembers(query = ""): Promise<FinanceMember[]> {
  try {
    const res = await fetchWithAuth(`/members?search=${encodeURIComponent(query)}`, {
      skipAuth: true,
    });
    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.members ?? json?.data ?? json?.members ?? json;
      if (Array.isArray(list)) {
        return list.map((m: Record<string, unknown>, idx: number) => ({
          id: String(m.id || m._id || `mem-${idx}`),
          name: String(m.fullName || m.name || m.nameEn || m.nameBn || "Member"),
          avatar:
            typeof m.profileImage === "string"
              ? m.profileImage
              : typeof m.image === "string"
              ? m.image
              : null,
          role: typeof m.role === "string" ? m.role : undefined,
          phone: typeof m.phoneNumber === "string" ? m.phoneNumber : null,
          email: typeof m.email === "string" ? m.email : null,
        }));
      }
    }
  } catch {}

  const q = query.toLowerCase().trim();
  if (!q) return INITIAL_MEMBERS;
  return INITIAL_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.role?.toLowerCase().includes(q)
  );
}

/**
 * Aggregated finance overview for dashboard stat cards, charts, and activity.
 */
export async function getFinanceOverview(): Promise<FinanceOverview> {
  const funds = await getFunds();

  let totalRaised = 0;
  let totalSpent = 0;
  funds.forEach((f) => {
    totalRaised += f.totalIn;
    totalSpent += f.totalOut;
  });
  const totalRemaining = totalRaised - totalSpent;

  const monthlyFlow: MonthlyFlow[] = [
    { month: "Jun", in: 140000, out: 95000 },
    { month: "Jul", in: 190000, out: 130000 },
    { month: "Aug", in: 165000, out: 145000 },
    { month: "Sep", in: 220000, out: 180000 },
    { month: "Oct", in: 280000, out: 210000 },
    { month: "Nov", in: 240000, out: 172000 },
  ];

  const { data: contributions } = await getContributions({ limit: 10 });
  const { data: expenses } = await getExpenses({ limit: 10 });

  const recentActivity: RecentActivityItem[] = [
    ...contributions.map((c) => ({
      id: c.id,
      type: "contribution" as const,
      date: c.receivedAt,
      amount: c.amount,
      title: c.giverName ? `Contribution from ${c.giverName}` : "Club Member Contribution",
      subtitle: c.reference ? `Ref: ${c.reference}` : c.note || undefined,
      fundName: c.fundName,
      fundId: c.fundId,
      method: c.method,
      note: c.note,
      reference: c.reference,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      date: e.spentAt,
      amount: e.amount,
      title: e.spentOn,
      subtitle: e.spentByName ? `Handled by ${e.spentByName}` : e.note || undefined,
      fundName: e.fundName,
      fundId: e.fundId,
      note: e.note,
    })),
  ];

  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top8Activity = recentActivity.slice(0, 8);

  return {
    totalRaised,
    totalSpent,
    totalRemaining,
    funds,
    monthlyFlow,
    recentActivity: top8Activity,
  };
}
