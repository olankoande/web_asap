import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, CreditCard, XCircle, CheckCircle, Clock, MapPin, Users, Truck, MessageCircle, AlertTriangle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import type { CancelResult } from '@/lib/types';
import OpenDisputeDialog from '@/features/disputes/components/OpenDisputeDialog';
import DisputeStatusCard from '@/features/disputes/components/DisputeStatusCard';
import { useMyDisputes } from '@/features/disputes/hooks/useMyDisputes';
import type { Dispute } from '@/features/disputes/types/dispute.types';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelResult, setCancelResult] = useState<CancelResult | null>(null);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  // Fetch disputes for this booking
  const { data: myDisputes } = useMyDisputes(!!user);
  const bookingDispute = myDisputes?.find(
    (d: Dispute) => d.kind === 'booking' && String(d.reference_id) === String(id)
  );

  // Cancel preview query — fetched when modal opens
  const { data: preview, isLoading: previewLoading, error: previewError } = useQuery({
    queryKey: ['booking-cancel-preview', id],
    queryFn: () => bookingsApi.cancelPreview(id!).then((r) => r.data),
    enabled: showCancelModal && !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(id!, cancelReason || undefined),
    onSuccess: (res) => {
      setCancelResult(res.data);
      qc.invalidateQueries({ queryKey: ['booking', id] });
    },
    onError: (err) => setError(getApiError(err).message),
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-6"><div className="skeleton h-48 rounded-2xl" /></div>;
  if (!booking) return <div className="text-center py-12 text-muted-foreground">Réservation introuvable</div>;

  const isPaid = booking.status === 'paid' || booking.payments?.some((p) => p.status === 'succeeded');
  const canCancel = ['pending', 'accepted', 'paid'].includes(booking.status);
  const isOwner = user?.id === booking.passenger_id;
  const isDriver = booking.trip?.driver_id && user?.id === booking.trip.driver_id;

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: <Clock className="w-4 h-4" />, label: 'En attente de paiement' },
    accepted: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <CheckCircle className="w-4 h-4" />, label: 'Acceptée' },
    rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="w-4 h-4" />, label: 'Refusée' },
    paid: { color: 'bg-success/10 text-success border-success/20', icon: <CreditCard className="w-4 h-4" />, label: 'Payée ✓' },
    cancelled: { color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="w-4 h-4" />, label: 'Annulée' },
    completed: { color: 'bg-primary/10 text-primary border-primary/20', icon: <CheckCircle className="w-4 h-4" />, label: 'Terminée' },
    expired: { color: 'bg-muted text-muted-foreground border-border', icon: <Clock className="w-4 h-4" />, label: 'Expirée' },
  };

  const status = statusConfig[booking.status] || statusConfig.pending;

  const errorMessages: Record<string, string> = {
    REFUND_REQUEST_WINDOW_EXPIRED: 'Le délai pour demander un remboursement est dépassé.',
    CANCELLATION_NOT_ALLOWED: 'L\'annulation n\'est pas autorisée dans le statut actuel.',
    INVALID_REFUND_POLICY: 'Aucune politique de remboursement applicable.',
    ALREADY_CANCELLED: 'Cette réservation a déjà été annulée.',
    REFUND_ALREADY_PROCESSED: 'Le remboursement a déjà été traité.',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Paid indicator */}
      {isPaid && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Réservation confirmée et payée</span>
        </div>
      )}

      {/* Cancel result banner */}
      {cancelResult && (
        <div className={`px-4 py-3 rounded-xl mb-4 flex items-center gap-2 ${cancelResult.status === 'refunded' ? 'bg-success/10 border border-success/20 text-success' : 'bg-blue-500/10 border border-blue-500/20 text-blue-600'}`}>
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">{cancelResult.message}</p>
            {cancelResult.refund_amount_cents > 0 && (
              <p className="text-sm mt-1">Remboursement : {formatCurrency(cancelResult.refund_amount_cents / 100)}</p>
            )}
          </div>
        </div>
      )}

      {/* Cancel reason if already cancelled */}
      {booking.status === 'cancelled' && booking.cancel_reason && (
        <div className="bg-muted/50 border border-border px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Raison : {booking.cancel_reason}</span>
        </div>
      )}

      {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      {/* Booking card */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Réservation</h2>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {booking.trip && (
            <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-primary font-medium">
                <MapPin className="w-4 h-4" />
                {booking.trip.from_city ?? booking.trip.origin_address} → {booking.trip.to_city ?? booking.trip.destination_address}
              </div>
              <div className="text-muted-foreground text-xs">
                Départ : {formatDate(booking.trip.departure_at ?? booking.trip.departure_time)}
              </div>
              {booking.trip.driver && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="w-3 h-3" />
                  Conducteur : {booking.trip.driver.first_name} {booking.trip.driver.last_name}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Places</p>
              <p className="font-semibold">{booking.seats_requested}</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">{formatCurrency(booking.amount_total, booking.currency)}</p>
            </div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Créée le {formatDate(booking.created_at)}</span>
            <span>ID: {String(booking.id).slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Dispute status card — if a dispute exists for this booking */}
      {bookingDispute && (
        <div className="mb-4">
          <DisputeStatusCard dispute={bookingDispute} />
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {canCancel && (isOwner || isDriver) && !cancelResult && (
          <Button onClick={() => { setShowCancelModal(true); setError(''); }} variant="destructive" className="w-full" size="lg">
            <XCircle className="w-4 h-4 mr-2" /> Annuler la réservation
          </Button>
        )}

        {/* Open dispute button — only for paid/completed bookings without existing dispute */}
        {(isOwner || isDriver) && ['paid', 'completed'].includes(booking.status) && !bookingDispute && (
          <Button onClick={() => setShowDisputeDialog(true)} variant="outline" className="w-full text-warning border-warning/30 hover:bg-warning/5">
            <AlertTriangle className="w-4 h-4 mr-2" /> Signaler un problème
          </Button>
        )}

        <Button onClick={() => navigate(`/messages?booking_id=${booking.id}`)} variant="outline" className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" /> Contacter le conducteur
        </Button>

        {booking.trip_id && (
          <Button onClick={() => navigate(`/trips/${booking.trip_id}`)} variant="outline" className="w-full">
            Voir le trajet
          </Button>
        )}
      </div>

      {/* ─── Dispute Dialog ─── */}
      <OpenDisputeDialog
        open={showDisputeDialog}
        onClose={() => setShowDisputeDialog(false)}
        kind="booking"
        referenceId={id!}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['my-disputes'] });
          qc.invalidateQueries({ queryKey: ['booking', id] });
        }}
      />

      {/* ─── Cancel Modal ─── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => !cancelMutation.isPending && setShowCancelModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Annuler la réservation
            </h3>

            {/* Preview loading */}
            {previewLoading && (
              <div className="space-y-2 mb-4">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            )}

            {/* Preview error */}
            {previewError && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg mb-4">
                {errorMessages[getApiError(previewError).code] || getApiError(previewError).message}
              </div>
            )}

            {/* Preview result */}
            {preview && (
              <div className="space-y-3 mb-4">
                {!preview.allowed ? (
                  <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">
                    {errorMessages[preview.reason_code || ''] || preview.message}
                  </div>
                ) : (
                  <>
                    <div className="bg-secondary/50 rounded-xl p-3 space-y-2 text-sm">
                      {preview.original_amount_cents > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant original</span>
                          <span>{formatCurrency(preview.original_amount_cents / 100)}</span>
                        </div>
                      )}
                      {preview.cancellation_fee_cents > 0 && (
                        <div className="flex justify-between text-destructive">
                          <span>Frais d'annulation</span>
                          <span>-{formatCurrency(preview.cancellation_fee_cents / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t border-border pt-2">
                        <span>Remboursement</span>
                        <span className={preview.refund_amount_cents > 0 ? 'text-success' : 'text-muted-foreground'}>
                          {preview.refund_amount_cents > 0 ? formatCurrency(preview.refund_amount_cents / 100) : 'Aucun'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{preview.message}</p>
                    {preview.policy_name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" /> Politique : {preview.policy_name}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Reason input */}
            {preview?.allowed && (
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-1 block">Raison (optionnel)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Pourquoi annulez-vous ?"
                />
              </div>
            )}

            {error && <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowCancelModal(false); setError(''); }}
                disabled={cancelMutation.isPending}
              >
                Fermer
              </Button>
              {preview?.allowed && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => cancelMutation.mutate()}
                  loading={cancelMutation.isPending}
                >
                  Confirmer l'annulation
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
