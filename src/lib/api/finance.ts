/**
 * Finance API Client (`/finance`)
 *
 * Implements full typed contracts for NestJS finance module:
 * - GET  /finance/funds                      -> [{ id, name, isActive, totalIn, totalOut, remaining }]
 * - POST /finance/funds                      { name }
 * - GET  /finance/funds/:id/summary          -> { totalIn, totalOut, remaining }
 * - GET  /finance/contributions?fundId&from&to&method&q&page&limit
 * - POST /finance/contributions              { fundId, amount, method, receivedAt, receivedById, giverMemberId?, giverName?, note?, reference? }
 * - GET  /finance/expenses?fundId&from&to&q&page&limit
 * - POST /finance/expenses                   { fundId, amount, spentAt, spentOn, spentById?, note?, receiptUrl? }
 * - GET  /members?search=                    (for member pickers)
 *
 * Falls back to an in-memory & localStorage mock store with realistic club funds
 * (GPL, OWAG, SPORTS, FOOTBALL, MAINTENANCE, OTHER) if endpoints return 404/offline.
 */

import { fetchWithAuth } from "@/lib/api";
import type { PaymentMethod } from "@/lib/schemas/finance";

export interface Fund {
  id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  totalIn: number;
  totalOut: number;
  remaining: number;
}

export interface FundSummary {
  totalIn: number;
  totalOut: number;
  remaining: number;
}

