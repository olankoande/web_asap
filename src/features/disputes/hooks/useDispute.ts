import { useQuery } from '@tanstack/react-query';
import { disputesApi } from '../api/disputesApi';

/**
 * Fetch a single dispute by ID.
 * ⚠️ Requires backend endpoint GET /api/v1/disputes/:id (see FRONTEND_BACKLOG.md)
 */
export function useDispute(id: string | undefined) {
  return useQuery({
    queryKey: ['dispute', id],
    queryFn: () => disputesApi.get(id!).then((r) => r.data),
    enabled: !!id,
    retry: 1,
  });
}
