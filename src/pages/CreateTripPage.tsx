import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, vehiclesApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import { geocodeCity, getDistance, suggestPrice, suggestParcelPrice } from '@/lib/openroute';
import { ArrowLeft, MapPin, Calendar, Package, Car, Zap, Route, DollarSign, Info, Plus, X, Snowflake } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// ─── Villes pour autocomplétion ───
const CITIES = [
  'Montréal, QC', 'Toronto, ON', 'Vancouver, BC', 'Calgary, AB', 'Edmonton, AB',
  'Ottawa, ON', 'Winnipeg, MB', 'Québec, QC', 'Hamilton, ON', 'Kitchener, ON',
  'London, ON', 'Halifax, NS', 'Victoria, BC', 'Oshawa, ON', 'Windsor, ON',
  'Saskatoon, SK', 'Regina, SK', 'Sherbrooke, QC', 'Trois-Rivières, QC', 'Moncton, NB',
  'Gatineau, QC', 'Laval, QC', 'Longueuil, QC', 'Lévis, QC', 'Drummondville, QC',
  'Granby, QC', 'Saint-Hyacinthe, QC', 'Rimouski, QC', 'Saguenay, QC',
  'Mississauga, ON', 'Brampton, ON', 'Markham, ON', 'Vaughan, ON',
  'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba',
  'Abidjan', 'Yamoussoukro', 'Bouaké', 'Bamako', 'Conakry',
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille',
  'Bruxelles', 'Genève', 'Zurich', 'Lausanne',
];

function CityInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  const filter = (input: string) => {
    if (!input || input.length < 2) return [];
    const lower = input.toLowerCase();
    return CITIES.filter((c) => c.toLowerCase().includes(lower)).slice(0, 6);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary" />
        <input
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            const f = filter(e.target.value);
            setSuggestions(f);
            setShow(f.length > 0);
          }}
          onFocus={() => {
            const f = filter(value);
            if (f.length > 0) { setSuggestions(f); setShow(true); }
          }}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          autoComplete="off"
        />
      </div>
      {show && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 bg-white border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1">
          {suggestions.map((city) => (
            <li key={city} className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary" onMouseDown={() => { onChange(city); setShow(false); }}>
              <MapPin className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />{city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: new Date().getFullYear().toString(), color: '', plate: '', seats_count: '4', has_ac: false });
  const [vehicleError, setVehicleError] = useState('');

  const [form, setForm] = useState({
    vehicle_id: '',
    origin_address: '',
    destination_address: '',
    departure_time: '',
    available_seats: '4',
    price_per_seat: '',
    accepts_parcels: false,
    parcel_price: '',
    instant_delivery: false,
    notes: '',
  });

  // ─── Distance & prix suggéré ───
  const [routeInfo, setRouteInfo] = useState<{
    distance_km: number;
    duration_min: number;
    suggested_price: number;
    min_price: number;
    max_price: number;
    parcel_price: number;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculateRoute = useCallback(async () => {
    if (!form.origin_address || !form.destination_address) {
      setRouteInfo(null);
      return;
    }

    setCalculating(true);
    try {
      const fromCoords = await geocodeCity(form.origin_address);
      const toCoords = await geocodeCity(form.destination_address);

      if (fromCoords && toCoords) {
        const dist = await getDistance(fromCoords, toCoords);
        if (dist) {
          const priceInfo = suggestPrice(dist.distance_km);
          const parcelPrice = suggestParcelPrice(dist.distance_km);
          setRouteInfo({
            distance_km: dist.distance_km,
            duration_min: dist.duration_min,
            ...priceInfo,
            parcel_price: parcelPrice,
          });
        }
      }
    } catch {
      // Silently fail
    }
    setCalculating(false);
  }, [form.origin_address, form.destination_address]);

  // Recalculer quand les villes changent (avec debounce)
  useEffect(() => {
    const timer = setTimeout(calculateRoute, 800);
    return () => clearTimeout(timer);
  }, [calculateRoute]);

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  });

  const addVehicleMutation = useMutation({
    mutationFn: () =>
      vehiclesApi.create({
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year ? Number(vehicleForm.year) : null,
        color: vehicleForm.color || null,
        plate: vehicleForm.plate || null,
        seats_count: Number(vehicleForm.seats_count) || 4,
        has_ac: vehicleForm.has_ac,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setForm((p) => ({ ...p, vehicle_id: res.data.id }));
      setShowAddVehicle(false);
      setVehicleForm({ make: '', model: '', year: new Date().getFullYear().toString(), color: '', plate: '', seats_count: '4', has_ac: false });
      setVehicleError('');
    },
    onError: (err) => setVehicleError(getApiError(err).message),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      return tripsApi.create({
        vehicle_id: form.vehicle_id,
        origin_address: form.origin_address,
        origin_lat: 0,
        origin_lng: 0,
        destination_address: form.destination_address,
        destination_lat: 0,
        destination_lng: 0,
        departure_time: new Date(form.departure_time).toISOString(),
        available_seats: Number(form.available_seats),
        price_per_seat: parseFloat(Number(form.price_per_seat).toFixed(2)),
        accepts_parcels: form.accepts_parcels,
        parcel_price: form.parcel_price ? parseFloat(Number(form.parcel_price).toFixed(2)) : undefined,
      });
    },
    onSuccess: (res) => {
      tripsApi.publish(res.data.id).then(() => {
        navigate(`/trips/${res.data.id}`);
      }).catch(() => {
        navigate(`/trips/${res.data.id}`);
      });
    },
    onError: (err) => setError(getApiError(err).message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.vehicle_id) { setError('Veuillez sélectionner un véhicule'); return; }
    if (!form.origin_address) { setError('Veuillez saisir une ville de départ'); return; }
    if (!form.destination_address) { setError('Veuillez saisir une ville de destination'); return; }
    if (!form.departure_time) { setError('Veuillez saisir une date de départ'); return; }
    if (!form.price_per_seat || Number(form.price_per_seat) <= 0) { setError('Veuillez saisir un prix par place'); return; }

    createMutation.mutate();
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const applySuggestedPrice = () => {
    if (routeInfo) {
      setForm((p) => ({ ...p, price_per_seat: routeInfo.suggested_price.toFixed(2) }));
    }
  };

  const applySuggestedParcelPrice = () => {
    if (routeInfo) {
      setForm((p) => ({ ...p, parcel_price: routeInfo.parcel_price.toFixed(2) }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-6">Créer un trajet</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Véhicule */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Car className="w-4 h-4 text-primary" /> Véhicule</h3>
            {!showAddVehicle && (
              <button type="button" onClick={() => setShowAddVehicle(true)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Ajouter
              </button>
            )}
          </div>

          {vehiclesLoading ? (
            <div className="skeleton h-11 rounded-xl" />
          ) : !showAddVehicle ? (
            <>
              {vehicles && vehicles.length > 0 ? (
                <select
                  value={form.vehicle_id}
                  onChange={set('vehicle_id')}
                  className="w-full h-11 px-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.make} {v.model}{v.color ? ` · ${v.color}` : ''}{v.plate ? ` · ${v.plate}` : ''}</option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Aucun véhicule enregistré</p>
                  <button type="button" onClick={() => setShowAddVehicle(true)} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                    <Plus className="w-4 h-4" /> Ajouter un véhicule
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Nouveau véhicule</span>
                <button type="button" onClick={() => { setShowAddVehicle(false); setVehicleError(''); }} className="p-1 hover:bg-secondary rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {vehicleError && <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg">{vehicleError}</div>}
              <div className="grid grid-cols-2 gap-2">
                <Input id="v_make" label="Marque *" placeholder="Toyota" value={vehicleForm.make} onChange={(e) => setVehicleForm((p) => ({ ...p, make: e.target.value }))} />
                <Input id="v_model" label="Modèle *" placeholder="Corolla" value={vehicleForm.model} onChange={(e) => setVehicleForm((p) => ({ ...p, model: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input id="v_year" label="Année" type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm((p) => ({ ...p, year: e.target.value }))} />
                <Input id="v_color" label="Couleur" placeholder="Noir" value={vehicleForm.color} onChange={(e) => setVehicleForm((p) => ({ ...p, color: e.target.value }))} />
                <Input id="v_plate" label="Plaque" placeholder="ABC 123" value={vehicleForm.plate} onChange={(e) => setVehicleForm((p) => ({ ...p, plate: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input id="v_seats" label="Places" type="number" min="1" max="50" value={vehicleForm.seats_count} onChange={(e) => setVehicleForm((p) => ({ ...p, seats_count: e.target.value }))} />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={vehicleForm.has_ac} onChange={(e) => setVehicleForm((p) => ({ ...p, has_ac: e.target.checked }))} className="accent-primary w-4 h-4" />
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">Clim</span>
                  </label>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full"
                loading={addVehicleMutation.isPending}
                onClick={() => {
                  setVehicleError('');
                  if (!vehicleForm.make.trim()) { setVehicleError('La marque est requise'); return; }
                  if (!vehicleForm.model.trim()) { setVehicleError('Le modèle est requis'); return; }
                  addVehicleMutation.mutate();
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Enregistrer le véhicule
              </Button>
            </div>
          )}
        </div>

        {/* Itinéraire */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Itinéraire</h3>
          <CityInput
            value={form.origin_address}
            onChange={(v) => setForm((p) => ({ ...p, origin_address: v }))}
            placeholder="Ville de départ"
            label="Départ"
          />
          <CityInput
            value={form.destination_address}
            onChange={(v) => setForm((p) => ({ ...p, destination_address: v }))}
            placeholder="Ville de destination"
            label="Destination"
          />

          {/* Info distance */}
          {calculating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Route className="w-3.5 h-3.5" /> Calcul de la distance...
            </div>
          )}
          {routeInfo && !calculating && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Route className="w-4 h-4" /> {routeInfo.distance_km} km
                </span>
                <span className="text-muted-foreground">
                  ≈ {Math.floor(routeInfo.duration_min / 60)}h{String(routeInfo.duration_min % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                Prix suggéré : <strong className="text-primary">{routeInfo.suggested_price.toFixed(2)} $</strong> / place
                <span className="text-muted-foreground/60">(min {routeInfo.min_price.toFixed(2)} $ — max {routeInfo.max_price.toFixed(2)} $)</span>
              </div>
            </div>
          )}
        </div>

        {/* Date et places */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date et places</h3>
          <Input
            id="departure_time"
            label="Date et heure de départ"
            type="datetime-local"
            value={form.departure_time}
            onChange={set('departure_time')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="available_seats"
              label="Places disponibles"
              type="number"
              min="1"
              max="50"
              value={form.available_seats}
              onChange={set('available_seats')}
            />
            <div>
              <Input
                id="price_per_seat"
                label="Prix par place ($)"
                type="number"
                min="0"
                step="0.01"
                value={form.price_per_seat}
                onChange={set('price_per_seat')}
                placeholder="Ex: 25.00"
              />
              {routeInfo && (
                <button
                  type="button"
                  onClick={applySuggestedPrice}
                  className="mt-1 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Zap className="w-3 h-3" /> Appliquer {routeInfo.suggested_price.toFixed(2)} $
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colis */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accepts_parcels}
              onChange={(e) => setForm((p) => ({ ...p, accepts_parcels: e.target.checked }))}
              className="accent-primary w-4 h-4"
            />
            <Package className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Accepter les colis</span>
          </label>
          {form.accepts_parcels && (
            <>
              <div>
                <Input
                  id="parcel_price"
                  label="Prix par colis ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.parcel_price}
                  onChange={set('parcel_price')}
                  placeholder="Ex: 10.00"
                />
                {routeInfo && (
                  <button
                    type="button"
                    onClick={applySuggestedParcelPrice}
                    className="mt-1 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <DollarSign className="w-3 h-3" /> Suggéré : {routeInfo.parcel_price.toFixed(2)} $
                  </button>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-2 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <input
                  type="checkbox"
                  checked={form.instant_delivery}
                  onChange={(e) => setForm((p) => ({ ...p, instant_delivery: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <Zap className="w-4 h-4 text-warning" />
                <div>
                  <span className="text-sm font-medium">Livraison instantanée</span>
                  <p className="text-xs text-muted-foreground">Les demandes de livraison seront acceptées automatiquement</p>
                </div>
              </label>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optionnel)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full h-24 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Informations supplémentaires pour les passagers..."
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={createMutation.isPending}>
          Créer et publier le trajet
        </Button>
      </form>
    </div>
  );
}
