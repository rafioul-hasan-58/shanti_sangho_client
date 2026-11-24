import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFunds,
  getFundById,
  getFundSummary,
  createFund,
  updateFund,
  deleteFund,
  getContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  searchFinanceMembers,
  getFinanceOverview,
  getRecentTransactions,
  type FundQueryParams,
  type ContributionQueryParams,
  type ExpenseQueryParams,
  type CreateFundPayload,
  type UpdateFundPayload,
  type CreateContributionPayload,
  type CreateExpensePayload,
  type RecentTransactionsParams,
} from "@/lib/api/finance";

// Query Keys
export const financeKeys = {
  all: ["finance"] as const,
  overview: () => [...financeKeys.all, "overview"] as const,
  funds: (params?: FundQueryParams) => [...financeKeys.all, "funds", params] as const,
  fund: (id: string) => [...financeKeys.all, "fund", id] as const,
  fundSummary: (id: string) => [...financeKeys.all, "fund-summary", id] as const,
  contributions: (params?: ContributionQueryParams) =>
    [...financeKeys.all, "contributions", params] as const,
  contribution: (id: string) => [...financeKeys.all, "contribution", id] as const,
  expenses: (params?: ExpenseQueryParams) =>
    [...financeKeys.all, "expenses", params] as const,
  expense: (id: string) => [...financeKeys.all, "expense", id] as const,
  members: (query: string) => [...financeKeys.all, "members", query] as const,
  recentTransactions: (params?: RecentTransactionsParams) =>
    [...financeKeys.all, "recent-transactions", params] as const,
};

/**
 * Fetch all club funds
 */
export function useFunds(params?: FundQueryParams) {
  return useQuery({
    queryKey: financeKeys.funds(params),
    queryFn: () => getFunds(params),
  });
}

/**
 * Fetch single fund details by ID
 */
export function useFund(fundId: string) {
  return useQuery({
    queryKey: financeKeys.fund(fundId),
    queryFn: () => getFundById(fundId),
    enabled: Boolean(fundId),
  });
}

/**
 * Mutation: Create a new fund
 */
export function useCreateFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFundPayload) => createFund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Mutation: Update a fund
 */
export function useUpdateFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFundPayload }) =>
      updateFund(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      queryClient.invalidateQueries({ queryKey: financeKeys.fund(id) });
    },
  });
}

/**
 * Mutation: Delete empty fund
 */
export function useDeleteFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Fetch fund summary (totalIn, totalOut, remaining)
 */
export function useFundSummary(fundId: string) {
  return useQuery({
    queryKey: financeKeys.fundSummary(fundId),
    queryFn: () => getFundSummary(fundId),
    enabled: Boolean(fundId),
  });
}

/**
 * Fetch paginated & filtered contributions
 */
export function useContributions(params: ContributionQueryParams = {}) {
  return useQuery({
    queryKey: financeKeys.contributions(params),
    queryFn: () => getContributions(params),
  });
}

/**
 * Fetch paginated & filtered expenses
 */
export function useExpenses(params: ExpenseQueryParams = {}) {
  return useQuery({
    queryKey: financeKeys.expenses(params),
    queryFn: () => getExpenses(params),
  });
}

/**
 * Fetch aggregated finance overview (top 3 stat cards, 6-month chart, 8 recent items)
 */
export function useFinanceOverview() {
  return useQuery({
    queryKey: financeKeys.overview(),
    queryFn: getFinanceOverview,
  });
}

/**
 * Search club members for contributor/receiver comboboxes
 */
export function useFinanceMembers(search = "") {
  return useQuery({
    queryKey: financeKeys.members(search),
    queryFn: () => searchFinanceMembers(search),
  });
}

/**
 * Mutation: Add a new contribution
 * Invalidates funds, overview, contributions, and fund summaries
 */
export function useAddContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContributionPayload) => createContribution(payload),
    onSuccess: (newContribution) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      if (newContribution.fundId) {
        queryClient.invalidateQueries({
          queryKey: financeKeys.fundSummary(newContribution.fundId),
        });
        queryClient.invalidateQueries({
          queryKey: financeKeys.fund(newContribution.fundId),
        });
      }
    },
  });
}

/**
 * Mutation: Update contribution
 */
export function useUpdateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateContributionPayload>;
    }) => updateContribution(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Mutation: Delete contribution
 */
export function useDeleteContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Mutation: Add a new expense
 * Invalidates funds, overview, expenses, and fund summaries
 */
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: (newExpense) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
      if (newExpense.fundId) {
        queryClient.invalidateQueries({
          queryKey: financeKeys.fundSummary(newExpense.fundId),
        });
        queryClient.invalidateQueries({
          queryKey: financeKeys.fund(newExpense.fundId),
        });
      }
    },
  });
}

/**
 * Mutation: Update expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExpensePayload>;
    }) => updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Mutation: Delete expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

/**
 * Fetch paginated recent transactions across all funds
 */
export function useRecentTransactions(params?: RecentTransactionsParams) {
  return useQuery({
    queryKey: financeKeys.recentTransactions(params),
    queryFn: () => getRecentTransactions(params),
  });
}
