import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  ImageOverlay,
  useMapEvents,
} from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoomControl from "./ZoomControl";
import MapLayerPopup from "./MapLayerPopup";
import LayersPopup from "./LayersPopup";
import ThemePopup from "./ThemePopup";
import CoordinateDisplay from "./CoordinateDisplay";
import Legend from "./Legend";
import { closeMapPopup, setActiveLayer } from "../store/mapSlice";
import { closeLayersPopup, toggleLayerVisibility } from "../store/layersSlice";
import {
  closeThemePopup,
  setSelectedTheme,
  setSelectedSubTheme,
} from "../store/themeSlice";
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

// Component to handle map events
function MapEvents({ onMouseMove, onMouseLeave }) {
  useMapEvents({
    mousemove: (e) => {
      const { lat, lng } = e.latlng;

      onMouseMove({ lat, lng });
    },
    mouseout: () => {
      onMouseLeave();
    },
  });
  return null;
}

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
  const { showThemePopup, themes, selectedTheme, selectedSubTheme } =
    useSelector((state) => state.theme);
  const [geoJsonData, setGeoJsonData] = useState({});
  const [centroidsData, setCentroidsData] = useState({});
  const [mouseCoordinates, setMouseCoordinates] = useState(null);

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

  const handleCloseThemePopup = () => {
    dispatch(closeThemePopup());
  };

  const handleThemeChange = (themeId) => {
    dispatch(setSelectedTheme(themeId));
  };

  const handleSubThemeChange = (subThemeId) => {
    dispatch(setSelectedSubTheme(subThemeId));
  };

  // Image overlay bounds and current image
  const imageBounds = [
    [21.6538526169347278, 72.4500108944436363], // Southwest corner
    [24.599028110435821, 75.2870019434714663], // Northeast corner
  ];

  const getCurrentImageUrl = () => {
    const currentTheme = themes.find((theme) => theme.id === selectedTheme);

    if (selectedTheme === "terrain" && selectedSubTheme) {
      const subTheme = currentTheme?.subThemes?.find(
        (sub) => sub.id === selectedSubTheme
      );
      return subTheme?.image ? `/${subTheme.image}` : null;
    }

    return currentTheme?.image ? `/${currentTheme.image}` : null;
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
    <div className="relative h-screen w-full border rounded-xl">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%", overflow: "hidden" }}
        zoomControl={false}
      >
        <MapEvents
          onMouseMove={setMouseCoordinates}
          onMouseLeave={() => setMouseCoordinates(null)}
        />
        <TileLayer
          url={tileUrls[activeLayer]}
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={center}>
          <Popup>Custom Center Point</Popup>
        </Marker>

        {/* Render Theme Image Overlay */}
        {getCurrentImageUrl() && (
          <ImageOverlay
            url={getCurrentImageUrl()}
            bounds={imageBounds}
            opacity={0.7}
          />
        )}

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

      {/* Coordinate Display - Outside MapContainer */}
      <CoordinateDisplay coordinates={mouseCoordinates} />

      {/* Legend and Statistics - Bottom Right */}
      <Legend />

      {/* Debug display */}
      {/* <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded z-[9999] text-xs">
        Debug:{" "}
        {mouseCoordinates
          ? `${mouseCoordinates.lat.toFixed(4)}, ${mouseCoordinates.lng.toFixed(
              4
            )}`
          : "No coordinates"}
      </div> */}

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

      {showThemePopup && (
        <ThemePopup
          themes={themes}
          selectedTheme={selectedTheme}
          selectedSubTheme={selectedSubTheme}
          onClose={handleCloseThemePopup}
          onThemeChange={handleThemeChange}
          onSubThemeChange={handleSubThemeChange}
        />
      )}
    </div>
  );
}
