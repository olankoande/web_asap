import { useQuery } from '@tanstack/react-query';
import { disputesApi } from '../api/disputesApi';

/**
 * Fetch current user's disputes.
 * ⚠️ Requires backend endpoint GET /api/v1/me/disputes (see FRONTEND_BACKLOG.md)
 */
export function useMyDisputes(enabled = true) {
  return useQuery({
    queryKey: ['my-disputes'],
    queryFn: () => disputesApi.myDisputes().then((r) => r.data),
    enabled,
    retry: 1,
  });
}
