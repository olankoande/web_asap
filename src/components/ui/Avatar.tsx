import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ src, firstName, lastName, size = 'md', className, ring }: AvatarProps) {
  const sizeClass = sizes[size];

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ''} ${lastName || ''}`}
        className={cn(
          sizeClass,
          'rounded-full object-cover',
          ring && 'ring-2 ring-white shadow-md',
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary',
        'flex items-center justify-center font-bold',
        ring && 'ring-2 ring-white shadow-md',
        className,
      )}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
