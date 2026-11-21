import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembers,
  fetchMemberById,
  fetchMemberProfile,
  updateMemberProfile,
  updateMemberById,
  toggleBlockMemberById,
  deleteMemberById,
  type MembersQueryParams,
  type UpdateManagedUserPayload,
  type UpdateProfilePayload,
} from "@/lib/api/memberService";

/**
 * Cache keys for registered club Member accounts (formerly ['users'])
 */
export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (params?: MembersQueryParams) => [...memberKeys.lists(), params ?? {}] as const,
  details: () => [...memberKeys.all, "detail"] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
  profile: () => [...memberKeys.all, "profile"] as const,
};

// Backward compatibility alias for query keys
export const userKeys = memberKeys;

/**
 * Hook to query paginated / filtered registered club members.
 * Key: ['members', 'list', params]
 */
export function useMembers(params: MembersQueryParams = {}) {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: () => fetchMembers(params),
  });
}

export const useUsers = useMembers;

/**
 * Hook to query a single member by ID.
 * Key: ['members', 'detail', id]
 */
export function useMember(id: string) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => fetchMemberById(id),
    enabled: Boolean(id),
  });
}

export const useUser = useMember;

/**
 * Hook to query the logged-in member's profile.
 * Key: ['members', 'profile']
 */
export function useMemberProfile() {
  return useQuery({
    queryKey: memberKeys.profile(),
    queryFn: () => fetchMemberProfile(),
  });
}

/**
 * Hook to update authenticated member's profile.
 * Invalidates ['members', 'profile'] and ['members', 'list'].
 */
export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMemberProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.profile() });
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}

/**
 * Hook to update member details by ID (Admin).
 * Invalidates ['members'].
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateManagedUserPayload }) =>
      updateMemberById(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(id) });
    },
  });
}

export const useUpdateUser = useUpdateMember;

/**
 * Hook to toggle block status (Admin).
 * Invalidates ['members'].
 */
export function useToggleBlockMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleBlockMemberById(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      queryClient.invalidateQueries({ queryKey: memberKeys.detail(id) });
    },
  });
}

export const useToggleBlockUser = useToggleBlockMember;

/**
 * Hook to delete a member (Admin).
 * Invalidates ['members'].
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMemberById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

export const useDeleteUser = useDeleteMember;
