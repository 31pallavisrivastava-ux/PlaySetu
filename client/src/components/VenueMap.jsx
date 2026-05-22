import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths for Vite bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LUCKNOW_FALLBACK = { lat: 26.8467, lng: 80.9462 };

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export default function VenueMap({ venues, height = '400px', className = '' }) {
  const useStyleHeight = !className.match(/\bh-/);
  const points = useMemo(
    () =>
      (venues || []).filter(
        (v) => typeof v.latitude === 'number' && typeof v.longitude === 'number'
      ),
    [venues]
  );

  const center = points[0]
    ? [points[0].latitude, points[0].longitude]
    : [LUCKNOW_FALLBACK.lat, LUCKNOW_FALLBACK.lng];

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}
      style={useStyleHeight ? { height } : undefined}
    >
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points.map((p) => ({ lat: p.latitude, lng: p.longitude }))} />
        {points.map((v) => (
          <Marker key={v.id} position={[v.latitude, v.longitude]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{v.name}</div>
                {v.area && <div className="text-slate-500 text-xs">{v.area}</div>}
                {v.rating > 0 && (
                  <div className="text-amber-600 text-xs mt-1">★ {Number(v.rating).toFixed(1)}</div>
                )}
                <a
                  href={`/facilities/${v.id}`}
                  className="inline-block mt-2 text-emerald-600 text-xs font-semibold"
                >
                  View details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
