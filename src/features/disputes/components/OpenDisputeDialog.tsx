import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getApiError } from '@/lib/api-client';
import { useCreateDispute } from '../hooks/useCreateDispute';
import {
  BOOKING_DISPUTE_REASONS,
  DELIVERY_DISPUTE_REASONS,
  DISPUTE_ERROR_MESSAGES,
  type DisputeKind,
} from '../types/dispute.types';

interface OpenDisputeDialogProps {
  open: boolean;
  onClose: () => void;
  kind: DisputeKind;
  referenceId: string;
  onSuccess?: () => void;
}

export default function OpenDisputeDialog({ open, onClose, kind, referenceId, onSuccess }: OpenDisputeDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const createDispute = useCreateDispute();

  const reasons = kind === 'booking' ? BOOKING_DISPUTE_REASONS : DELIVERY_DISPUTE_REASONS;

  const handleSubmit = () => {
    if (!reason) {
      setError('Veuillez sélectionner un motif.');
      return;
    }

    const reasonLabel = reasons.find((r) => r.value === reason)?.label || reason;
    const fullReason = description ? `${reasonLabel} — ${description}` : reasonLabel;

    setError('');
    createDispute.mutate(
      { kind, reference_id: referenceId, reason: fullReason },
      {
        onSuccess: () => {
          setSuccess(true);
          onSuccess?.();
        },
        onError: (err) => {
          const apiErr = getApiError(err);
          setError(DISPUTE_ERROR_MESSAGES[apiErr.code] || apiErr.message);
        },
      },
    );
  };

  const handleClose = () => {
    if (!createDispute.isPending) {
      setReason('');
      setDescription('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={handleClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold mb-2">Litige ouvert</h3>
              <p className="text-sm text-muted-foreground">
                Votre litige a été enregistré. Notre équipe l'examinera dans les plus brefs délais.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full mt-4">
              Fermer
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Signaler un problème
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {kind === 'booking'
                ? 'Décrivez le problème rencontré avec cette réservation.'
                : 'Décrivez le problème rencontré avec cette livraison.'}
            </p>

            {/* Reason select */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">Motif du litige *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Sélectionnez un motif…</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Décrivez la situation en détail…"
              />
            </div>

            {/* Info box */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 mb-4 text-xs text-blue-600">
              <p className="font-medium mb-1">Ce qui va se passer :</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-500">
                <li>Les fonds seront gelés le temps de l'analyse</li>
                <li>Notre équipe examinera votre demande</li>
                <li>Vous serez informé de la décision</li>
              </ul>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={createDispute.isPending}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleSubmit}
                loading={createDispute.isPending}
                disabled={!reason}
              >
                Ouvrir le litige
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
