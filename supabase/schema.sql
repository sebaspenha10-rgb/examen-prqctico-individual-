-- Esquema SQL para Supabase: 12 · Talleres de reparación electrónica
-- Ejecutar en Supabase -> SQL Editor

create table if not exists public.talleres (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  latitud double precision not null check (latitud >= -90 and latitud <= 90),
  longitud double precision not null check (longitud >= -180 and longitud <= 180),
  horario text not null,
  barrio text not null,
  especialidad text not null check (especialidad in ('computadoras', 'celulares')),
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS) con acceso público para la práctica académica
alter table public.talleres enable row level security;

create policy "Permitir lectura publica de talleres"
  on public.talleres for select
  using (true);

create policy "Permitir insercion publica de talleres"
  on public.talleres for insert
  with check (true);

create policy "Permitir actualizacion publica de talleres"
  on public.talleres for update
  using (true)
  with check (true);

create policy "Permitir eliminacion publica de talleres"
  on public.talleres for delete
  using (true);

-- Datos iniciales de ejemplo (3 puntos distintos cubriendo ambas especialidades)
insert into public.talleres (nombre, latitud, longitud, horario, barrio, especialidad)
values
  ('TechFix Asunción', -25.2918, -57.5812, 'Lun a Vie 08:30 - 18:30', 'Villa Morra', 'computadoras'),
  ('CelularLab Centro', -25.2822, -57.6351, 'Lun a Sáb 09:00 - 19:00', 'Centro', 'celulares'),
  ('MicroChip Reparaciones', -25.2874, -57.6579, 'Lun a Vie 08:00 - 17:30', 'Sajonia', 'computadoras');
