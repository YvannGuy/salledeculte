"use client";

import { Circle, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function SalleMapInner({
  lat,
  lng,
  radius,
  city,
}: {
  lat: number;
  lng: number;
  radius: number;
  city: string;
}) {
  const zoom = radius <= 1500 ? 14 : radius <= 3000 ? 13 : 12;

  return (
    <div className="aspect-[16/9] w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full rounded-xl"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{
            color: "#5b4dbf",
            fillColor: "#5b4dbf",
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
}
