export type Especialidad = 'computadoras' | 'celulares';

export interface Taller {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  horario: string;
  barrio: string;
  especialidad: Especialidad;
  created_at?: string;
}

export interface TallerFormInput {
  nombre: string;
  latitud: string;
  longitud: string;
  horario: string;
  barrio: string;
  especialidad: Especialidad;
}

export type FiltroEspecialidad = 'todos' | Especialidad;
