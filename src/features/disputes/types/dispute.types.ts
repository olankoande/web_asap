// ─── Dispute Types (based on backend disputes.service.ts + disputes.routes.ts) ───

export type DisputeKind = 'booking' | 'delivery';

export type DisputeStatus = 'open' | 'investigating' | 'resolved_refund' | 'resolved_release' | 'resolved_split' | 'closed';

/** Simplified status for UI display */
export type DisputeDisplayStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  kind: DisputeKind;
  reference_id: string;
  opened_by: string;
  reason: string;
  status: DisputeStatus;
  hold_amount_cents: number;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpenDisputeInput {
  kind: DisputeKind;
  reference_id: string;
  reason: string;
}

export interface OpenDisputeResult {
  id: string;
  kind: DisputeKind;
  reference_id: string;
  status: string;
  hold_amount_cents: number;
}

// ─── Dispute Reason Labels ───

export const BOOKING_DISPUTE_REASONS = [
  { value: 'driver_absent', label: 'Conducteur absent' },
  { value: 'passenger_absent', label: 'Passager absent' },
  { value: 'trip_not_completed', label: 'Trajet non effectué' },
  { value: 'abusive_cancellation', label: 'Annulation abusive' },
  { value: 'major_incident', label: 'Incident majeur' },
  { value: 'other', label: 'Autre' },
] as const;

export const DELIVERY_DISPUTE_REASONS = [
  { value: 'parcel_not_received', label: 'Colis non reçu' },
  { value: 'parcel_damaged', label: 'Colis endommagé' },
  { value: 'parcel_lost', label: 'Colis perdu' },
  { value: 'false_status', label: 'Statut faux' },
  { value: 'incorrect_delivery', label: 'Remise incorrecte' },
  { value: 'other', label: 'Autre' },
] as const;

// ─── Error Code Mapping ───

export const DISPUTE_ERROR_MESSAGES: Record<string, string> = {
  DISPUTE_ALREADY_OPEN: 'Un litige est déjà ouvert pour cette ressource.',
  NOT_DISPUTE_PARTICIPANT: 'Vous n\'êtes pas impliqué dans cette réservation ou livraison.',
  DISPUTE_NOT_FOUND: 'Litige introuvable.',
  DISPUTE_ALREADY_RESOLVED: 'Ce litige a déjà été résolu.',
  INVALID_DISPUTE_ACTION: 'Action non autorisée sur ce litige.',
  INVALID_STATUS: 'Le statut actuel ne permet pas d\'ouvrir un litige.',
  FORBIDDEN: 'Vous n\'êtes pas autorisé à effectuer cette action.',
};

// ─── Display Helpers ───

export function getDisputeDisplayStatus(status: DisputeStatus): DisputeDisplayStatus {
  if (status === 'open') return 'open';
  if (status === 'investigating') return 'investigating';
  if (status.startsWith('resolved')) return 'resolved';
  return 'closed';
}

export const DISPUTE_STATUS_LABELS: Record<DisputeDisplayStatus, string> = {
  open: 'Ouvert',
  investigating: 'En cours d\'analyse',
  resolved: 'Résolu',
  closed: 'Fermé',
};

export const DISPUTE_RESOLUTION_LABELS: Record<string, string> = {
  resolved_refund: 'Remboursé',
  resolved_release: 'Litige rejeté — fonds libérés',
  resolved_split: 'Remboursé partiellement',
};
