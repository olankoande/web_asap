import { AlertTriangle, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Dispute } from '../types/dispute.types';
import { DISPUTE_RESOLUTION_LABELS } from '../types/dispute.types';

interface DisputeTimelineProps {
  dispute: Dispute;
}

interface TimelineStep {
  icon: React.ReactNode;
  label: string;
  date: string | null;
  active: boolean;
  done: boolean;
}

export default function DisputeTimeline({ dispute }: DisputeTimelineProps) {
  const isResolved = dispute.status.startsWith('resolved');
  const isClosed = dispute.status === 'closed';
  const isInvestigating = dispute.status === 'investigating';

  const steps: TimelineStep[] = [
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Litige ouvert',
      date: dispute.created_at,
      active: dispute.status === 'open',
      done: true,
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: 'En cours d\'analyse',
      date: isInvestigating || isResolved || isClosed ? dispute.updated_at : null,
      active: isInvestigating,
      done: isInvestigating || isResolved || isClosed,
    },
    {
      icon: isResolved ? <CheckCircle className="w-4 h-4" /> : isClosed ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />,
      label: isResolved
        ? DISPUTE_RESOLUTION_LABELS[dispute.status] || 'Résolu'
        : isClosed
          ? 'Fermé'
          : 'En attente de décision',
      date: dispute.resolved_at,
      active: isResolved || isClosed,
      done: isResolved || isClosed,
    },
  ];

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              step.active
                ? 'bg-primary text-white'
                : step.done
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {step.icon}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-0.5 flex-1 min-h-[24px] ${step.done ? 'bg-success/30' : 'bg-border'}`} />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 pt-1">
            <p className={`text-sm font-medium ${step.active ? 'text-primary' : step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-muted-foreground">{formatDate(step.date)}</p>
            )}
          </div>
        </div>
      ))}

      {/* Resolution note */}
      {isResolved && dispute.resolution_note && (
        <div className="ml-11 bg-secondary/50 rounded-xl p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Note de résolution :</p>
          <p>{dispute.resolution_note}</p>
        </div>
      )}
    </div>
  );
}
