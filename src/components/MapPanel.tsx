import { ExternalLink, MapPin } from 'lucide-react';
import { Taller } from '../types/taller';

interface MapPanelProps {
  taller: Taller | null;
}

export function MapPanel({ taller }: MapPanelProps) {
  if (!taller) {
    return (
      <section className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center">
        <MapPin className="mb-3 h-8 w-8 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">
          Seleccioná un taller para ver su ubicación
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Al elegir un registro de la lista, el marcador se posicionará en sus
          coordenadas GPS exactas en Google Maps.
        </p>
      </section>
    );
  }

  const latFormatted = taller.latitud.toFixed(6);
  const lngFormatted = taller.longitud.toFixed(6);
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${taller.latitud},${taller.longitud}`
  )}&z=16&hl=es&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${taller.latitud},${taller.longitud}`
  )}`;

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {taller.nombre}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
            <span className="capitalize font-medium text-slate-800">
              {taller.especialidad}
            </span>
            <span aria-hidden="true">·</span>
            <span>Barrio {taller.barrio}</span>
            <span aria-hidden="true">·</span>
            <span>{taller.horario}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-500">Coordenadas GPS</div>
            <div className="font-mono text-xs font-medium tabular-nums text-slate-900">
              {latFormatted}, {lngFormatted}
            </div>
          </div>
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <span>Abrir en Maps</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-100">
        <iframe
          key={`${taller.id}-${taller.latitud}-${taller.longitud}`}
          title={`Ubicación en Google Maps de ${taller.nombre}`}
          src={embedUrl}
          className="h-full min-h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
