import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";
import MapLayerPopup from "./MapLayerPopup";
import LayersPopup from "./LayersPopup";
import { closeMapPopup, setActiveLayer } from "../store/mapSlice";
import { closeLayersPopup, toggleLayerVisibility } from "../store/layersSlice";
import { useEffect, useState } from "react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const tileUrls = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

export default function MapComponent() {
  const center = [23.2803, 74.2684];
  const dispatch = useDispatch();
  const { showMapPopup, activeLayer } = useSelector((state) => state.map);
  const { showLayersPopup, layers } = useSelector((state) => state.layers);
  const [geoJsonData, setGeoJsonData] = useState({});
  const [centroidsData, setCentroidsData] = useState({});

  const handleLayerChange = (layerId) => {
    dispatch(setActiveLayer(layerId));
  };

  const handleClosePopup = () => {
    dispatch(closeMapPopup());
  };

  const handleCloseLayersPopup = () => {
    dispatch(closeLayersPopup());
  };

  const handleToggleLayer = (layerId) => {
    dispatch(toggleLayerVisibility(layerId));
  };

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJsonData = async () => {
      const data = {};
      const centroids = {};

      for (const layer of layers) {
        try {
          // Load main GeoJSON file
          const response = await fetch(`/${layer.file}`);
          const geoJson = await response.json();
          data[layer.id] = geoJson;

          // Load centroids if available
          if (layer.centroidsFile) {
            const centroidsResponse = await fetch(`/${layer.centroidsFile}`);
            const centroidsJson = await centroidsResponse.json();
            centroids[layer.id] = centroidsJson;
          }
        } catch (error) {
          console.error(`Error loading ${layer.file}:`, error);
        }
      }

      setGeoJsonData(data);
      setCentroidsData(centroids);
    };
    loadGeoJsonData();
  }, [layers]);

  // Style function for GeoJSON layers
  const getLayerStyle = (layerId) => {
    const styles = {
      district: { color: "#ff6b6b", weight: 2, fillOpacity: 0.1 },
      talukas: { color: "#4ecdc4", weight: 1, fillOpacity: 0.1 },
      road: { color: "#45b7d1", weight: 2, fillOpacity: 0 },
      railways: { color: "#f9ca24", weight: 3, fillOpacity: 0 },
      canal: { color: "#6c5ce7", weight: 2, fillOpacity: 0 },
    };
    return styles[layerId] || { color: "#000", weight: 1, fillOpacity: 0.1 };
  };

  // Function to render centroids with labels
  const renderCentroids = (layerId, centroidsGeoJson) => {
    if (!centroidsGeoJson || !centroidsGeoJson.features) return null;

    return centroidsGeoJson.features.map((feature, index) => {
      if (feature.geometry && feature.geometry.type === "Point") {
        const coordinates = feature.geometry.coordinates;
        // For districts, use NAME_2; for talukas, use NAME_3
        const cityName =
          layerId === "district"
            ? feature.properties.NAME_2 || "Unknown"
            : feature.properties.NAME_3 ||
              feature.properties.NAME_2 ||
              "Unknown";

        return (
          <Marker
            key={`${layerId}-centroid-${index}`}
            position={[coordinates[1], coordinates[0]]}
            icon={L.divIcon({
              className: "centroid-marker",
              html: `<div class="centroid-label ${layerId}">${cityName}</div>`,
              iconSize: [80, 16],
              iconAnchor: [40, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>{cityName}</strong>
                <br />
                <span className="text-sm text-gray-600">
                  {layerId === "district" ? "District" : "Taluka"} Center
                </span>
              </div>
            </Popup>
          </Marker>
        );
      }
      return null;
    });
  };

  return (
    <div className="relative h-screen w-full border rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrls[activeLayer]}
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={center}>
          <Popup>Custom Center Point</Popup>
        </Marker>

        {/* Render GeoJSON layers */}
        {layers.map((layer) => {
          if (layer.visible && geoJsonData[layer.id]) {
            return (
              <div key={layer.id}>
                <GeoJSON
                  data={geoJsonData[layer.id]}
                  style={() => getLayerStyle(layer.id)}
                />
                {/* Render centroids if available */}
                {layer.centroidsFile &&
                  centroidsData[layer.id] &&
                  renderCentroids(layer.id, centroidsData[layer.id])}
              </div>
            );
          }
          return null;
        })}

        <ZoomControl />
      </MapContainer>

      {showMapPopup && (
        <MapLayerPopup
          activeLayer={activeLayer}
          onClose={handleClosePopup}
          onChange={handleLayerChange}
        />
      )}

      {showLayersPopup && (
        <LayersPopup
          layers={layers}
          onClose={handleCloseLayersPopup}
          onToggleLayer={handleToggleLayer}
        />
      )}
    </div>
  );
}
