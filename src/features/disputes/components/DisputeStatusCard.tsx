import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatCurrency } from '@/lib/utils';
import DisputeBadge from './DisputeBadge';
import type { Dispute } from '../types/dispute.types';
import { DISPUTE_RESOLUTION_LABELS } from '../types/dispute.types';

interface DisputeStatusCardProps {
  dispute: Dispute;
  showLink?: boolean;
}

/**
 * Card showing dispute status — used in BookingDetailPage / DeliveriesPage
 * to indicate an active or resolved dispute.
 */
export default function DisputeStatusCard({ dispute, showLink = true }: DisputeStatusCardProps) {
  const isResolved = dispute.status.startsWith('resolved');
  const isClosed = dispute.status === 'closed';

  return (
    <div className={`rounded-2xl border p-4 space-y-2 ${
      isResolved || isClosed
        ? 'bg-muted/30 border-border'
        : 'bg-warning/5 border-warning/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${isResolved || isClosed ? 'text-muted-foreground' : 'text-warning'}`} />
          <span className="text-sm font-semibold">
            {isResolved || isClosed ? 'Litige traité' : 'Litige en cours'}
          </span>
        </div>
        <DisputeBadge status={dispute.status} />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Motif : {dispute.reason}</p>
        <p>Ouvert le {formatDate(dispute.created_at)}</p>
        {dispute.hold_amount_cents > 0 && (
          <p>Montant gelé : {formatCurrency(dispute.hold_amount_cents / 100)}</p>
        )}
        {isResolved && dispute.resolution_note && (
          <p className="text-foreground font-medium">
            Décision : {DISPUTE_RESOLUTION_LABELS[dispute.status] || dispute.status}
          </p>
        )}
        {dispute.resolved_at && (
          <p>Résolu le {formatDate(dispute.resolved_at)}</p>
        )}
      </div>

      {showLink && (
        <Link
          to={`/my-disputes`}
          className="text-xs text-primary hover:underline inline-block mt-1"
        >
          Voir mes litiges →
        </Link>
      )}
    </div>
  );
}
