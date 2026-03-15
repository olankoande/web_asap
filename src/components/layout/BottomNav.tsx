import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, LayoutDashboard, Package, MessageCircle, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function BottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { to: '/search', icon: Search, label: t('nav.search') },
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), auth: true },
    { to: '/deliveries', icon: Package, label: t('nav.parcels'), auth: true },
    { to: '/messages', icon: MessageCircle, label: t('nav.messages'), auth: true },
    { to: '/account', icon: UserCircle, label: t('nav.profile'), auth: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.auth && !user) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
                  )}
                  <div className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-primary/10',
                  )}>
                    <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