export interface Contribution {
  id: string;
  fundId: string;
  fundName: string;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  receivedById: string;
  receivedByName: string;
  giverMemberId?: string | null;
  giverName?: string | null;
  giverAvatar?: string | null;
  note?: string | null;
  reference?: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  fundId: string;
  fundName: string;
  amount: number;
  spentAt: string;
  spentOn: string;
  spentById?: string | null;
  spentByName?: string | null;
  note?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContributionQueryParams {
  fundId?: string;
  from?: string;
  to?: string;
  method?: PaymentMethod | "ALL";
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface ExpenseQueryParams {
  fundId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface CreateContributionPayload {
  fundId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  receivedById: string;
  giverMemberId?: string | null;
  giverName?: string | null;
  note?: string | null;
  reference?: string | null;
}

export interface CreateExpensePayload {
  fundId: string;
  amount: number;
  spentAt: string;
  spentOn: string;
  spentById?: string | null;
  note?: string | null;
  receiptUrl?: string | null;
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
  method?: PaymentMethod;
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

// --------------------------------------------------------------------------
// Default In-Memory / LocalStorage Mock Seed Data (TODO: Replace with NestJS)
// --------------------------------------------------------------------------
const INITIAL_FUNDS: Fund[] = [
  {
    id: "fund-gpl",
    name: "গোরান প্রিমিয়ার লীগ ২০২৬ (GPL Season 5)",
    category: "GPL",
    description: "ক্লাব প্রিমিয়ার ক্রিকেট ও শর্টপিচ টুর্নামেন্ট",
    isActive: true,
    totalIn: 450000,
    totalOut: 380000,
    remaining: 70000,
  },
  {
    id: "fund-owag",
    name: "শীতবস্ত্র ও জরুরি চিকিৎসা সহায়তা",
    category: "OWAG",
    description: "ওয়ান ওয়ার্ল্ড এইড গ্রুপ দুস্থ ও সামাজিক কল্যাণ তহবিল",
    isActive: true,
    totalIn: 320000,
    totalOut: 210000,
    remaining: 110000,
  },
  {
    id: "fund-sports",
    name: "বার্ষিক ক্রীড়া সরঞ্জাম ও টুর্নামেন্ট",
    category: "SPORTS",
    description: "ক্লাবের সামগ্রিক খেলাধুলা, ব্যাডমিন্টন ও ক্রীড়া সামগ্রী",
    isActive: true,
    totalIn: 185000,
    totalOut: 145000,
    remaining: 40000,
  },
  {
    id: "fund-football",
    name: "ক্লাব ফুটবল টিম ও অফিশিয়াল জার্সি",
    category: "FOOTBALL",
    description: "স্থানীয় ফুটবল লীগ দল ও প্র্যাকটিস কিটস",
    isActive: true,
    totalIn: 220000,
    totalOut: 215000,
    remaining: 5000, // Low balance (<10%)
  },
  {
    id: "fund-maintenance",
    name: "ক্লাব ভবন সংস্কার ও বৈদ্যুতিক কাজ",
    category: "MAINTENANCE",
    description: "ক্লাব ঘর মেরামত, পেইন্টিং ও পানি-বিদ্যুৎ ব্যবস্থাপনা",
    isActive: true,
    totalIn: 95000,
    totalOut: 62000,
    remaining: 33000,
  },
  {
    id: "fund-other",
    name: "সাধারণ আপৎকালীন ও বিবিধ তহবিল",
    category: "OTHER",
    description: "জরুরি ক্লাব ফান্ড ও অন্যান্য আকস্মিক খরচ",
    isActive: true,
    totalIn: 65000,
    totalOut: 30000,
    remaining: 35000,
  },
];

const INITIAL_MEMBERS: FinanceMember[] = [
  { id: "mem-1", name: "Rafioul Hasan (Sourav)", role: "Super Admin", phone: "+880 1712-000001", avatar: "/admin/sourav.jpg" },
  { id: "mem-2", name: "Tanvir Ahmed", role: "General Secretary", phone: "+880 1712-000002" },
  { id: "mem-3", name: "Mahmudul Hasan", role: "Treasurer", phone: "+880 1823-000003" },
  { id: "mem-4", name: "Shakil Hossain", role: "Sports Secretary", phone: "+880 1934-000004" },
  { id: "mem-5", name: "Nazmul Islam", role: "Executive Member", phone: "+880 1612-000005" },
  { id: "mem-6", name: "Farhan Kabir", role: "Club Member", phone: "+880 1512-000006" },
  { id: "mem-7", name: "Arifur Rahman", role: "Club Member", phone: "+880 1755-000007" },
];

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: "cnt-1",
    fundId: "fund-gpl",
    fundName: "GPL",
    amount: 50000,
    method: "BKASH",
    receivedAt: "2026-11-20T10:30:00Z",
    receivedById: "mem-1",
    receivedByName: "Rafioul Hasan",
    giverMemberId: "mem-2",
    giverName: "Tanvir Ahmed",
    giverAvatar: null,
    reference: "TRX-BK987421",
    note: "Tournament team registration entry fee",
    createdAt: "2026-11-20T10:30:00Z",
  },
  {
    id: "cnt-2",
    fundId: "fund-owag",
    fundName: "OWAG",
    amount: 25000,
    method: "BANK",
    receivedAt: "2026-11-18T14:15:00Z",
    receivedById: "mem-3",
    receivedByName: "Mahmudul Hasan",
    giverMemberId: null,
    giverName: "Dr. K. M. Rahman",
    reference: "CHQ-882910",
    note: "Winter blanket distribution sponsorship",
    createdAt: "2026-11-18T14:15:00Z",
  },
  {
    id: "cnt-3",
    fundId: "fund-sports",
    fundName: "SPORTS",
    amount: 15000,
    method: "NAGAD",
    receivedAt: "2026-11-15T11:00:00Z",
    receivedById: "mem-1",
    receivedByName: "Rafioul Hasan",
    giverMemberId: "mem-4",
    giverName: "Shakil Hossain",
    reference: "TRX-NG3341",
    note: "Monthly sports quota contribution",
    createdAt: "2026-11-15T11:00:00Z",
  },
  {
    id: "cnt-4",
    fundId: "fund-football",
    fundName: "FOOTBALL",
    amount: 20000,
    method: "CASH",
    receivedAt: "2026-11-12T16:00:00Z",
    receivedById: "mem-3",
    receivedByName: "Mahmudul Hasan",
    giverMemberId: "mem-5",
    giverName: "Nazmul Islam",
    reference: null,
    note: "Friendly match jersey fund",
    createdAt: "2026-11-12T16:00:00Z",
  },
  {
    id: "cnt-5",
    fundId: "fund-maintenance",
    fundName: "MAINTENANCE",
    amount: 10000,
    method: "BKASH",
    receivedAt: "2026-11-08T09:45:00Z",
    receivedById: "mem-1",
    receivedByName: "Rafioul Hasan",
    giverMemberId: "mem-6",
    giverName: "Farhan Kabir",
    reference: "TRX-BK11299",
    note: "Clubhouse electricity and lighting renovation",
    createdAt: "2026-11-08T09:45:00Z",
  },
  {
    id: "cnt-6",
    fundId: "fund-gpl",
    fundName: "GPL",
    amount: 35000,
    method: "BANK",
    receivedAt: "2026-10-25T11:30:00Z",
    receivedById: "mem-3",
    receivedByName: "Mahmudul Hasan",
    giverMemberId: null,
    giverName: "Apex Motors Ltd",
    reference: "EFT-88390",
    note: "GPL 2026 Banner Sponsor",
    createdAt: "2026-10-25T11:30:00Z",
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    fundId: "fund-football",
    fundName: "FOOTBALL",
    amount: 18000,
    spentAt: "2026-11-19T17:00:00Z",
    spentOn: "Official match jerseys and bibs",
    spentById: "mem-4",
    spentByName: "Shakil Hossain",
    note: "Purchased from Stadium Market Shop #12",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    createdAt: "2026-11-19T17:00:00Z",
  },
  {
    id: "exp-2",
    fundId: "fund-gpl",
    fundName: "GPL",
    amount: 42000,
    spentAt: "2026-11-16T15:30:00Z",
    spentOn: "Trophies and player medals package",
    spentById: "mem-2",
    spentByName: "Tanvir Ahmed",
    note: "Champion trophy, runner-up, man of the match awards",
    receiptUrl: null,
    createdAt: "2026-11-16T15:30:00Z",
  },
  {
    id: "exp-3",
    fundId: "fund-maintenance",
    fundName: "MAINTENANCE",
    amount: 8500,
    spentAt: "2026-11-11T12:00:00Z",
    spentOn: "Water pump repairs & plumbing fixtures",
    spentById: "mem-1",
    spentByName: "Rafioul Hasan",
    note: "Repaired main motor pump at clubhouse",
    receiptUrl: null,
    createdAt: "2026-11-11T12:00:00Z",
  },
  {
    id: "exp-4",
    fundId: "fund-owag",
    fundName: "OWAG",
    amount: 30000,
    spentAt: "2026-11-05T10:00:00Z",
    spentOn: "Medical emergency aid for local village resident",
    spentById: "mem-3",
    spentByName: "Mahmudul Hasan",
    note: "Approved by committee resolution #14",
    receiptUrl: null,
    createdAt: "2026-11-05T10:00:00Z",
  },
];

// Helper to access / sync local mock store
const STORAGE_KEY_FUNDS = "shanti_finance_funds";
const STORAGE_KEY_CONTRIBUTIONS = "shanti_finance_contributions";
const STORAGE_KEY_EXPENSES = "shanti_finance_expenses";

function normalizeStoredFund(raw: any): Fund {
  const defaultPresets: Record<string, { name: string; category: string }> = {
    GPL: { name: "গোরান প্রিমিয়ার লীগ ২০২৬ (GPL Season 5)", category: "GPL" },
    OWAG: { name: "শীতবস্ত্র ও জরুরি চিকিৎসা সহায়তা", category: "OWAG" },
    SPORTS: { name: "বার্ষিক ক্রীড়া সরঞ্জাম ও টুর্নামেন্ট", category: "SPORTS" },
    FOOTBALL: { name: "ক্লাব ফুটবল টিম ও অফিশিয়াল জার্সি", category: "FOOTBALL" },
    MAINTENANCE: { name: "ক্লাব ভবন সংস্কার ও বৈদ্যুতিক কাজ", category: "MAINTENANCE" },
    OTHER: { name: "সাধারণ আপৎকালীন ও বিবিধ তহবিল", category: "OTHER" },
  };

  const rawName = String(raw.name || "").trim();
  const upper = rawName.toUpperCase();
  const preset = defaultPresets[upper];

  const category = (raw.category || preset?.category || "OTHER").toUpperCase();
  const name = preset ? preset.name : (raw.name || "Club Fund");

  return {
    ...raw,
    name,
    category,
  };
}

function getMockStore(): {
  funds: Fund[];
  contributions: Contribution[];
  expenses: Expense[];
} {
  if (typeof window === "undefined") {
    return {
      funds: [...INITIAL_FUNDS],
      contributions: [...INITIAL_CONTRIBUTIONS],
      expenses: [...INITIAL_EXPENSES],
    };
  }

  let funds = INITIAL_FUNDS;
  let contributions = INITIAL_CONTRIBUTIONS;
  let expenses = INITIAL_EXPENSES;

  try {
    const storedFunds = localStorage.getItem(STORAGE_KEY_FUNDS);
    if (storedFunds) {
      const parsed = JSON.parse(storedFunds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        funds = parsed.map(normalizeStoredFund);
      }
    }
  } catch {}

  try {
    const storedCnt = localStorage.getItem(STORAGE_KEY_CONTRIBUTIONS);
    if (storedCnt) contributions = JSON.parse(storedCnt);
  } catch {}

  try {
    const storedExp = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (storedExp) expenses = JSON.parse(storedExp);
  } catch {}

  return { funds, contributions, expenses };
}

function saveMockStore(data: {
  funds?: Fund[];
  contributions?: Contribution[];
  expenses?: Expense[];
}) {
  if (typeof window === "undefined") return;
  try {
    if (data.funds) localStorage.setItem(STORAGE_KEY_FUNDS, JSON.stringify(data.funds));
    if (data.contributions) localStorage.setItem(STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(data.contributions));
    if (data.expenses) localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(data.expenses));
  } catch {}
}

// --------------------------------------------------------------------------
// API Fetchers with Graceful Fallback
// --------------------------------------------------------------------------

/**
 * GET /finance/funds
 * Returns all active club funds with totals and remaining balances.
 */
export async function getFunds(): Promise<Fund[]> {
  // TODO: Real backend integration at GET /api/v1/finance/funds
  try {
    const res = await fetchWithAuth("/finance/funds");
    if (res.ok) {
      const json = await res.json();
      const list = json?.data ?? json;
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}

  // Fallback to local mock store
  const { funds } = getMockStore();
  return funds;
}

/**
 * POST /finance/funds
 * Create a new fund.
 */
export async function createFund(name: string, category: string = "OTHER"): Promise<Fund> {
  // TODO: Real backend integration at POST /api/v1/finance/funds
  try {
    const res = await fetchWithAuth("/finance/funds", {
      method: "POST",
      body: JSON.stringify({ name, category }),
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data ?? json;
    }
  } catch {}

  const { funds } = getMockStore();
  const id = `fund-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
  const newFund: Fund = {
    id,
    name: name.trim(),
    category: (category || "OTHER").toUpperCase().trim(),
    isActive: true,
    totalIn: 0,
    totalOut: 0,
    remaining: 0,
  };
  const updatedFunds = [...funds, newFund];
  saveMockStore({ funds: updatedFunds });
  return newFund;
}

/**
 * GET /finance/funds/:id/summary
 * Returns totalIn, totalOut, remaining for a single fund.
 */
export async function getFundSummary(fundId: string): Promise<FundSummary> {
  // TODO: Real backend integration at GET /api/v1/finance/funds/:id/summary
  try {
    const res = await fetchWithAuth(`/finance/funds/${fundId}/summary`);
    if (res.ok) {
      const json = await res.json();
      return json?.data ?? json;
    }
  } catch {}

  const { funds } = getMockStore();
  const found = funds.find((f) => f.id === fundId || f.name.toLowerCase() === fundId.toLowerCase());
  if (found) {
    return {
      totalIn: found.totalIn,
      totalOut: found.totalOut,
      remaining: found.remaining,
    };
  }
  return { totalIn: 0, totalOut: 0, remaining: 0 };
}

/**
 * GET single fund by ID or Name
 */
export async function getFundById(fundId: string): Promise<Fund | null> {
  const funds = await getFunds();
  return funds.find((f) => f.id === fundId || f.name.toLowerCase() === fundId.toLowerCase()) ?? null;
}

/**
 * GET /finance/contributions
 * Paginated and filterable list of contributions.
 */
export async function getContributions(
  params: ContributionQueryParams = {}
): Promise<PaginatedResponse<Contribution>> {
  // TODO: Real backend integration at GET /api/v1/finance/contributions
  const query = new URLSearchParams();
  if (params.fundId) query.set("fundId", params.fundId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.method && params.method !== "ALL") query.set("method", params.method);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  try {
    const res = await fetchWithAuth(`/finance/contributions?${query.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) return json;
      if (Array.isArray(json)) {
        return {
          data: json,
          total: json.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(json.length / (params.limit || 10)),
        };
      }
    }
  } catch {}

  // Filter local mock contributions
  const { contributions } = getMockStore();
  let filtered = [...contributions];

  if (params.fundId) {
    filtered = filtered.filter((c) => c.fundId === params.fundId);
  }
  if (params.method && params.method !== "ALL") {
    filtered = filtered.filter((c) => c.method === params.method);
  }
  if (params.q && params.q.trim()) {
    const q = params.q.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.giverName?.toLowerCase().includes(q) ||
        c.reference?.toLowerCase().includes(q) ||
        c.note?.toLowerCase().includes(q) ||
        c.fundName.toLowerCase().includes(q) ||
        c.receivedByName.toLowerCase().includes(q)
    );
  }
  if (params.from) {
    const fromTime = new Date(params.from).getTime();
    filtered = filtered.filter((c) => new Date(c.receivedAt).getTime() >= fromTime);
  }
  if (params.to) {
    const toTime = new Date(params.to).getTime() + 86400000; // End of day
    filtered = filtered.filter((c) => new Date(c.receivedAt).getTime() <= toTime);
  }

