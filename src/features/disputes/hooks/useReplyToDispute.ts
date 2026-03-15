import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '../api/disputesApi';

/**
 * Reply to a dispute (add information).
 * ⚠️ Requires backend endpoint POST /api/v1/disputes/:id/reply (see FRONTEND_BACKLOG.md)
 */
export function useReplyToDispute(disputeId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => disputesApi.reply(disputeId, { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispute', disputeId] });
      qc.invalidateQueries({ queryKey: ['my-disputes'] });
    },
  });
}
