import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon: Icon, iconRight: IconRight, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'flex h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium',
              'transition-all duration-200',
              'placeholder:text-muted-foreground/60 placeholder:font-normal',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'hover:border-primary/40',
              Icon && 'pl-10',
              IconRight && 'pr-10',
              error
                ? 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive bg-destructive/5'
                : 'border-border',
              className,
            )}
            {...props}
          />
          {IconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconRight className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-destructive flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3.5v3M6 8.5h.005" stroke="currentColor" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
export default Input;
