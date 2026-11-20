import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FiltroEspecialidad, Taller } from './types/taller';
import {
  createTaller,
  deleteTaller,
  fetchTalleres,
  updateTaller,
} from './lib/supabase';
import { TallerFormModal } from './components/TallerFormModal';
import { MapPanel } from './components/MapPanel';

export default function App() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<FiltroEspecialidad>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<Taller | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadTalleres = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTalleres();
      setTalleres(data);
      setSelectedId((prev) => {
        if (prev && data.some((item) => item.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los talleres.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTalleres();
  }, []);

  const counts = useMemo(() => {
    let computadoras = 0;
    let celulares = 0;
    for (const t of talleres) {
      if (t.especialidad === 'computadoras') computadoras++;
      if (t.especialidad === 'celulares') celulares++;
    }
    return {
      todos: talleres.length,
      computadoras,
      celulares,
    };
  }, [talleres]);

  const filteredTalleres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return talleres.filter((item) => {
      const matchesFilter = filtro === 'todos' || item.especialidad === filtro;
      const matchesQuery =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.barrio.toLowerCase().includes(q) ||
        item.horario.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [talleres, filtro, searchQuery]);

  const selectedTaller = useMemo(() => {
    if (!selectedId) return filteredTalleres[0] ?? null;
    return (
      talleres.find((item) => item.id === selectedId) ??
      filteredTalleres[0] ??
      null
    );
  }, [talleres, filteredTalleres, selectedId]);

  const handleOpenCreate = () => {
    setEditingTaller(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (taller: Taller) => {
    setEditingTaller(taller);
    setIsModalOpen(true);
  };

  const handleSaveTaller = async (payload: Omit<Taller, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingTaller) {
        const updated = await updateTaller(editingTaller.id, payload);
        setTalleres((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelectedId(updated.id);
      } else {
        const created = await createTaller(payload);
        setTalleres((prev) => [created, ...prev]);
        setSelectedId(created.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      setError(null);
      await deleteTaller(id);
      setTalleres((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (selectedId === id) {
          setSelectedId(next[0]?.id ?? null);
        }
        return next;
      });
      setConfirmDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el registro.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4">
          <a
            href="#inicio"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Talleres Electrónicos
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#listado"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Directorio
            </a>
            <a
              href="#mapa"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Mapa GPS
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo taller</span>
            </button>
          </div>
        </div>
      </header>

      <main id="inicio" className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Talleres de reparación electrónica
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Registrá talleres de computadoras y celulares, editá sus coordenadas GPS y verificá su ubicación exacta en Google Maps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1"
              role="group"
              aria-label="Filtrar por especialidad"
            >
              <button
                type="button"
                onClick={() => setFiltro('todos')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filtro === 'todos'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos (<span className="font-mono tabular-nums">{counts.todos}</span>)
              </button>
              <button
                type="button"
                onClick={() => setFiltro('computadoras')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filtro === 'computadoras'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Computadoras (<span className="font-mono tabular-nums">{counts.computadoras}</span>)
              </button>
              <button
                type="button"
                onClick={() => setFiltro('celulares')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filtro === 'celulares'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Celulares (<span className="font-mono tabular-nums">{counts.celulares}</span>)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o barrio..."
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          <section
            id="listado"
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">
                Puntos registrados
              </h2>
              <span className="font-mono text-xs tabular-nums text-slate-500">
                {filteredTalleres.length} de {talleres.length}
              </span>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-100 p-5">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="animate-pulse py-3.5 first:pt-0 last:pb-0">
                    <div className="h-4 w-44 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-64 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : filteredTalleres.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <p className="text-sm font-medium text-slate-900">
                  No hay talleres para mostrar
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Probá cambiando el filtro o creá un nuevo punto de reparación.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
                >
                  Agregar taller
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200/80 overflow-y-auto max-h-[600px]">
                {filteredTalleres.map((taller) => {
                  const isSelected = selectedTaller?.id === taller.id;
                  const isConfirmingDelete = confirmDeleteId === taller.id;

                  return (
                    <li
                      key={taller.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(taller.id)}
                          className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {taller.nombre}
                            </span>
                            {isSelected && (
                              <span className="text-xs font-medium text-blue-700 whitespace-nowrap shrink-0">
                                En mapa
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
                            <span className="capitalize font-medium text-slate-800">
                              {taller.especialidad}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{taller.barrio}</span>
                            <span aria-hidden="true">·</span>
                            <span>{taller.horario}</span>
                          </div>

                          <div className="mt-1.5 font-mono text-xs tabular-nums text-slate-500">
                            {taller.latitud.toFixed(6)}, {taller.longitud.toFixed(6)}
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(taller.id)}
                                className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 whitespace-nowrap"
                              >
                                Eliminar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(taller)}
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
                                aria-label={`Editar ${taller.nombre}`}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(taller.id)}
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                aria-label={`Eliminar ${taller.nombre}`}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div id="mapa" className="lg:col-span-7">
            <MapPanel taller={selectedTaller} />
          </div>
        </div>
      </main>

      <TallerFormModal
        isOpen={isModalOpen}
        editingTaller={editingTaller}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTaller}
      />
    </div>
  );
}
