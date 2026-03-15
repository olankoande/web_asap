import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { deliveriesApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Package, ArrowRight, Send, Inbox, Truck, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Delivery } from '@/lib/types';

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-warning/10 text-warning', icon: <Clock className="w-3.5 h-3.5" /> },
  accepted: { label: 'Accepté', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: 'Refusé', color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-3.5 h-3.5" /> },
  paid: { label: 'Payé', color: 'bg-primary/10 text-primary', icon: <DollarSign className="w-3.5 h-3.5" /> },
  in_transit: { label: 'En transit', color: 'bg-primary/10 text-primary', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: 'Livré', color: 'bg-accent/10 text-accent', icon: <Package className="w-3.5 h-3.5" /> },
  received: { label: 'Reçu', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Annulé', color: 'bg-muted text-muted-foreground', icon: <XCircle className="w-3.5 h-3.5" /> },
  disputed: { label: 'Litige', color: 'bg-destructive/10 text-destructive', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const sizeLabels: Record<string, string> = {
  XS: 'Très petit',
  S: 'Petit',
  M: 'Moyen',
  L: 'Grand',
};

function DeliveryCard({ delivery, type }: { delivery: Delivery; type: 'sent' | 'received' }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const status = statusLabels[delivery.status] || statusLabels.pending;

  const cancelMutation = useMutation({
    mutationFn: () => deliveriesApi.cancel(delivery.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries-sent'] });
      qc.invalidateQueries({ queryKey: ['deliveries-received'] });
    },
    onError: (err) => setError(getApiError(err).message),
  });

  const confirmMutation = useMutation({
    mutationFn: () => deliveriesApi.confirmReceipt(delivery.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries-received'] });
      qc.invalidateQueries({ queryKey: ['deliveries-sent'] });
    },
    onError: (err) => setError(getApiError(err).message),
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {error && <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg">{error}</div>}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {delivery.trip && (
            <Link to={`/trips/${delivery.trip_id}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <span className="font-medium truncate">{delivery.trip.origin_address || delivery.trip.from_address || delivery.trip.from_city}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{delivery.trip.destination_address || delivery.trip.to_address || delivery.trip.to_city}</span>
            </Link>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{formatDate(delivery.created_at)}</span>
            {delivery.parcels && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {sizeLabels[delivery.parcels.size_category] || delivery.parcels.size_category}
              </span>
            )}
            {delivery.recipient && type === 'sent' && (
              <span>→ {delivery.recipient.first_name} {delivery.recipient.last_name}</span>
            )}
            {delivery.sender && type === 'received' && (
              <span>← {delivery.sender.first_name} {delivery.sender.last_name}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
          {delivery.amount_total != null && (
            <span className="text-sm font-semibold text-primary">{formatCurrency(delivery.amount_total)}</span>
          )}
        </div>
      </div>

      {/* Détails du colis */}
      {delivery.parcels && (
        <div className="bg-secondary/50 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-muted-foreground" />
              Taille : {sizeLabels[delivery.parcels.size_category] || delivery.parcels.size_category}
            </span>
            {delivery.parcels.weight_kg && <span className="text-muted-foreground">{delivery.parcels.weight_kg} kg</span>}
          </div>
          {delivery.parcels.instructions && (
            <p className="text-xs text-muted-foreground">{delivery.parcels.instructions}</p>
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

      {/* Received at */}
      {delivery.received_at && (
        <p className="text-xs text-success">✅ Réception confirmée le {formatDate(delivery.received_at)}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {/* Bouton Contacter — ouvre la conversation de livraison */}
        {delivery.status !== 'cancelled' && delivery.status !== 'rejected' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/messages?delivery_id=${delivery.id}`)}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Contacter
          </Button>
        )}
        {type === 'sent' && delivery.status === 'pending' && (
          <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
            Annuler
          </Button>
        )}
        {type === 'received' && delivery.status === 'delivered' && (
          <Button size="sm" onClick={() => confirmMutation.mutate()} loading={confirmMutation.isPending}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Confirmer la réception
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');

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

  const deliveries = tab === 'sent' ? sentDeliveries : receivedDeliveries;
  const isLoading = tab === 'sent' ? sentLoading : receivedLoading;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-lg font-medium text-muted-foreground">Connectez-vous pour gérer vos colis</p>
        <Link to="/login">
          <Button className="mt-4">Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Mes colis</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tab === 'sent' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send className="w-4 h-4" />
          Envoyés
          {sentDeliveries && sentDeliveries.length > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{sentDeliveries.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('received')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
            tab === 'received' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Reçus
          {receivedDeliveries && receivedDeliveries.length > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{receivedDeliveries.length}</span>
          )}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && deliveries && deliveries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">
            {tab === 'sent' ? 'Aucun colis envoyé' : 'Aucun colis reçu'}
          </p>
          <p className="text-sm mt-1">
            {tab === 'sent'
              ? 'Recherchez un trajet acceptant les colis pour envoyer un colis'
              : 'Vos colis reçus apparaîtront ici'}
          </p>
          {tab === 'sent' && (
            <Link to="/search">
              <Button className="mt-4" variant="outline">Rechercher un trajet</Button>
            </Link>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && deliveries && deliveries.length > 0 && (
        <div className="space-y-3">
          {(deliveries as Delivery[]).map((d) => (
            <DeliveryCard key={d.id} delivery={d} type={tab} />
          ))}
        </div>
      )}
    </div>
  );
}