  // Sort by date desc
  filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return { data, total, page, limit, totalPages };
}

/**
 * POST /finance/contributions
 * Add a new contribution. Updates fund remaining balance.
 */
export async function createContribution(
  payload: CreateContributionPayload
): Promise<Contribution> {
  // TODO: Real backend integration at POST /api/v1/finance/contributions
  try {
    const res = await fetchWithAuth("/finance/contributions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data ?? json;
    }
  } catch {}

  const { funds, contributions } = getMockStore();
  const fund = funds.find((f) => f.id === payload.fundId);
  const fundName = fund?.name || "OTHER";

  const members = INITIAL_MEMBERS;
  const receiver = members.find((m) => m.id === payload.receivedById);
  const giver = payload.giverMemberId ? members.find((m) => m.id === payload.giverMemberId) : null;

  const newContribution: Contribution = {
    id: `cnt-${Date.now()}`,
    fundId: payload.fundId,
    fundName,
    amount: Math.round(Number(payload.amount)),
    method: payload.method,
    receivedAt: payload.receivedAt || new Date().toISOString(),
    receivedById: payload.receivedById,
    receivedByName: receiver?.name || "Admin",
    giverMemberId: payload.giverMemberId || null,
    giverName: payload.giverName || giver?.name || "Anonymous Member",
    giverAvatar: giver?.avatar || null,
    reference: payload.reference || null,
    note: payload.note || null,
    createdAt: new Date().toISOString(),
  };

  const updatedContributions = [newContribution, ...contributions];

  // Update fund totals
  const updatedFunds = funds.map((f) => {
    if (f.id === payload.fundId) {
      const nextIn = f.totalIn + newContribution.amount;
      const nextRemaining = nextIn - f.totalOut;
      return { ...f, totalIn: nextIn, remaining: nextRemaining };
    }
    return f;
  });

  saveMockStore({ funds: updatedFunds, contributions: updatedContributions });
  return newContribution;
}

