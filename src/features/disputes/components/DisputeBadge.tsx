import { AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react';
import type { DisputeStatus, DisputeDisplayStatus } from '../types/dispute.types';
import { getDisputeDisplayStatus, DISPUTE_STATUS_LABELS, DISPUTE_RESOLUTION_LABELS } from '../types/dispute.types';

interface DisputeBadgeProps {
  status: DisputeStatus;
  className?: string;
}

const badgeConfig: Record<DisputeDisplayStatus, { color: string; icon: React.ReactNode }> = {
  open: {
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  investigating: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: <Search className="w-3.5 h-3.5" />,
  },
  resolved: {
    color: 'bg-success/10 text-success border-success/20',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  closed: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function DisputeBadge({ status, className = '' }: DisputeBadgeProps) {
  const displayStatus = getDisputeDisplayStatus(status);
  const config = badgeConfig[displayStatus];
  const label = DISPUTE_RESOLUTION_LABELS[status] || DISPUTE_STATUS_LABELS[displayStatus];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      {config.icon}
      {label}
    </span>
  );
}
