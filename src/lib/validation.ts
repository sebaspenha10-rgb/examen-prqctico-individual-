import { TallerFormInput } from '../types/taller';

export interface ValidationErrors {
  nombre?: string;
  latitud?: string;
  longitud?: string;
  horario?: string;
  barrio?: string;
  especialidad?: string;
}

const DECIMAL_NUMBER_REGEX = /^-?\d+(\.\d+)?$/;

export function validateCoordinate(
  rawValue: string,
  min: number,
  max: number,
  label: 'latitud' | 'longitud'
): { valid: boolean; numericValue?: number; error?: string } {
  const trimmed = rawValue.trim().replace(',', '.');

  if (!trimmed) {
    return {
      valid: false,
      error: `La ${label} es obligatoria y no puede estar vacía.`,
    };
  }

  if (!DECIMAL_NUMBER_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `La ${label} debe ser un número en grados decimales (ej. ${label === 'latitud' ? '-25.2867' : '-57.6470'}).`,
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      valid: false,
      error: `La ${label} ingresada no es un número válido.`,
    };
  }

  if (parsed < min || parsed > max) {
    return {
      valid: false,
      error: `La ${label} (${parsed}) está fuera de rango. Debe estar entre ${min} y ${max} grados decimales.`,
    };
  }

  return { valid: true, numericValue: parsed };
}

export function validateTallerForm(input: TallerFormInput): {
  isValid: boolean;
  errors: ValidationErrors;
  parsed?: {
    nombre: string;
    latitud: number;
    longitud: number;
    horario: string;
    barrio: string;
    especialidad: 'computadoras' | 'celulares';
  };
} {
  const errors: ValidationErrors = {};

  const nombre = input.nombre.trim();
  const horario = input.horario.trim();
  const barrio = input.barrio.trim();

  if (!nombre) {
    errors.nombre = 'Ingresá el nombre del taller.';
  }
  if (!barrio) {
    errors.barrio = 'Ingresá el barrio donde se ubica el taller.';
  }
  if (!horario) {
    errors.horario = 'Ingresá el horario de atención.';
  }
  if (input.especialidad !== 'computadoras' && input.especialidad !== 'celulares') {
    errors.especialidad = 'Seleccioná una especialidad válida (computadoras o celulares).';
  }

  const latCheck = validateCoordinate(input.latitud, -90, 90, 'latitud');
  if (!latCheck.valid) {
    errors.latitud = latCheck.error;
  }

  const lngCheck = validateCoordinate(input.longitud, -180, 180, 'longitud');
  if (!lngCheck.valid) {
    errors.longitud = lngCheck.error;
  }

  const isValid = Object.keys(errors).length === 0;
  if (!isValid || latCheck.numericValue === undefined || lngCheck.numericValue === undefined) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    parsed: {
      nombre,
      latitud: latCheck.numericValue,
      longitud: lngCheck.numericValue,
      horario,
      barrio,
      especialidad: input.especialidad,
    },
  };
}
