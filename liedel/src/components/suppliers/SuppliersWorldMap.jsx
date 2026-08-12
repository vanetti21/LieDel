import { useEffect, useState } from "react";
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
    { name: "Europe",        lat: 54,  lng: 15  },
    { name: "Africa",        lat: 5,   lng: 20  },
    { name: "Asia",          lat: 45,  lng: 90  },
    { name: "Oceania",       lat: -25, lng: 140 },
    { name: "Antarctica",    lat: -75, lng: 0   },
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
            <Marker key={c.name} position={[c.lat, c.lng]} icon={icon} interactive={false} />
        );
    });
}

const COUNTRY_COORDS = {
    "united states of america": [37.09, -95.71],
    "united states": [37.09, -95.71],
    "united kingdom": [55.37, -3.43],
    germany: [51.16, 10.45],
    france: [46.22, 2.21],
    china: [35.86, 104.19],
    japan: [36.2, 138.25],
    india: [20.59, 78.96],
    brazil: [-14.23, -51.92],
    canada: [56.13, -106.34],
    australia: [-25.27, 133.77],
    mexico: [23.63, -102.55],
    spain: [40.46, -3.74],
    italy: [41.87, 12.56],
    netherlands: [52.13, 5.29],
    "south korea": [35.91, 127.76],
    russia: [61.52, 105.31],
    "south africa": [-30.55, 22.93],
    argentina: [-38.41, -63.61],
    chile: [-35.67, -71.54],
    colombia: [4.57, -74.29],
    peru: [-9.19, -75.01],
    portugal: [39.39, -8.22],
    sweden: [60.12, 18.64],
    norway: [60.47, 8.46],
    denmark: [56.26, 9.5],
    finland: [61.92, 25.74],
    switzerland: [46.81, 8.22],
    austria: [47.51, 14.55],
    belgium: [50.5, 4.46],
    poland: [51.91, 19.14],
    turkey: [38.96, 35.24],
    "saudi arabia": [23.88, 45.07],
    "united arab emirates": [23.42, 53.84],
    israel: [31.04, 34.85],
    egypt: [26.82, 30.8],
    nigeria: [9.08, 8.67],
    kenya: [-0.02, 37.9],
    ethiopia: [9.14, 40.48],
    ghana: [7.94, -1.02],
    indonesia: [-0.78, 113.92],
    malaysia: [4.21, 101.97],
    thailand: [15.87, 100.99],
    vietnam: [14.05, 108.27],
    philippines: [12.87, 121.77],
    singapore: [1.35, 103.82],
    "new zealand": [-40.9, 174.88],
    pakistan: [30.37, 69.34],
    bangladesh: [23.68, 90.35],
    "sri lanka": [7.87, 80.77],
    ukraine: [48.37, 31.16],
    czechia: [49.81, 15.47],
    hungary: [47.16, 19.5],
    romania: [45.94, 24.96],
    greece: [39.07, 21.82],
    "dominican republic": [18.73, -70.16],
    "republica dominicana": [18.73, -70.16],
};

function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            try {
                const bounds = L.latLngBounds(positions);
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
            } catch {
                map.setView([20, 10], 2);
            }
        }
    }, [positions, map]);
    return null;
}

const SuppliersWorldMap = ({ fechaInicio, fechaFin }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const markers = data
        .map((item) => {
            const key = item.Pais?.toLowerCase().trim();
            const coords = COUNTRY_COORDS[key];
            if (!coords) return null;
            return { ...item, lat: coords[0], lng: coords[1] };
        })
        .filter(Boolean);

    const positions = markers.map((m) => [m.lat, m.lng]);
    const maxCount = Math.max(...markers.map((m) => m.Total ?? 1), 1);
    const getRadius = (count) => Math.max(7, Math.min(28, (count / maxCount) * 28));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-xl p-6 border border-gray-200 mb-8"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
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
                <div className="w-full rounded-lg overflow-hidden" style={{ height: 500 }}>
                    <MapContainer
                        center={[20, 10]}
                        zoom={2}
                        minZoom={2}
                        maxZoom={10}
                        maxBounds={[[-85, -185], [85, 185]]}
                        maxBoundsViscosity={1.0}
                        worldCopyJump={false}
                        style={{ height: "100%", width: "100%", borderRadius: 8 }}
                        scrollWheelZoom={true}
                    >
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
                                        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                            {marker.Pais}
                                        </p>
                                        {marker.Total != null && (
                                            <p style={{ fontSize: 13, color: "#555" }}>
                                                <strong>{marker.Total}</strong> proveedor{marker.Total !== 1 ? "es" : ""}
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
                    <span>· Pasa el cursor para detalles · Haz clic para ver información</span>
                </div>
            )}
        </motion.div>
    );
};

export default SuppliersWorldMap;