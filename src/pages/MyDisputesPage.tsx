import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useMyDisputes } from '@/features/disputes/hooks/useMyDisputes';
import DisputeBadge from '@/features/disputes/components/DisputeBadge';
import DisputeTimeline from '@/features/disputes/components/DisputeTimeline';
import DisputeReplyForm from '@/features/disputes/components/DisputeReplyForm';
import DisputeSummaryCard from '@/features/disputes/components/DisputeSummaryCard';
import type { Dispute } from '@/features/disputes/types/dispute.types';
import { DISPUTE_RESOLUTION_LABELS } from '@/features/disputes/types/dispute.types';

export default function MyDisputesPage() {
  const { user } = useAuth();
  const { data: disputes, isLoading, error, refetch } = useMyDisputes(!!user);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedDispute = disputes?.find((d: Dispute) => String(d.id) === selectedId);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-lg font-medium text-muted-foreground">Connectez-vous pour voir vos litiges</p>
        <Link to="/login">
          <Button className="mt-4">Se connecter</Button>
        </Link>
      </div>
    );
  }

  // Detail view
  if (selectedDispute) {
    const isActive = ['open', 'investigating'].includes(selectedDispute.status);

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux litiges
        </button>

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Litige #{String(selectedDispute.id).slice(0, 8)}</h2>
            <DisputeBadge status={selectedDispute.status} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{selectedDispute.kind === 'booking' ? 'Réservation' : 'Livraison'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Référence</span>
              <span className="font-medium">#{String(selectedDispute.reference_id).slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ouvert le</span>
              <span>{formatDate(selectedDispute.created_at)}</span>
            </div>
            {selectedDispute.hold_amount_cents > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant gelé</span>
                <span className="font-medium">{formatCurrency(selectedDispute.hold_amount_cents / 100)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold mb-2">Motif</h3>
          <p className="text-sm text-muted-foreground">{selectedDispute.reason}</p>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">Suivi</h3>
          <DisputeTimeline dispute={selectedDispute} />
        </div>

        {/* Resolution */}
        {selectedDispute.status.startsWith('resolved') && (
          <div className="bg-success/5 border border-success/20 rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-semibold mb-2 text-success">Décision</h3>
            <p className="text-sm font-medium">
              {DISPUTE_RESOLUTION_LABELS[selectedDispute.status] || selectedDispute.status}
            </p>
            {selectedDispute.resolution_note && (
              <p className="text-sm text-muted-foreground mt-1">{selectedDispute.resolution_note}</p>
            )}
            {selectedDispute.resolved_at && (
              <p className="text-xs text-muted-foreground mt-2">Résolu le {formatDate(selectedDispute.resolved_at)}</p>
            )}
          </div>
        )}

        {/* Reply form — only for active disputes */}
        {isActive && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <DisputeReplyForm disputeId={String(selectedDispute.id)} />
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes litiges</h1>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive opacity-50" />
          <p className="text-muted-foreground mb-2">Impossible de charger vos litiges</p>
          <p className="text-xs text-muted-foreground mb-4">
            Cette fonctionnalité nécessite un endpoint backend qui n'est pas encore disponible.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && disputes && disputes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">Aucun litige</p>
          <p className="text-sm mt-1">Vous n'avez ouvert aucun litige pour le moment.</p>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && disputes && disputes.length > 0 && (
        <div className="space-y-3">
          {(disputes as Dispute[]).map((d) => (
            <DisputeSummaryCard
              key={d.id}
              dispute={d}
              onClick={() => setSelectedId(String(d.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
