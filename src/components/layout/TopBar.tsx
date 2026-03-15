import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { useOnline } from '@/lib/useOnline';
import { WifiOff, LogOut, Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import logo from '@/assets/logo.png';

export default function TopBar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const online = useOnline();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14 max-w-3xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img src={logo} alt="AsapJoin" className="h-8 w-8 rounded-xl shadow-sm transition-transform group-hover:scale-105" />
            <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          <span className="font-extrabold text-lg text-gradient hidden sm:block">AsapJoin</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          <LanguageSwitcher />

          {!online && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1.5 rounded-full animate-pulse">
              <WifiOff className="w-3 h-3" />
              <span>{t('common.offline')}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1.5">
              {/* Notifications placeholder */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
                <Bell className="w-4.5 h-4.5" />
                {/* Notification dot */}
                {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" /> */}
              </button>

              {/* User avatar */}
              <Link
                to="/account"
                className="flex items-center gap-2 hover:bg-secondary rounded-xl px-2 py-1.5 transition-all"
              >
                <Avatar
                  src={user.avatar_url}
                  firstName={user.first_name}
                  lastName={user.last_name}
                  size="sm"
                />
                <span className="text-sm font-semibold hidden sm:block">{user.first_name}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
              aria-label={t('common.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary-dark px-4 py-2 rounded-xl shadow-[0_2px_8px_rgb(79_70_229/0.3)] hover:shadow-[0_4px_16px_rgb(79_70_229/0.4)] transition-all"
            >
              {t('common.connection')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
