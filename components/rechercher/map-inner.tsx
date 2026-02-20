"use client";

import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Check, Home, MapPin, Star, Users } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Éviter toute exécution Leaflet côté serveur / avant montage DOM
const isBrowser = typeof window !== "undefined";
import type { Salle } from "@/lib/types/salle";
import {
  ILE_DE_FRANCE_BOUNDS,
  ILE_DE_FRANCE_CENTER,
  ILE_DE_FRANCE_ZOOM,
} from "@/config/region";

// Fix Leaflet default icon avec Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Badge maison + prix (bleu, icône blanche à gauche, prix à droite)
function createPriceMarkerIcon(pricePerDay: number) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;background:#2d435a;color:white;font-weight:600;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer">${svg}<span>${pricePerDay}€</span></div>`,
    className: "price-marker",
    iconSize: [80, 36],
    iconAnchor: [40, 36],
    popupAnchor: [0, 10],
  });
}

// Décalage aléatoire déterministe pour masquer la localisation exacte (~150–350 m)
const OFFSET_DEG = 0.002;
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i) | 0;
  return Math.abs(h);
}
function getObfuscatedCoords(lat: number, lng: number, salleId: string) {
  const h = hashId(salleId);
  const angle = (h % 360) * (Math.PI / 180);
  const dist = OFFSET_DEG * (0.5 + (h % 100) / 100);
  return {
    lat: lat + Math.cos(angle) * dist,
    lng: lng + Math.sin(angle) * dist,
  };
}

export function getCoords(salle: Salle, index: number) {
  const lat = Number(salle.lat);
  const lng = Number(salle.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return getObfuscatedCoords(lat, lng, salle.id);
  }
  return {
    lat: ILE_DE_FRANCE_CENTER.lat + (index % 3) * 0.01 - 0.01,
    lng: ILE_DE_FRANCE_CENTER.lng + Math.floor(index / 3) * 0.015 - 0.015,
  };
}

function MapPanController({
  salles,
  highlightedSalleId,
}: {
  salles: Salle[];
  highlightedSalleId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!highlightedSalleId) return;
    const idx = salles.findIndex((s) => s.id === highlightedSalleId);
    if (idx < 0) return;
    const coords = getCoords(salles[idx], idx);
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
    map.flyTo([coords.lat, coords.lng], Math.min(map.getZoom(), 15), { duration: 0.5 });
  }, [highlightedSalleId, salles, map]);
  return null;
}

const idfBounds = L.latLngBounds(
  [ILE_DE_FRANCE_BOUNDS[0][0], ILE_DE_FRANCE_BOUNDS[0][1]],
  [ILE_DE_FRANCE_BOUNDS[1][0], ILE_DE_FRANCE_BOUNDS[1][1]],
);

type RatingStats = Record<string, { avg: number; count: number }>;

export function MapInner({
  salles,
  highlightedSalleId = null,
  ratingStats = {},
}: {
  salles: Salle[];
  highlightedSalleId?: string | null;
  ratingStats?: RatingStats;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isBrowser) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 lg:aspect-auto lg:h-full lg:min-h-[500px]">
        <p className="text-sm text-slate-500">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper h-full min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 lg:min-h-[500px]">
      <MapContainer
        center={[ILE_DE_FRANCE_CENTER.lat, ILE_DE_FRANCE_CENTER.lng]}
        zoom={ILE_DE_FRANCE_ZOOM}
        className="h-full w-full"
        maxBounds={idfBounds}
        maxBoundsViscosity={1}
        minZoom={8}
        maxZoom={18}
        closePopupOnClick={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapPanController salles={salles} highlightedSalleId={highlightedSalleId} />
        {salles.map((salle, i) => {
          const coords = getCoords(salle, i);
          const rating = ratingStats[salle.id];
          const avg = rating?.avg ?? 0;
          const count = rating?.count ?? 0;
          return (
            <Marker
              key={salle.id}
              position={[coords.lat, coords.lng]}
              icon={createPriceMarkerIcon(salle.pricePerDay)}
            >
              <Popup
                maxWidth={320}
                minWidth={280}
                className="map-marker-popup map-marker-popup-large"
                autoPan={true}
                autoPanPadding={[20, 20]}
                autoPanPaddingTopLeft={[20, 20]}
                autoPanPaddingBottomRight={[20, 20]}
              >
                <div className="map-popup-content">
                  <Link
                    href={`/salles/${salle.slug}`}
                    className="block overflow-hidden rounded-t-xl border border-slate-200 border-b-0 bg-white transition hover:opacity-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative h-28 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={salle.images[0] ?? "/img.png"}
                        alt={salle.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-emerald-600 shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                        Vérifiée
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="truncate text-base font-bold text-[#304256]">{salle.name}</h3>
                      <div className="mt-2 space-y-1 text-[13px] text-slate-600">
                        {avg > 0 && (
                          <p className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-900">{avg.toFixed(1)}</span>
                            <span>({count} avis)</span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                          {salle.city}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 shrink-0 text-slate-400" />
                          {salle.capacity} pers.
                        </p>
                      </div>
                    </div>
                  </Link>
                  {/* Marqueur bleu en bas : maison + prix (tip visuel vers le point sur la carte) */}
                  <div
                    className="flex cursor-default items-center justify-center gap-2 rounded-b-xl border border-t-0 border-slate-200 bg-[#2d435a] px-4 py-2 text-white shadow-md"
                    style={{ pointerEvents: "none" }}
                  >
                    <Home size={20} strokeWidth={2} className="shrink-0" />
                    <span className="font-semibold">{salle.pricePerDay}€ / jour</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
