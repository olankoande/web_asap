import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripsApi, bookingsApi, deliveriesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Car, Users, Package, ArrowRight, Calendar, MapPin, Plus,
  Clock, Truck, MessageCircle, Search,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Tabs from '@/components/ui/Tabs';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import type { Trip, Booking, Delivery } from '@/lib/types';
import { useState } from 'react';

type Tab = 'overview' | 'trips' | 'bookings' | 'deliveries';

const bookingStatusMap: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'primary' | 'muted' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  accepted: { label: 'Accepté', variant: 'success' },
  rejected: { label: 'Refusé', variant: 'destructive' },
  paid: { label: 'Payé', variant: 'primary' },
  cancelled: { label: 'Annulé', variant: 'muted' },
  completed: { label: 'Terminé', variant: 'success' },
};

const deliveryStatusMap: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'primary' | 'accent' | 'muted' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  accepted: { label: 'Accepté', variant: 'success' },
  rejected: { label: 'Refusé', variant: 'destructive' },
  paid: { label: 'Payé', variant: 'primary' },
  in_transit: { label: 'En transit', variant: 'primary' },
  delivered: { label: 'Livré', variant: 'accent' },
  received: { label: 'Reçu', variant: 'success' },
  cancelled: { label: 'Annulé', variant: 'muted' },
  disputed: { label: 'Litige', variant: 'destructive' },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.myBookings().then((r) => r.data),
    enabled: !!user,
  });

  const { data: driverBookings, isLoading: driverBookingsLoading } = useQuery({
    queryKey: ['driver-bookings'],
    queryFn: () => bookingsApi.driverBookings().then((r) => r.data),
    enabled: !!user,
  });

  const { data: sentDeliveries, isLoading: sentLoading } = useQuery({
    queryKey: ['deliveries-sent'],
    queryFn: () => deliveriesApi.mySent().then((r) => r.data),
    enabled: !!user,
  });

  const { data: receivedDeliveries, isLoading: receivedLoading } = useQuery({
    queryKey: ['deliveries-received'],
    queryFn: () => deliveriesApi.myReceived().then((r) => r.data),
    enabled: !!user,
  });

  const { data: tripsData } = useQuery({
    queryKey: ['trips-search', {}],
    queryFn: () => tripsApi.search({}).then((r) => r.data),
  });

  const allTrips: Trip[] = tripsData?.data ?? (Array.isArray(tripsData) ? tripsData : []);
  const allBookings: Booking[] = myBookings ?? [];
  const allDriverBookings: Booking[] = driverBookings ?? [];
  const allSentDeliveries: Delivery[] = sentDeliveries ?? [];
  const allReceivedDeliveries: Delivery[] = receivedDeliveries ?? [];
  const allDeliveries = [...allSentDeliveries, ...allReceivedDeliveries];

  if (!user) {
    return (
      <EmptyState
        icon={<Car className="w-8 h-8" />}
        title={t('dashboard.loginRequired')}
        description={t('dashboard.loginHint')}
        action={<Link to="/login"><Button>{t('common.login')}</Button></Link>}
        className="mt-12"
      />
    );
  }

  const tabs = [
    { key: 'overview', label: t('dashboard.tabs.overview'), icon: <Car className="w-4 h-4" /> },
    { key: 'trips', label: t('dashboard.tabs.trips'), icon: <MapPin className="w-4 h-4" /> },
    { key: 'bookings', label: t('dashboard.tabs.bookings'), icon: <Users className="w-4 h-4" /> },
    { key: 'deliveries', label: t('dashboard.tabs.deliveries'), icon: <Package className="w-4 h-4" /> },
  ];

  const pendingDriverBookings = allDriverBookings.filter(b => b.status === 'pending');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        title={t('dashboard.hello', { name: user.first_name })}
        subtitle={t('dashboard.subtitle')}
        action={
          <Link to="/driver/trips/new">
            <Button size="sm"><Plus className="w-4 h-4" /> {t('dashboard.newTrip')}</Button>
          </Link>
        }
      />

      {/* Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} className="mb-6" />

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 stagger-children">
            <StatCard
              icon={<MapPin className="w-5 h-5 text-primary" />}
              label={t('dashboard.stats.availableTrips')}
              value={allTrips.length}
              color="bg-primary/10"
              onClick={() => setTab('trips')}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-accent" />}
              label={t('dashboard.stats.myBookings')}
              value={allBookings.length}
              color="bg-accent/10"
              onClick={() => setTab('bookings')}
            />
            <StatCard
              icon={<Truck className="w-5 h-5 text-warning" />}
              label={t('dashboard.stats.receivedBookings')}
              value={allDriverBookings.length}
              color="bg-warning/10"
              onClick={() => setTab('bookings')}
            />
            <StatCard
              icon={<Package className="w-5 h-5 text-success" />}
              label={t('dashboard.stats.deliveries')}
              value={allDeliveries.length}
              color="bg-success/10"
              onClick={() => setTab('deliveries')}
            />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/search">
              <Card hover padding="sm" className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">{t('dashboard.quickActions.search')}</span>
              </Card>
            </Link>
            <Link to="/messages">
              <Card hover padding="sm" className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-semibold">{t('dashboard.quickActions.messages')}</span>
              </Card>
            </Link>
          </div>

          {/* Pending actions */}
          {pendingDriverBookings.length > 0 && (
            <Card variant="gradient" className="border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <h3 className="text-sm font-bold">
                  {t('dashboard.pendingBookings', { count: pendingDriverBookings.length })}
                </h3>
              </div>
              <div className="space-y-2">
                {pendingDriverBookings.slice(0, 3).map((b) => (
                  <Link key={b.id} to={`/booking/${b.id}`}>
                    <Card hover padding="sm" className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={b.passenger?.first_name} lastName={b.passenger?.last_name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold">{b.passenger?.first_name} {b.passenger?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{b.seats_requested} place(s) · {formatCurrency(b.amount_total)}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Trips Tab */}
      {tab === 'trips' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('dashboard.availableTrips')}</h2>
            <Link to="/search"><Button size="sm" variant="outline">{t('common.seeAll')}</Button></Link>
          </div>

          {allTrips.length === 0 && (
            <EmptyState icon={<MapPin className="w-8 h-8" />} title={t('dashboard.noTrips')} />
          )}

          <div className="space-y-3 stagger-children">
            {allTrips.slice(0, 10).map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold truncate">{trip.origin_address}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold truncate">{trip.destination_address}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="default" icon={<Calendar className="w-3 h-3" />}>{formatDate(trip.departure_time)}</Badge>
                        <Badge variant="primary" icon={<Users className="w-3 h-3" />}>{trip.available_seats ?? 0} places</Badge>
                        {trip.accepts_parcels && <Badge variant="accent" icon={<Package className="w-3 h-3" />}>Colis</Badge>}
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-gradient ml-3">{formatCurrency(trip.price_per_seat)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Mes réservations */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> {t('dashboard.myBookings')}
            </h2>
            {bookingsLoading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}
            {!bookingsLoading && allBookings.length === 0 && (
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title={t('dashboard.noBookings')}
                action={<Link to="/search"><Button size="sm" variant="outline">{t('dashboard.searchTrip')}</Button></Link>}
                className="py-8"
              />
            )}
            <div className="space-y-2 stagger-children">
              {allBookings.map((b) => {
                const st = bookingStatusMap[b.status] || bookingStatusMap.pending;
                return (
                  <Link key={b.id} to={`/booking/${b.id}`}>
                    <Card hover padding="sm" className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          {b.trip && (
                            <p className="text-sm font-semibold flex items-center gap-1 truncate">
                              {b.trip.origin_address} <ArrowRight className="w-3 h-3 shrink-0" /> {b.trip.destination_address}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{b.seats_requested} place(s) · {formatCurrency(b.amount_total)} · {formatDate(b.created_at)}</p>
                        </div>
                        <Badge variant={st.variant} dot>{st.label}</Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Réservations reçues */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-warning" /> {t('dashboard.receivedBookings')}
            </h2>
            {driverBookingsLoading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}
            {!driverBookingsLoading && allDriverBookings.length === 0 && (
              <EmptyState
                icon={<Truck className="w-8 h-8" />}
                title={t('dashboard.noReceivedBookings')}
                action={<Link to="/driver/trips/new"><Button size="sm" variant="outline">{t('dashboard.createTrip')}</Button></Link>}
                className="py-8"
              />
            )}
            <div className="space-y-2 stagger-children">
              {allDriverBookings.map((b) => {
                const st = bookingStatusMap[b.status] || bookingStatusMap.pending;
                return (
                  <Link key={b.id} to={`/booking/${b.id}`}>
                    <Card hover padding="sm" className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={b.passenger?.first_name} lastName={b.passenger?.last_name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold">{b.passenger?.first_name} {b.passenger?.last_name}</p>
                            <p className="text-xs text-muted-foreground">{b.seats_requested} place(s) · {formatCurrency(b.amount_total)}</p>
                          </div>
                        </div>
                        <Badge variant={st.variant} dot>{st.label}</Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Tab */}
      {tab === 'deliveries' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> {t('dashboard.sentParcels')}
            </h2>
            {sentLoading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}
            {!sentLoading && allSentDeliveries.length === 0 && (
              <EmptyState icon={<Package className="w-8 h-8" />} title={t('dashboard.noSentParcels')} className="py-8" />
            )}
            <div className="space-y-2 stagger-children">
              {allSentDeliveries.map((d) => {
                const st = deliveryStatusMap[d.status] || deliveryStatusMap.pending;
                return (
                  <Card key={d.id} padding="sm" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {d.trip && (
                          <Link to={`/trips/${d.trip_id}`} className="text-sm font-semibold flex items-center gap-1 hover:text-primary truncate">
                            {d.trip.origin_address} <ArrowRight className="w-3 h-3 shrink-0" /> {d.trip.destination_address}
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {d.parcels && `${d.parcels.size_category} · `}
                          {d.amount_total != null && formatCurrency(d.amount_total)} · {formatDate(d.created_at)}
                        </p>
                      </div>
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-success" /> {t('dashboard.receivedParcels')}
            </h2>
            {receivedLoading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}
            {!receivedLoading && allReceivedDeliveries.length === 0 && (
              <EmptyState icon={<Package className="w-8 h-8" />} title={t('dashboard.noReceivedParcels')} className="py-8" />
            )}
            <div className="space-y-2 stagger-children">
              {allReceivedDeliveries.map((d) => {
                const st = deliveryStatusMap[d.status] || deliveryStatusMap.pending;
                return (
                  <Card key={d.id} padding="sm" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {d.trip && (
                          <Link to={`/trips/${d.trip_id}`} className="text-sm font-semibold flex items-center gap-1 hover:text-primary truncate">
                            {d.trip.origin_address} <ArrowRight className="w-3 h-3 shrink-0" /> {d.trip.destination_address}
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          De {d.sender?.first_name} {d.sender?.last_name} · {formatDate(d.created_at)}
                        </p>
                      </div>
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Link to="/deliveries">
            <Button variant="outline" className="w-full">{t('dashboard.fullParcelManagement')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
