import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { usersApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { Wallet, Car, History, Package, AlertTriangle, CarFront, ShieldAlert, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import PageHeader from '@/components/ui/PageHeader';

export default function AccountPage() {
  const { t } = useTranslation();

  const quickLinks = [
    { to: '/wallet', icon: Wallet, label: t('account.links.wallet'), color: 'bg-primary/10 text-primary' },
    { to: '/driver/trips', icon: Car, label: t('account.links.myTrips'), color: 'bg-primary/10 text-primary' },
    { to: '/history', icon: History, label: t('account.links.history'), color: 'bg-accent/10 text-accent' },
    { to: '/deliveries', icon: Package, label: t('account.links.myParcels'), color: 'bg-success/10 text-success' },
    { to: '/my-disputes', icon: ShieldAlert, label: t('account.links.myDisputes'), color: 'bg-warning/10 text-warning' },
    { to: '/vehicles', icon: CarFront, label: t('account.links.myVehicles'), color: 'bg-info/10 text-info' },
  ];

  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone_number: user?.phone_number || '', payout_email: user?.payout_email || '' });
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateMe(form),
    onSuccess: () => { refreshUser(); setEditing(false); },
    onError: (err) => setError(getApiError(err).message),
  });

  if (!user) { navigate('/login'); return null; }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title={t('account.title')} />

      {/* Profile Header */}
      <Card className="mb-4 text-center animate-fade-in-up">
        <div className="flex flex-col items-center">
          <Avatar
            src={user.avatar_url}
            firstName={user.first_name}
            lastName={user.last_name}
            size="xl"
            ring
          />
          <h2 className="mt-4 text-xl font-extrabold">{user.first_name} {user.last_name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          {!user.payout_email && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {t('account.payoutEmailMissing')}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-4 stagger-children">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card hover padding="sm" className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.color}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold flex-1">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Edit Profile */}
      <Card className="mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{t('account.info')}</h3>
          <button onClick={() => setEditing(!editing)} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
            {editing ? t('account.cancelEdit') : t('account.edit')}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-xl animate-scale-in">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input id="fn" label={t('account.firstName')} value={form.first_name} onChange={set('first_name')} />
              <Input id="ln" label={t('account.lastName')} value={form.last_name} onChange={set('last_name')} />
            </div>
            <Input id="phone" label={t('account.phone')} value={form.phone_number} onChange={set('phone_number')} />
            <Input id="payout" label={t('account.payoutEmail')} type="email" value={form.payout_email} onChange={set('payout_email')} />
            <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending} className="w-full">
              {t('account.save')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{t('account.phone')}</span>
              <span className="text-sm font-medium">{user.phone_number || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">{t('account.payoutEmail')}</span>
              <span className="text-sm font-medium">{user.payout_email || '—'}</span>
            </div>
          </div>
        )}
      </Card>

      <Button onClick={logout} variant="destructive" className="w-full">
        {t('account.logout')}
      </Button>
    </div>
  );
}
