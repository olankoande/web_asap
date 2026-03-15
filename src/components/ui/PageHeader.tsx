import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, action, back, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 animate-fade-in', className)}>
      {back && <div className="mb-3">{back}</div>}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