/**
 * GET /finance/expenses
 * Paginated and filterable list of expenses.
 */
export async function getExpenses(
  params: ExpenseQueryParams = {}
): Promise<PaginatedResponse<Expense>> {
  // TODO: Real backend integration at GET /api/v1/finance/expenses
  const query = new URLSearchParams();
  if (params.fundId) query.set("fundId", params.fundId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  try {
    const res = await fetchWithAuth(`/finance/expenses?${query.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) return json;
      if (Array.isArray(json)) {
        return {
          data: json,
          total: json.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(json.length / (params.limit || 10)),
        };
      }
    }
  } catch {}

  const { expenses } = getMockStore();
  let filtered = [...expenses];

  if (params.fundId) {
    filtered = filtered.filter((e) => e.fundId === params.fundId);
  }
  if (params.q && params.q.trim()) {
    const q = params.q.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.spentOn.toLowerCase().includes(q) ||
        e.note?.toLowerCase().includes(q) ||
        e.fundName.toLowerCase().includes(q) ||
        e.spentByName?.toLowerCase().includes(q)
    );
  }
  if (params.from) {
    const fromTime = new Date(params.from).getTime();
    filtered = filtered.filter((e) => new Date(e.spentAt).getTime() >= fromTime);
  }
  if (params.to) {
    const toTime = new Date(params.to).getTime() + 86400000;
    filtered = filtered.filter((e) => new Date(e.spentAt).getTime() <= toTime);
  }

  filtered.sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime());

  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  return { data, total, page, limit, totalPages };
}

/**
 * POST /finance/expenses
 * Add a new expense. Deducts from fund remaining balance.
 */
export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense> {
  // TODO: Real backend integration at POST /api/v1/finance/expenses
  try {
    const res = await fetchWithAuth("/finance/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data ?? json;
    }
  } catch {}

  const { funds, expenses } = getMockStore();
  const fund = funds.find((f) => f.id === payload.fundId);
  const fundName = fund?.name || "OTHER";

  const members = INITIAL_MEMBERS;
  const handler = payload.spentById ? members.find((m) => m.id === payload.spentById) : null;

  const newExpense: Expense = {
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
  };

  const updatedExpenses = [newExpense, ...expenses];

  // Update fund totals
  const updatedFunds = funds.map((f) => {
    if (f.id === payload.fundId) {
      const nextOut = f.totalOut + newExpense.amount;
      const nextRemaining = f.totalIn - nextOut;
      return { ...f, totalOut: nextOut, remaining: nextRemaining };
    }
    return f;
  });

  saveMockStore({ funds: updatedFunds, expenses: updatedExpenses });
  return newExpense;
}

/**
 * GET /members?search=
 * Member combobox picker search helper.
 */
export async function searchFinanceMembers(query = ""): Promise<FinanceMember[]> {
  // TODO: Real backend integration at GET /api/v1/members?search=
  try {
    const res = await fetchWithAuth(`/members?search=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      const list = json?.data ?? json;
      if (Array.isArray(list)) {
        return list.map((m: Record<string, unknown>, idx: number) => ({
          id: String(m.id || m._id || `mem-${idx}`),
          name: String(m.name || m.fullName || m.nameEn || m.nameBn || "Member"),
          avatar: typeof m.image === "string" ? m.image : typeof m.avatar === "string" ? m.avatar : null,
          role: typeof m.roleEn === "string" ? m.roleEn : typeof m.role === "string" ? m.role : undefined,
          phone: typeof m.phone === "string" ? m.phone : null,
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
 * Aggregated finance overview for the top stats, charts, and activity
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

  // Last 6 months in vs out flow
  const monthlyFlow: MonthlyFlow[] = [
    { month: "Jun", in: 140000, out: 95000 },
    { month: "Jul", in: 190000, out: 130000 },
    { month: "Aug", in: 165000, out: 145000 },
    { month: "Sep", in: 220000, out: 180000 },
    { month: "Oct", in: 280000, out: 210000 },
    { month: "Nov", in: 240000, out: 172000 },
  ];

  // Fetch recent 8 contributions and expenses
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

  // Sort merged by date desc and take top 8
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
