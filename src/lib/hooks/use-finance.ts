import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFunds,
  getFundById,
  getFundSummary,
  getContributions,
  createContribution,
  getExpenses,
  createExpense,
  searchFinanceMembers,
  getFinanceOverview,
  type ContributionQueryParams,
  type ExpenseQueryParams,
  type CreateContributionPayload,
  type CreateExpensePayload,
} from "@/lib/api/finance";

// Query Keys
export const financeKeys = {
  all: ["finance"] as const,
  overview: () => [...financeKeys.all, "overview"] as const,
  funds: () => [...financeKeys.all, "funds"] as const,
  fund: (id: string) => [...financeKeys.all, "fund", id] as const,
  fundSummary: (id: string) => [...financeKeys.all, "fund-summary", id] as const,
  contributions: (params?: ContributionQueryParams) =>
    [...financeKeys.all, "contributions", params] as const,
  expenses: (params?: ExpenseQueryParams) =>
    [...financeKeys.all, "expenses", params] as const,
  members: (query: string) => [...financeKeys.all, "members", query] as const,
};

/**
 * Fetch all club funds
 */
export function useFunds() {
  return useQuery({
    queryKey: financeKeys.funds(),
    queryFn: getFunds,
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
      queryClient.invalidateQueries({ queryKey: financeKeys.funds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
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
 * Mutation: Add a new expense
 * Invalidates funds, overview, expenses, and fund summaries
 */
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: (newExpense) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.funds() });
      queryClient.invalidateQueries({ queryKey: financeKeys.overview() });
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
