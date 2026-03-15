import { Package, BookOpen } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import DisputeBadge from './DisputeBadge';
import type { Dispute } from '../types/dispute.types';

interface DisputeSummaryCardProps {
  dispute: Dispute;
  onClick?: () => void;
}

/**
 * Summary card for dispute list — used in MyDisputesPage.
 */
export default function DisputeSummaryCard({ dispute, onClick }: DisputeSummaryCardProps) {
  const KindIcon = dispute.kind === 'booking' ? BookOpen : Package;

  return (
    <div
      className="bg-card rounded-2xl border border-border p-4 space-y-3 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
            <KindIcon className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {dispute.kind === 'booking' ? 'Réservation' : 'Livraison'} #{String(dispute.reference_id).slice(0, 8)}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(dispute.created_at)}</p>
          </div>
        </div>
        <DisputeBadge status={dispute.status} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{dispute.reason}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {dispute.hold_amount_cents > 0 && (
          <span>Montant : {formatCurrency(dispute.hold_amount_cents / 100)}</span>
        )}
        <span className="text-xs">ID: {String(dispute.id).slice(0, 8)}</span>
      </div>
    </div>
  );
}
