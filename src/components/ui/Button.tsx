import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, fullWidth, children, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
      'transition-all duration-200 ease-out',
      'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      'cursor-pointer select-none',
    ].join(' ');

    const variants = {
      primary: [
        'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground',
        'shadow-[0_2px_8px_rgb(79_70_229/0.3)]',
        'hover:shadow-[0_4px_16px_rgb(79_70_229/0.4)] hover:brightness-110',
      ].join(' '),
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
      outline: 'border-2 border-border bg-transparent hover:bg-secondary hover:border-primary/30 text-foreground',
      ghost: 'hover:bg-secondary text-muted-foreground hover:text-foreground',
      destructive: [
        'bg-gradient-to-r from-destructive to-red-700 text-white',
        'shadow-[0_2px_8px_rgb(220_38_38/0.3)]',
        'hover:shadow-[0_4px_16px_rgb(220_38_38/0.4)] hover:brightness-110',
      ].join(' '),
      success: [
        'bg-gradient-to-r from-success to-emerald-700 text-white',
        'shadow-[0_2px_8px_rgb(22_163_74/0.3)]',
        'hover:shadow-[0_4px_16px_rgb(22_163_74/0.4)] hover:brightness-110',
      ].join(' '),
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs rounded-lg',
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
export default Button;
