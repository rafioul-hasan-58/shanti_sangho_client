import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExecutives,
  fetchExecutiveById,
  createExecutive,
  updateExecutive,
  deleteExecutive,
  type CreateExecutivePayload,
  type UpdateExecutivePayload,
  type ExecutiveType,
} from "@/lib/api/executiveService";

/**
 * Cache keys for club Executive leaders / committee (formerly ['members'])
 */
export const executiveKeys = {
  all: ["executives"] as const,
  lists: () => [...executiveKeys.all, "list"] as const,
  list: (params?: { search?: string; type?: ExecutiveType; page?: number; limit?: number }) =>
    [...executiveKeys.lists(), params ?? {}] as const,
  details: () => [...executiveKeys.all, "detail"] as const,
  detail: (identifier: string) => [...executiveKeys.details(), identifier] as const,
};

/**
 * Hook to query all executive committee leaders.
 * Key: ['executives', 'list', params]
 */
export function useExecutives(params?: {
  search?: string;
  type?: ExecutiveType;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: executiveKeys.list(params),
    queryFn: () => fetchExecutives(params),
  });
}

export const useCommitteeMembers = useExecutives;

/**
 * Hook to query a single executive by identifier (ID or slug).
 * Key: ['executives', 'detail', identifier]
 */
export function useExecutive(identifier: string) {
  return useQuery({
    queryKey: executiveKeys.detail(identifier),
    queryFn: () => fetchExecutiveById(identifier),
    enabled: Boolean(identifier),
  });
}

export const useCommitteeMember = useExecutive;

/**
 * Hook to create a new executive (Admin only).
 * Invalidates ['executives'].
 */
export function useCreateExecutive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExecutivePayload) => createExecutive(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: executiveKeys.all });
    },
  });
}

/**
 * Hook to update an existing executive (Admin only).
 * Invalidates ['executives'].
 */
export function useUpdateExecutive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExecutivePayload }) =>
      updateExecutive(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: executiveKeys.all });
      queryClient.invalidateQueries({ queryKey: executiveKeys.detail(id) });
    },
  });
}

/**
 * Hook to delete an executive (Admin only).
 * Invalidates ['executives'].
 */
export function useDeleteExecutive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExecutive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: executiveKeys.all });
    },
  });
}
