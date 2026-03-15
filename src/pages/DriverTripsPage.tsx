import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { bookingsApi, deliveriesApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, ArrowRight, Package, CheckCircle, XCircle, Truck, Clock, MapPin, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Booking, Delivery } from '@/lib/types';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-warning/10 text-warning' },
  accepted: { label: 'Accepté', color: 'bg-success/10 text-success' },
  rejected: { label: 'Refusé', color: 'bg-destructive/10 text-destructive' },
  paid: { label: 'Payé', color: 'bg-primary/10 text-primary' },
  in_transit: { label: 'En transit', color: 'bg-primary/10 text-primary' },
  delivered: { label: 'Livré', color: 'bg-accent/10 text-accent' },
  received: { label: 'Reçu', color: 'bg-success/10 text-success' },
  cancelled: { label: 'Annulé', color: 'bg-muted text-muted-foreground' },
};

const sizeLabels: Record<string, string> = { XS: 'Très petit', S: 'Petit', M: 'Moyen', L: 'Grand' };

function DriverDeliveryCard({ delivery }: { delivery: Delivery }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const status = statusLabels[delivery.status] || statusLabels.pending;

  const acceptMut = useMutation({
    mutationFn: () => deliveriesApi.accept(delivery.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-deliveries'] }),
    onError: (err) => setError(getApiError(err).message),
  });

  const rejectMut = useMutation({
    mutationFn: () => deliveriesApi.reject(delivery.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-deliveries'] }),
    onError: (err) => setError(getApiError(err).message),
  });

  const transitMut = useMutation({
    mutationFn: () => deliveriesApi.markInTransit(delivery.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-deliveries'] }),
    onError: (err) => setError(getApiError(err).message),
  });

  const deliveredMut = useMutation({
    mutationFn: () => deliveriesApi.markDelivered(delivery.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-deliveries'] }),
    onError: (err) => setError(getApiError(err).message),
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {error && <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg">{error}</div>}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {delivery.trip && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium truncate">{delivery.trip.origin_address || delivery.trip.from_address || delivery.trip.from_city}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{delivery.trip.destination_address || delivery.trip.to_address || delivery.trip.to_city}</span>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span><Clock className="w-3 h-3 inline mr-1" />{formatDate(delivery.created_at)}</span>
            {delivery.sender && (
              <span>De : {delivery.sender.first_name} {delivery.sender.last_name}</span>
            )}
            {delivery.recipient && (
              <span>→ {delivery.recipient.first_name} {delivery.recipient.last_name}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          {delivery.amount_total != null && delivery.amount_total > 0 && (
            <span className="text-sm font-semibold text-primary">{formatCurrency(delivery.amount_total)}</span>
          )}
        </div>
      </div>

      {/* Parcel info */}
      {delivery.parcels && (
        <div className="bg-secondary/50 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-muted-foreground" />
              {sizeLabels[delivery.parcels.size_category] || delivery.parcels.size_category}
            </span>
            {delivery.parcels.weight_kg && <span className="text-muted-foreground">{delivery.parcels.weight_kg} kg</span>}
            {delivery.parcels.declared_value && <span className="text-muted-foreground">Valeur : {formatCurrency(delivery.parcels.declared_value)}</span>}
          </div>
          {delivery.parcels.instructions && (
            <p className="text-xs text-muted-foreground italic">{delivery.parcels.instructions}</p>
          )}
        </div>
      )}

      {/* Notes */}
      {(delivery.pickup_notes || delivery.dropoff_notes) && (
        <div className="text-xs text-muted-foreground space-y-1">
          {delivery.pickup_notes && <p>📦 Ramassage : {delivery.pickup_notes}</p>}
          {delivery.dropoff_notes && <p>📍 Livraison : {delivery.dropoff_notes}</p>}
        </div>
      )}

      {/* Actions conducteur */}
      <div className="flex flex-wrap gap-2">
        {/* Bouton Contacter — ouvre la conversation de livraison */}
        {delivery.status !== 'cancelled' && delivery.status !== 'rejected' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/messages?delivery_id=${delivery.id}`)}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Contacter
          </Button>
        )}
        {delivery.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => acceptMut.mutate()} loading={acceptMut.isPending}>
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accepter
            </Button>
            <Button size="sm" variant="destructive" onClick={() => rejectMut.mutate()} loading={rejectMut.isPending}>
              <XCircle className="w-3.5 h-3.5 mr-1" /> Refuser
            </Button>
          </>
        )}
        {(delivery.status === 'accepted' || delivery.status === 'paid') && (
          <Button size="sm" onClick={() => transitMut.mutate()} loading={transitMut.isPending}>
            <Truck className="w-3.5 h-3.5 mr-1" /> Marquer en transit
          </Button>
        )}
        {delivery.status === 'in_transit' && (
          <Button size="sm" onClick={() => deliveredMut.mutate()} loading={deliveredMut.isPending}>
            <Package className="w-3.5 h-3.5 mr-1" /> Marquer livré
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DriverTripsPage() {
  const [tab, setTab] = useState<'bookings' | 'deliveries'>('bookings');

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['driver-bookings'],
    queryFn: () => bookingsApi.driverBookings().then((r) => r.data),
  });

  const { data: driverDeliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['driver-deliveries'],
    queryFn: () => deliveriesApi.driverDeliveries().then((r) => r.data),
  });

  const pendingDeliveries = driverDeliveries?.filter((d) => d.status === 'pending') || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Espace conducteur</h1>
        <Link to="/driver/trips/new">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nouveau trajet</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('bookings')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tab === 'bookings' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Réservations
          {bookings && bookings.length > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{bookings.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('deliveries')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tab === 'deliveries' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4" />
          Colis
          {pendingDeliveries.length > 0 && (
            <span className="bg-warning text-white text-xs px-1.5 py-0.5 rounded-full">{pendingDeliveries.length}</span>
          )}
        </button>
      </div>

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <>
          {bookingsLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}

          {bookings && bookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune réservation pour le moment</p>
              <p className="text-sm mt-1">Créez un trajet pour commencer</p>
            </div>
          )}

          {bookings && bookings.length > 0 && (
            <div className="space-y-3">
              {(bookings as Booking[]).map((b) => (
                <Link key={b.id} to={`/booking/${b.id}`} className="block bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.seats_requested} place{b.seats_requested > 1 ? 's' : ''} · {formatCurrency(b.amount_total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(b.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === 'pending' ? 'bg-warning/10 text-warning' : b.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {b.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Deliveries tab */}
      {tab === 'deliveries' && (
        <>
          {deliveriesLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>}

          {driverDeliveries && driverDeliveries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Aucune demande de colis</p>
              <p className="text-sm mt-1">Les demandes de livraison sur vos trajets apparaîtront ici</p>
            </div>
          )}

          {driverDeliveries && driverDeliveries.length > 0 && (
            <div className="space-y-3">
              {(driverDeliveries as Delivery[]).map((d) => (
                <DriverDeliveryCard key={d.id} delivery={d} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
