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
import WaterShadeBasinPopup from "./WaterShadeBasinPopup";
import { closeMapPopup, setActiveLayer } from "../store/mapSlice";
import { closeLayersPopup, toggleLayerVisibility } from "../store/layersSlice";
import {
  closeThemePopup,
  setSelectedTheme,
  setSelectedSubTheme,
} from "../store/themeSlice";
import {
  closeWaterShadeBasinPopup,
  toggleBasinVisibility,
} from "../store/waterShadeBasinSlice";
import { useEffect, useState } from "react";
import proj4 from "proj4";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Define UTM Zone 43N projection (EPSG:32643)
proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Function to transform UTM coordinates to WGS84
const transformUTMToWGS84 = (geoJson) => {
  if (!geoJson || !geoJson.features) return geoJson;

  const transformedFeatures = geoJson.features.map((feature) => {
    if (feature.geometry && feature.geometry.type === "MultiPolygon") {
      const transformedCoordinates = feature.geometry.coordinates.map(
        (polygon) =>
          polygon.map((ring) =>
            ring.map((coord) => {
              const [x, y] = coord;
              try {
                const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
                return [lng, lat];
              } catch (error) {
                console.error("Coordinate transformation error:", error, {
                  x,
                  y,
                });
                return [x, y]; // Return original if transformation fails
              }
            })
          )
      );
      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: transformedCoordinates,
        },
      };
    } else if (feature.geometry && feature.geometry.type === "Point") {
      const [x, y] = feature.geometry.coordinates;
      try {
        const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [lng, lat],
          },
        };
      } catch (error) {
        console.error("Point transformation error:", error, { x, y });
        return feature; // Return original if transformation fails
      }
    }
    return feature;
  });

  return {
    ...geoJson,
    features: transformedFeatures,
  };
};

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
  const { showWaterShadeBasinPopup, basins, selectedBasins, centroidsFile } =
    useSelector((state) => state.waterShadeBasin);
  const [geoJsonData, setGeoJsonData] = useState({});
  const [centroidsData, setCentroidsData] = useState({});
  const [waterBasinData, setWaterBasinData] = useState({});
  const [waterBasinCentroidsData, setWaterBasinCentroidsData] = useState(null);
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

  const handleCloseWaterShadeBasinPopup = () => {
    dispatch(closeWaterShadeBasinPopup());
  };

  const handleToggleBasin = (basinId) => {
    dispatch(toggleBasinVisibility(basinId));
  };

  // Image overlay bounds and current image
  const imageOffset = 0.002; // Offset to shift image to the right
  const imageBounds = [
    [21.6538526169347278, 72.4500108944436363 + imageOffset], // Southwest corner
    [24.599028110435821, 75.2870019434714663 + imageOffset], // Northeast corner
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

  // Load Water Shade Basin data
  useEffect(() => {
    const loadWaterBasinData = async () => {
      const data = {};

      for (const basin of basins) {
        try {
          const response = await fetch(`/${basin.file}`);
          const geoJson = await response.json();
          // Transform UTM coordinates to WGS84
          const transformedGeoJson = transformUTMToWGS84(geoJson);
          data[basin.id] = transformedGeoJson;
        } catch (error) {
          console.error(`Error loading ${basin.file}:`, error);
        }
      }

      // Load centroids
      try {
        const centroidsResponse = await fetch(`/${centroidsFile}`);
        const centroidsJson = await centroidsResponse.json();
        console.log("Original centroids data:", centroidsJson);
        // Transform centroids coordinates as well
        const transformedCentroids = transformUTMToWGS84(centroidsJson);
        console.log("Transformed centroids data:", transformedCentroids);
        setWaterBasinCentroidsData(transformedCentroids);
      } catch (error) {
        console.error(`Error loading ${centroidsFile}:`, error);
      }

      setWaterBasinData(data);
    };
    loadWaterBasinData();
  }, [basins, centroidsFile]);

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

  // Function to render water basin centroids
  const renderWaterBasinCentroids = (centroidsGeoJson, selectedBasins) => {
    if (!centroidsGeoJson || !centroidsGeoJson.features) return null;

    return centroidsGeoJson.features.map((feature, index) => {
      if (feature.geometry && feature.geometry.type === "Point") {
        const coordinates = feature.geometry.coordinates;
        const basinName = feature.properties["Basin Name"] || "Unknown";
        const layerId = feature.properties.layer;

        // Check if this centroid belongs to a selected basin
        const isSelected = selectedBasins.includes(layerId);

        console.log(
          `Centroid ${basinName} (${layerId}): selected=${isSelected}, coordinates=[${coordinates[1]}, ${coordinates[0]}]`
        );

        if (!isSelected) return null;

        return (
          <Marker
            key={`water-basin-centroid-${index}`}
            position={[coordinates[1], coordinates[0]]} // [lat, lng] for Leaflet
            icon={L.divIcon({
              className: "centroid-marker",
              html: `<div class="centroid-label water-basin">${basinName}</div>`,
              iconSize: [80, 16],
              iconAnchor: [40, 8],
            })}
          />
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

        {/* Render Water Shade Basin layers */}
        {basins.map((basin) => {
          if (basin.visible && waterBasinData[basin.id]) {
            return (
              <GeoJSON
                key={basin.id}
                data={waterBasinData[basin.id]}
                style={() => ({
                  color: "#8B6B55",
                  weight: 2,
                  fillOpacity: 0.2,
                })}
              />
            );
          }
          return null;
        })}

        {/* Render Water Basin Centroids */}
        {waterBasinCentroidsData && (
          <>
            {console.log("Selected basins for centroids:", selectedBasins)}
            {renderWaterBasinCentroids(waterBasinCentroidsData, selectedBasins)}
          </>
        )}

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

      {showWaterShadeBasinPopup && (
        <WaterShadeBasinPopup
          basins={basins}
          onClose={handleCloseWaterShadeBasinPopup}
          onToggleBasin={handleToggleBasin}
        />
      )}
    </div>
  );
}
