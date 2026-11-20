import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Taller } from '../types/taller';

const STORAGE_KEY = 'talleres_reparacion_electronica_v1';

const SEED_TALLERES: Taller[] = [
  {
    id: 'a1b2c3d4-1111-4000-8000-000000000001',
    nombre: 'TechFix Asunción',
    latitud: -25.2918,
    longitud: -57.5812,
    horario: 'Lun a Vie 08:30 - 18:30',
    barrio: 'Villa Morra',
    especialidad: 'computadoras',
    created_at: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-2222-4000-8000-000000000002',
    nombre: 'CelularLab Centro',
    latitud: -25.2822,
    longitud: -57.6351,
    horario: 'Lun a Sáb 09:00 - 19:00',
    barrio: 'Centro',
    especialidad: 'celulares',
    created_at: '2026-11-02T10:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-3333-4000-8000-000000000003',
    nombre: 'MicroChip Reparaciones',
    latitud: -25.2874,
    longitud: -57.6579,
    horario: 'Lun a Vie 08:00 - 17:30',
    barrio: 'Sajonia',
    especialidad: 'computadoras',
    created_at: '2026-11-03T10:00:00.000Z',
  },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasValidSupabaseConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl!.includes('your-project-id') &&
  !supabaseAnonKey!.includes('your-supabase-anon-key');

export const supabase: SupabaseClient | null = hasValidSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const isSupabaseConnected = Boolean(supabase);

function readLocalTalleres(): Taller[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TALLERES));
      return [...SEED_TALLERES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TALLERES));
      return [...SEED_TALLERES];
    }
    return parsed as Taller[];
  } catch {
    return [...SEED_TALLERES];
  }
}

function writeLocalTalleres(items: Taller[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function fetchTalleres(): Promise<Taller[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al consultar Supabase: ${error.message}`);
    }
    return (data ?? []) as Taller[];
  }

  return readLocalTalleres();
}

export async function createTaller(
  payload: Omit<Taller, 'id' | 'created_at'>
): Promise<Taller> {
  if (supabase) {
    const { data, error } = await supabase
      .from('talleres')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }
    return data as Taller;
  }

  const current = readLocalTalleres();
  const created: Taller = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  writeLocalTalleres([created, ...current]);
  return created;
}

export async function updateTaller(
  id: string,
  payload: Omit<Taller, 'id' | 'created_at'>
): Promise<Taller> {
  if (supabase) {
    const { data, error } = await supabase
      .from('talleres')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar en Supabase: ${error.message}`);
    }
    return data as Taller;
  }

  const current = readLocalTalleres();
  let updatedItem: Taller | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...payload };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error('No se encontró el registro para actualizar.');
  }

  writeLocalTalleres(next);
  return updatedItem;
}

export async function deleteTaller(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('talleres').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar en Supabase: ${error.message}`);
    }
    return;
  }

  const current = readLocalTalleres();
  writeLocalTalleres(current.filter((item) => item.id !== id));
}
