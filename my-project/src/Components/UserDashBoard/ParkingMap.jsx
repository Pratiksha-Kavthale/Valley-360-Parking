import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { LuCarFront, LuMapPin, LuNavigation, LuRefreshCw } from 'react-icons/lu';
import api from '/src/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const DEFAULT_ZOOM = 13;

const syncMapCenter = (map, center, zoom) => {
  if (!map || !center) {
    return;
  }

  map.setView(center, zoom, { animate: true });
};

function MapViewController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    syncMapCenter(map, center, zoom);
  }, [center, map, zoom]);

  return null;
}

const normalizeParkingLabel = (area) => [area?.area, area?.city].filter(Boolean).join(', ') || 'Nearby Parking';

const getParkingCoordinates = (area) => {
  const latitude = Number(area?.latitude);
  const longitude = Number(area?.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { lat: latitude, lng: longitude };
};

const ParkingMap = ({
  parkingAreas,
  userLocation,
  loading,
  locationError,
  onBookNow,
}) => {
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [slotCounts, setSlotCounts] = useState({});

  const mapCenter = useMemo(() => {
    if (userLocation?.lat !== null && userLocation?.lng !== null) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }

    return DEFAULT_CENTER;
  }, [userLocation]);

  const selectedParking = useMemo(
    () => parkingAreas.find((area) => String(area.id) === String(selectedParkingId)) || null,
    [parkingAreas, selectedParkingId]
  );

  useEffect(() => {
    const fetchSlotCounts = async () => {
      if (!Array.isArray(parkingAreas) || parkingAreas.length === 0) {
        setSlotCounts({});
        return;
      }

      const entries = await Promise.all(
        parkingAreas.map(async (area) => {
          try {
            const response = await api.get(`/parkingSlots/${area.id}`);
            const slots = Array.isArray(response.data) ? response.data : [];
            const availableSlots = slots.filter((slot) => String(slot.status).toUpperCase() === 'AVAILABLE').length;

            return [area.id, availableSlots];
          } catch (error) {
            console.error('Error fetching parking slots for map:', error);
            return [area.id, null];
          }
        })
      );

      setSlotCounts(Object.fromEntries(entries));
    };

    fetchSlotCounts();
  }, [parkingAreas]);

  useEffect(() => {
    const fetchRoute = async () => {
      const parkingCoordinates = getParkingCoordinates(selectedParking);

      if (!parkingCoordinates || userLocation?.lat === null || userLocation?.lng === null) {
        setRoutePath([]);
        setRouteInfo(null);
        return;
      }

      setRouteLoading(true);

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${parkingCoordinates.lng},${parkingCoordinates.lat}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error('Unable to load route');
        }

        const data = await response.json();
        const route = data?.routes?.[0];

        if (!route?.geometry?.coordinates) {
          throw new Error('Route geometry is missing');
        }

        setRoutePath(route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]));
        setRouteInfo({
          distanceKm: route.distance / 1000,
          durationMinutes: route.duration / 60,
        });
      } catch (error) {
        console.error('Error fetching OSRM route:', error);
        setRoutePath([]);
        setRouteInfo(null);
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [selectedParking, userLocation]);

  const renderPopupContent = (area) => {
    const availableSlots = slotCounts[area.id];

    return (
      <div className="space-y-3 min-w-[220px]">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">Nearby Parking</p>
          <h4 className="text-lg font-bold text-slate-900">{normalizeParkingLabel(area)}</h4>
        </div>

        <div className="space-y-1 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Available slots:</span>{' '}
            {availableSlots === null ? 'Unavailable' : availableSlots}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {area.status || 'N/A'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            onClick={() => setSelectedParkingId(area.id)}
          >
            <LuNavigation />
            Show Route
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600"
            onClick={() => onBookNow(area.id)}
          >
            <LuCarFront />
            View / Book
          </button>
        </div>
      </div>
    );
  };

  const hasUserLocation = userLocation?.lat !== null && userLocation?.lng !== null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Nearby Parking Map</h3>
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? 'Finding your location and loading nearby parking areas...'
              : locationError
                ? locationError
                : 'Markers are loaded from the backend nearby search, with a 3km radius circle around you.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          {routeLoading ? 'Loading route...' : selectedParking ? 'Route ready' : 'Select a parking marker'}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        <div className="h-[460px] w-full">
          <MapContainer center={mapCenter} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController center={mapCenter} zoom={DEFAULT_ZOOM} />

            {hasUserLocation && (
              <>
                <Circle
                  center={mapCenter}
                  radius={3000}
                  pathOptions={{
                    color: '#fb7185',
                    fillColor: '#fda4af',
                    fillOpacity: 0.2,
                  }}
                />

                <Marker position={mapCenter}>
                  <Tooltip permanent direction="top" offset={[0, -8]} opacity={1}>
                    You
                  </Tooltip>
                </Marker>
              </>
            )}

            {Array.isArray(parkingAreas) && parkingAreas.map((area) => {
              const parkingCoordinates = getParkingCoordinates(area);

              if (!parkingCoordinates) {
                return null;
              }

              return (
                <Marker
                  key={area.id}
                  position={parkingCoordinates}
                  eventHandlers={{
                    click: () => setSelectedParkingId(area.id),
                  }}
                >
                  <Popup>{renderPopupContent(area)}</Popup>
                </Marker>
              );
            })}

            {routePath.length > 0 && <Polyline positions={routePath} pathOptions={{ color: '#ef4444', weight: 5 }} />}
          </MapContainer>
        </div>

        <div className="absolute right-4 top-4 w-[280px] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-500">
              <LuMapPin className="text-xl" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Search Radius</p>
              <p className="font-semibold text-slate-900">3 km</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Nearby markers:</span> {parkingAreas.length}
            </p>
            <p>
              <span className="font-semibold">Selected:</span>{' '}
              {selectedParking ? normalizeParkingLabel(selectedParking) : 'None'}
            </p>
            <p>
              <span className="font-semibold">Distance:</span>{' '}
              {routeInfo ? `${routeInfo.distanceKm.toFixed(2)} km` : 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Duration:</span>{' '}
              {routeInfo ? `${Math.max(1, Math.round(routeInfo.durationMinutes))} min` : 'N/A'}
            </p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600"
            onClick={() => {
              setSelectedParkingId(null);
              setRoutePath([]);
              setRouteInfo(null);
            }}
          >
            <LuRefreshCw />
            Clear Route
          </button>
        </div>
      </div>

      {selectedParking && routeInfo && (
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-500">Route Summary</p>
              <h4 className="text-lg font-bold text-slate-900">{normalizeParkingLabel(selectedParking)}</h4>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
                {routeInfo.distanceKm.toFixed(2)} km
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                {Math.max(1, Math.round(routeInfo.durationMinutes))} min
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            The selected route is drawn using OSRM public routing data between your current location and the chosen parking area.
          </p>
        </div>
      )}
    </section>
  );
};

export default ParkingMap;