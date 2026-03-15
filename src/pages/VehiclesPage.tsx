import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/lib/api';
import { getApiError } from '@/lib/api-client';
import type { Vehicle } from '@/lib/types';
import { Car, Plus, Trash2, X, Snowflake, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface VehicleForm {
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  seats_count: string;
  has_ac: boolean;
  notes: string;
}

const emptyForm: VehicleForm = {
  make: '',
  model: '',
  year: new Date().getFullYear().toString(),
  color: '',
  plate: '',
  seats_count: '4',
  has_ac: false,
  notes: '',
};

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [error, setError] = useState('');

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      vehiclesApi.create({
        make: form.make,
        model: form.model,
        year: form.year ? Number(form.year) : null,
        color: form.color || null,
        plate: form.plate || null,
        seats_count: Number(form.seats_count) || 4,
        has_ac: form.has_ac,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setForm(emptyForm);
      setShowForm(false);
      setError('');
    },
    onError: (err) => setError(getApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.make.trim()) { setError('La marque est requise'); return; }
    if (!form.model.trim()) { setError('Le modèle est requis'); return; }
    createMutation.mutate();
  };

  const set = (key: keyof VehicleForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" /> Mes véhicules
        </h1>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nouveau véhicule</h2>
            <button
              onClick={() => { setShowForm(false); setError(''); setForm(emptyForm); }}
              className="p-1 hover:bg-secondary rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="make"
                label="Marque *"
                placeholder="Ex: Toyota"
                value={form.make}
                onChange={set('make')}
              />
              <Input
                id="model"
                label="Modèle *"
                placeholder="Ex: Corolla"
                value={form.model}
                onChange={set('model')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                id="year"
                label="Année"
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={set('year')}
              />
              <Input
                id="color"
                label="Couleur"
                placeholder="Ex: Noir"
                value={form.color}
                onChange={set('color')}
              />
              <Input
                id="plate"
                label="Plaque"
                placeholder="Ex: ABC 123"
                value={form.plate}
                onChange={set('plate')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="seats_count"
                label="Nombre de places"
                type="number"
                min="1"
                max="50"
                value={form.seats_count}
                onChange={set('seats_count')}
              />
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.has_ac}
                    onChange={(e) => setForm((p) => ({ ...p, has_ac: e.target.checked }))}
                    className="accent-primary w-4 h-4"
                  />
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Climatisation</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Notes (optionnel)
              </label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                className="w-full h-20 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Infos supplémentaires..."
              />
            </div>

            <Button type="submit" className="w-full" loading={createMutation.isPending}>
              Ajouter le véhicule
            </Button>
          </form>
        </div>
      )}

      {/* Liste des véhicules */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-5 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : vehicles && vehicles.length > 0 ? (
        <div className="space-y-3">
          {vehicles.map((v: Vehicle) => (
            <div
              key={v.id}
              className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {v.make} {v.model}
                    {v.year && <span className="text-muted-foreground font-normal"> · {v.year}</span>}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {v.color && <span>{v.color}</span>}
                    {v.plate && <span>🔖 {v.plate}</span>}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {v.seats_count} places
                    </span>
                    {v.has_ac && (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Snowflake className="w-3 h-3" /> Clim
                      </span>
                    )}
                  </div>
                  {v.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Supprimer ce véhicule ?')) {
                    deleteMutation.mutate(v.id);
                  }
                }}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun véhicule enregistré</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Ajoutez un véhicule pour pouvoir créer des trajets
          </p>
          {!showForm && (
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter un véhicule
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
