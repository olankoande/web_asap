import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'pills' | 'underline' | 'solid';
  className?: string;
}

export default function Tabs({ tabs, active, onChange, variant = 'pills', className }: TabsProps) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-border', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all relative',
              active === tab.key
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                active === tab.key ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground',
              )}>
                {tab.count}
              </span>
            )}
            {active === tab.key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'solid') {
    return (
      <div className={cn('flex gap-2', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
              active === tab.key
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-[0_2px_8px_rgb(79_70_229/0.3)]'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                active === tab.key ? 'bg-white/20' : 'bg-muted-foreground/10',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Pills (default)
  return (
    <div className={cn('flex gap-1 bg-secondary/80 rounded-xl p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200',
            active === tab.key
              ? 'bg-white text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              active === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10',
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
