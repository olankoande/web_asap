import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ─── Card ─── */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
}

export function Card({ className, hover, padding = 'md', variant = 'default', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };
  const variants = {
    default: 'bg-card border border-border/60 shadow-[var(--shadow-card)]',
    outline: 'bg-transparent border-2 border-border',
    ghost: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-primary/10',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        hover && 'card-hover cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── CardHeader ─── */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

/* ─── CardTitle ─── */
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-bold text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

/* ─── CardDescription ─── */
export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

/* ─── StatCard ─── */
interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  onClick?: () => void;
}

export function StatCard({ icon, label, value, color = 'bg-primary/10', trend, className, onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border/60 p-4 shadow-[var(--shadow-card)]',
        'transition-all duration-200',
        onClick && 'card-hover cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
