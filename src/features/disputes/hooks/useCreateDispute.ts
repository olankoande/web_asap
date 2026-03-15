import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '../api/disputesApi';
import type { OpenDisputeInput } from '../types/dispute.types';

export function useCreateDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: OpenDisputeInput) => disputesApi.open(input).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['my-disputes'] });
      qc.invalidateQueries({ queryKey: ['booking', variables.reference_id] });
      qc.invalidateQueries({ queryKey: ['deliveries-sent'] });
      qc.invalidateQueries({ queryKey: ['deliveries-received'] });
    },
  });
}
