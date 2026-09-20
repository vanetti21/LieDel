import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Popup,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CONTINENTS = [
  { name: "North America", lat: 48, lng: -100 },
  { name: "South America", lat: -20, lng: -58 },
  { name: "Europe", lat: 54, lng: 15 },
  { name: "Africa", lat: 5, lng: 20 },
  { name: "Asia", lat: 45, lng: 90 },
  { name: "Oceania", lat: -25, lng: 140 },
  { name: "Antarctica", lat: -75, lng: 0 },
];

function ContinentLabels() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => map.off("zoomend", onZoom);
  }, [map]);

  if (zoom > 3) return null;

  return CONTINENTS.map((c) => {
    const icon = L.divIcon({
      className: "",
      html: `<span style="
                font-family: Georgia, serif;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 2px;
                color: #6b7280;
                text-transform: uppercase;
                white-space: nowrap;
                text-shadow: 1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9);
                pointer-events: none;
            ">${c.name}</span>`,
      iconAnchor: [40, 8],
    });
    return (
      <Marker
        key={c.name}
        position={[c.lat, c.lng]}
        icon={icon}
        interactive={false}
      />
    );
  });
}

const COUNTRY_COORDS = {
  "united states of america": [37.0902, -95.7129],
  "united states": [37.0902, -95.7129],
  eeuu: [37.0902, -95.7129],
  usa: [37.0902, -95.7129],
  canada: [56.1304, -106.3468],
  mexico: [23.6345, -102.5528],
  "dominican republic": [18.7357, -70.1627],
  "republica dominicana": [18.7357, -70.1627],
  "puerto rico": [18.2208, -66.5901],
  panama: [8.538, -80.7821],
  "costa rica": [9.7489, -83.7534],
  colombia: [4.5709, -74.2973],
  brazil: [-14.235, -51.9253],
  brasil: [-14.235, -51.9253],
  argentina: [-38.4161, -63.6167],
  chile: [-35.6751, -71.543],
  peru: [-9.19, -75.0152],
  spain: [40.4637, -3.7492],
  españa: [40.4637, -3.7492],
  germany: [51.1657, 10.4515],
  alemania: [51.1657, 10.4515],
  france: [46.2276, 2.2137],
  francia: [46.2276, 2.2137],
  italy: [41.8719, 12.5674],
  italia: [41.8719, 12.5674],
  "united kingdom": [55.3781, -3.436],
  "reino unido": [55.3781, -3.436],
  china: [35.8617, 104.1954],
  japan: [36.2048, 138.2529],
  japon: [36.2048, 138.2529],
  india: [20.5937, 78.9629],
  "south korea": [35.9078, 127.7669],
  "corea del sur": [35.9078, 127.7669],
  australia: [-25.2744, 133.7751],
};

function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;

    try {
      const bounds = L.latLngBounds(positions);

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 5,
        animate: false,
      });

      map.whenReady(() => {
        map.invalidateSize({ animate: false, pan: false });

        requestAnimationFrame(() => {
          map.invalidateSize({ animate: false, pan: false });
        });
      });
    } catch {
      map.setView([20, 10], 2, {
        animate: false,
      });
    }
  }, [positions, map]);

  return null;
}

function MapInstanceCapture({ onReady }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

const SuppliersWorldMap = forwardRef(({ fechaInicio, fechaFin }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapInstanceRef = useRef(null);

  const markers = data
    .map((item) => {
      const key = item.Pais?.toLowerCase().trim();
      const coords = COUNTRY_COORDS[key];
      if (!coords) return null;
      return { ...item, lat: coords[0], lng: coords[1] };
    })
    .filter(Boolean);

  // Expone invalidateSize (para la vista en pantalla) y getMarkers
  // (para que el PDF pueda dibujar los puntos sin necesidad de capturar nada).
  useImperativeHandle(ref, () => ({
    invalidateSize: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    },
    getMarkers: () => markers,
  }));

  useEffect(() => {
    setLoading(true);
    let url = "http://localhost:5000/proveedores_mapa";

    if (fechaInicio && fechaFin) {
      url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el mapa de proveedores.");
        setLoading(false);
      });
  }, [fechaInicio, fechaFin]);

  const positions = markers.map((m) => [m.lat, m.lng]);
  const maxCount = Math.max(...markers.map((m) => m.Total ?? 1), 1);
  const getRadius = (count) =>
    Math.max(7, Math.min(28, (count / maxCount) * 28));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-xl p-6 border border-gray-200 mb-8"
      style={{ backgroundColor: "rgb(240, 243, 249)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-bold text-gray-900">
          Distribución Geográfica de Proveedores
        </h2>
        {!loading && (
          <span className="text-sm text-gray-500 font-medium">
            {markers.length} país{markers.length !== 1 ? "es" : ""} con registro
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[500px] text-gray-400 text-sm">
          Cargando datos del mapa…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[500px] text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          id="leaflet-map-container"
          className="w-full rounded-lg overflow-hidden"
          style={{ height: 500 }}
        >
          <MapContainer
            center={[20, 10]}
            zoom={2}
            minZoom={2}
            maxZoom={10}
            maxBounds={[
              [-85, -185],
              [85, 185],
            ]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            style={{ height: "100%", width: "100%", borderRadius: 8 }}
            scrollWheelZoom={true}
          >
            <MapInstanceCapture
              onReady={(map) => {
                mapInstanceRef.current = map;
              }}
            />

            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />

            {positions.length > 0 && <FitBounds positions={positions} />}
            <ContinentLabels />

            {markers.map((marker, i) => (
              <CircleMarker
                key={i}
                center={[marker.lat, marker.lng]}
                radius={getRadius(marker.Total ?? 1)}
                pathOptions={{
                  fillColor: "#6366F1",
                  fillOpacity: 0.85,
                  color: "#fff",
                  weight: 2,
                }}
                bubblingMouseEvents={false}
                eventHandlers={{
                  mouseover: (e) => e.target.openTooltip(),
                  mouseout: (e) => e.target.closeTooltip(),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} sticky>
                  <div className="text-sm font-medium">{marker.Pais}</div>
                  {marker.Total != null && (
                    <div className="text-xs text-gray-500">
                      {marker.Total} proveedor{marker.Total !== 1 ? "es" : ""}
                    </div>
                  )}
                </Tooltip>

                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <p
                      style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}
                    >
                      {marker.Pais}
                    </p>
                    {marker.Total != null && (
                      <p style={{ fontSize: 13, color: "#555" }}>
                        <strong>{marker.Total}</strong> proveedor
                        {marker.Total !== 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      {!loading && !error && markers.length > 0 && (
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span
              className="inline-block rounded-full bg-indigo-500"
              style={{ width: 10, height: 10, opacity: 0.85 }}
            />
            País con proveedores
          </span>
          <span>
            · Pasa el cursor para detalles · Haz clic para ver información
          </span>
        </div>
      )}
    </motion.div>
  );
});

SuppliersWorldMap.displayName = "SuppliersWorldMap";

export default SuppliersWorldMap;
