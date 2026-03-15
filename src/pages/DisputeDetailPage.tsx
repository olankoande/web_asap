import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useDispute } from '@/features/disputes/hooks/useDispute';
import DisputeBadge from '@/features/disputes/components/DisputeBadge';
import DisputeTimeline from '@/features/disputes/components/DisputeTimeline';
import DisputeReplyForm from '@/features/disputes/components/DisputeReplyForm';
import { DISPUTE_RESOLUTION_LABELS } from '@/features/disputes/types/dispute.types';
import type { DisputeReply } from '@/features/disputes/api/disputesApi';

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: dispute, isLoading, error } = useDispute(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="skeleton h-48 rounded-2xl mb-4" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive opacity-50" />
        <p className="text-lg font-medium text-muted-foreground">Litige introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/my-disputes')}>
          Retour aux litiges
        </Button>
      </div>
    );
  }

  const isActive = ['open', 'investigating'].includes(dispute.status);
  const isResolved = dispute.status.startsWith('resolved');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/my-disputes')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux litiges
      </button>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Litige #{String(dispute.id).slice(0, 8)}</h2>
          <DisputeBadge status={dispute.status} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{dispute.kind === 'booking' ? 'Réservation' : 'Livraison'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Référence</span>
            <button
              onClick={() => navigate(dispute.kind === 'booking' ? `/booking/${dispute.reference_id}` : '/deliveries')}
              className="font-medium text-primary hover:underline"
            >
              #{String(dispute.reference_id).slice(0, 8)}
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ouvert le</span>
            <span>{formatDate(dispute.created_at)}</span>
          </div>
          {dispute.hold_amount_cents > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant gelé</span>
              <span className="font-medium">{formatCurrency(dispute.hold_amount_cents / 100)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold mb-2">Motif</h3>
        <p className="text-sm text-muted-foreground">{dispute.reason}</p>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold mb-3">Suivi</h3>
        <DisputeTimeline dispute={dispute} />
      </div>

      {/* Resolution */}
      {isResolved && (
        <div className="bg-success/5 border border-success/20 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold mb-2 text-success">Décision</h3>
          <p className="text-sm font-medium">
            {DISPUTE_RESOLUTION_LABELS[dispute.status] || dispute.status}
          </p>
          {dispute.resolution_note && (
            <p className="text-sm text-muted-foreground mt-1">{dispute.resolution_note}</p>
          )}
          {dispute.resolved_at && (
            <p className="text-xs text-muted-foreground mt-2">Résolu le {formatDate(dispute.resolved_at)}</p>
          )}
        </div>
      )}

      {/* Replies / Conversation */}
      {dispute.replies && dispute.replies.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">Échanges</h3>
          <div className="space-y-3">
            {dispute.replies.map((reply: DisputeReply) => (
              <div
                key={reply.id}
                className={`rounded-xl p-3 text-sm ${
                  reply.user_role === 'admin' || reply.user_role === 'support'
                    ? 'bg-primary/5 border border-primary/10'
                    : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs">
                    {reply.user_role === 'admin' || reply.user_role === 'support'
                      ? '🛡️ Support AsapJoin'
                      : reply.user
                        ? `${reply.user.first_name} ${reply.user.last_name}`
                        : 'Utilisateur'}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-muted-foreground">{reply.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply form — only for active disputes */}
      {isActive && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <DisputeReplyForm disputeId={String(dispute.id)} />
        </div>
      )}
    </div>
  );
}
