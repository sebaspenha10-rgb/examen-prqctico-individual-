import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Especialidad, Taller, TallerFormInput } from '../types/taller';
import { validateTallerForm, ValidationErrors } from '../lib/validation';

interface TallerFormModalProps {
  isOpen: boolean;
  editingTaller: Taller | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Taller, 'id' | 'created_at'>) => Promise<void>;
}

const EMPTY_FORM: TallerFormInput = {
  nombre: '',
  latitud: '',
  longitud: '',
  horario: '',
  barrio: '',
  especialidad: 'computadoras',
};

export function TallerFormModal({
  isOpen,
  editingTaller,
  isSubmitting,
  onClose,
  onSubmit,
}: TallerFormModalProps) {
  const [form, setForm] = useState<TallerFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTaller) {
        setForm({
          nombre: editingTaller.nombre,
          latitud: String(editingTaller.latitud),
          longitud: String(editingTaller.longitud),
          horario: editingTaller.horario,
          barrio: editingTaller.barrio,
          especialidad: editingTaller.especialidad,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, editingTaller]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof TallerFormInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTallerForm(form);
    if (!validation.isValid || !validation.parsed) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitError(null);
      await onSubmit(validation.parsed);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Ocurrió un error al guardar el taller.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="taller-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="taller-modal-title" className="text-lg font-semibold text-slate-900">
            {editingTaller ? 'Editar taller' : 'Nuevo taller de reparación'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label="Cerrar formulario"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {submitError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="taller-nombre"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nombre del taller
            </label>
            <input
              id="taller-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
              placeholder="Ej. TechFix Asunción"
              className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.nombre
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.nombre}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="taller-especialidad"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Especialidad
              </label>
              <select
                id="taller-especialidad"
                value={form.especialidad}
                onChange={(e) =>
                  handleFieldChange('especialidad', e.target.value as Especialidad)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="computadoras">Computadoras</option>
                <option value="celulares">Celulares</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="taller-barrio"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Barrio
              </label>
              <input
                id="taller-barrio"
                type="text"
                value={form.barrio}
                onChange={(e) => handleFieldChange('barrio', e.target.value)}
                placeholder="Ej. Villa Morra"
                className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.barrio
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              {errors.barrio && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.barrio}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="taller-horario"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Horario de atención
            </label>
            <input
              id="taller-horario"
              type="text"
              value={form.horario}
              onChange={(e) => handleFieldChange('horario', e.target.value)}
              placeholder="Ej. Lun a Vie 08:30 - 18:30"
              className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.horario
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {errors.horario && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.horario}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="taller-latitud"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Latitud (−90 a 90)
              </label>
              <input
                id="taller-latitud"
                type="text"
                inputMode="decimal"
                value={form.latitud}
                onChange={(e) => handleFieldChange('latitud', e.target.value)}
                placeholder="-25.2918"
                className={`w-full rounded-lg border px-3.5 py-2 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.latitud
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              {errors.latitud && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errors.latitud}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="taller-longitud"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Longitud (−180 a 180)
              </label>
              <input
                id="taller-longitud"
                type="text"
                inputMode="decimal"
                value={form.longitud}
                onChange={(e) => handleFieldChange('longitud', e.target.value)}
                placeholder="-57.5812"
                className={`w-full rounded-lg border px-3.5 py-2 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.longitud
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              {errors.longitud && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errors.longitud}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isSubmitting
                ? 'Guardando...'
                : editingTaller
                  ? 'Guardar cambios'
                  : 'Crear taller'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
