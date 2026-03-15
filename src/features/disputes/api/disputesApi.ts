/**
 * Disputes API client — maps to backend routes.
 *
 * Endpoints (from disputes.routes.ts + app.ts):
 *   POST /api/v1/disputes              — Open a dispute (user)
 *   GET  /api/v1/disputes/:id          — Get dispute detail (user — must be participant)
 *   POST /api/v1/disputes/:id/reply    — Reply to dispute (user)
 *   GET  /api/v1/me/disputes           — List my disputes (user)
 */

import http from '@/lib/api-client';
import type { OpenDisputeInput, OpenDisputeResult, Dispute } from '../types/dispute.types';

export interface DisputeReply {
  id: string;
  dispute_id: string;
  user_id: string;
  user_role: string;
  message: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface DisputeWithReplies extends Dispute {
  replies?: DisputeReply[];
}

export const disputesApi = {
  /** Open a new dispute — POST /api/v1/disputes */
  open: (body: OpenDisputeInput) =>
    http.post<OpenDisputeResult>('/disputes', body),

  /** Get my disputes — GET /api/v1/me/disputes */
  myDisputes: () =>
    http.get<Dispute[]>('/me/disputes'),

  /** Get dispute detail — GET /api/v1/disputes/:id */
  get: (id: string) =>
    http.get<DisputeWithReplies>(`/disputes/${id}`),

  /** Reply to a dispute — POST /api/v1/disputes/:id/reply */
  reply: (id: string, body: { message: string }) =>
    http.post<DisputeReply>(`/disputes/${id}/reply`, body),
};
