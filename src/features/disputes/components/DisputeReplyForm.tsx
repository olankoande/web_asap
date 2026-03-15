import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getApiError } from '@/lib/api-client';
import { useReplyToDispute } from '../hooks/useReplyToDispute';
import { DISPUTE_ERROR_MESSAGES } from '../types/dispute.types';

interface DisputeReplyFormProps {
  disputeId: string;
}

/**
 * Form to reply / add information to a dispute.
 * ⚠️ Requires backend endpoint POST /api/v1/disputes/:id/reply (see FRONTEND_BACKLOG.md)
 */
export default function DisputeReplyForm({ disputeId }: DisputeReplyFormProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const replyMutation = useReplyToDispute(disputeId);

  const handleSubmit = () => {
    if (!message.trim()) return;
    setError('');
    setSuccess(false);

    replyMutation.mutate(message.trim(), {
      onSuccess: () => {
        setMessage('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err) => {
        const apiErr = getApiError(err);
        setError(DISPUTE_ERROR_MESSAGES[apiErr.code] || apiErr.message);
      },
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Ajouter un complément d'information</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        placeholder="Décrivez les informations supplémentaires…"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-success">Message envoyé avec succès.</p>}
      <Button
        size="sm"
        onClick={handleSubmit}
        loading={replyMutation.isPending}
        disabled={!message.trim()}
      >
        <Send className="w-3.5 h-3.5 mr-1.5" />
        Envoyer
      </Button>
    </div>
  );
}
