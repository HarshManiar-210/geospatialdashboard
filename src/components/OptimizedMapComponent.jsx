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
import StatisticsPopup from "./StatisticsPopup";
import { closeMapPopup, setActiveLayer } from "../store/mapSlice";
import {
  closeLayersPopup,
  toggleLayerVisibility,
  setLoading as setLayersLoading,
} from "../store/layersSlice";
import {
  closeThemePopup,
  setSelectedTheme,
  setSelectedSubTheme,
} from "../store/themeSlice";
import {
  closeWaterShadeBasinPopup,
  toggleBasinVisibility,
  closeStatisticsPopup,
} from "../store/waterShadeBasinSlice";
import {
  setRiverData,
  setRiverSelectedBasins,
  setLoading,
  toggleRiverOrder,
} from "../store/riverSlice";
import { getRiverStyle, filterRiversByBasin } from "../utils/riverUtils";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
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

// Optimized transformation function with caching
const transformCache = new Map();
const transformUTMToWGS84 = (geoJson) => {
  if (!geoJson || !geoJson.features) return geoJson;

  const cacheKey = JSON.stringify(geoJson.name || "") + geoJson.features.length;
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }

  const transformedFeatures = geoJson.features.map((feature) => {
    if (feature.geometry && feature.geometry.type === "MultiPolygon") {
      const transformedCoordinates = feature.geometry.coordinates.map(
        (polygon) =>
          polygon.map((ring) =>
            ring.map((coord) => {
              const [x, y] = coord.slice(0, 2);
              try {
                const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
                return [lng, lat];
              } catch {
                return [x, y];
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
    } else if (
      feature.geometry &&
      feature.geometry.type === "MultiLineString"
    ) {
      const transformedCoordinates = feature.geometry.coordinates.map(
        (lineString) =>
          lineString.map((coord) => {
            const [x, y] = coord.slice(0, 2);
            try {
              const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
              return [lng, lat];
            } catch {
              return [x, y];
            }
          })
      );
      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: transformedCoordinates,
        },
      };
    } else if (feature.geometry && feature.geometry.type === "Point") {
      const [x, y] = feature.geometry.coordinates.slice(0, 2);
      try {
        const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [lng, lat],
          },
        };
      } catch {
        return feature;
      }
    }
    return feature;
  });

  const result = {
    ...geoJson,
    features: transformedFeatures,
  };

  // Cache the result
  transformCache.set(cacheKey, result);

  return result;
};

const tileUrls = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

const OptimizedMapComponent = memo(function OptimizedMapComponent() {
  const center = [23.2803, 74.2684];
  const dispatch = useDispatch();
  const { showMapPopup, activeLayer } = useSelector((state) => state.map);
  const { showLayersPopup, layers } = useSelector((state) => state.layers);
  const { showThemePopup, themes, selectedTheme, selectedSubTheme } =
    useSelector((state) => state.theme);
  const {
    showWaterShadeBasinPopup,
    showStatisticsPopup,
    basins,
    selectedBasins,
    centroidsFile,
  } = useSelector((state) => state.waterShadeBasin);
  const { riverData, selectedRiverOrders: riverOrders } = useSelector(
    (state) => state.river
  );

  // Optimized state management
  const [geoJsonData, setGeoJsonData] = useState({});
  const [centroidsData, setCentroidsData] = useState({});
  const [waterBasinData, setWaterBasinData] = useState({});
  const [waterBasinCentroidsData, setWaterBasinCentroidsData] = useState(null);
  const [mouseCoordinates, setMouseCoordinates] = useState(null);

  // Performance monitoring
  const measurePerformance = useCallback((name, fn) => {
    return fn();
  }, []);

  // Optimized handlers
  const handleLayerChange = useCallback(
    (layerId) => {
      dispatch(setActiveLayer(layerId));
    },
    [dispatch]
  );

  const handleClosePopup = useCallback(() => {
    dispatch(closeMapPopup());
  }, [dispatch]);

  const handleCloseLayersPopup = useCallback(() => {
    dispatch(closeLayersPopup());
  }, [dispatch]);

  const handleToggleLayer = useCallback(
    async (layerId) => {
      // Show loading for any layer change
      dispatch(
        setLayersLoading({
          isLoading: true,
          message: "",
        })
      );

      // Add delay for smooth user experience
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(toggleLayerVisibility(layerId));

      // Hide loading after delay
      dispatch(
        setLayersLoading({
          isLoading: false,
          message: "",
        })
      );
    },
    [dispatch]
  );

  const handleCloseThemePopup = useCallback(() => {
    dispatch(closeThemePopup());
  }, [dispatch]);

  const handleThemeChange = useCallback(
    async (themeId) => {
      // Show loading for theme change
      dispatch(
        setLayersLoading({
          isLoading: true,
          message: "",
        })
      );

      // Add delay for smooth user experience
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(setSelectedTheme(themeId));

      // Hide loading after delay
      dispatch(
        setLayersLoading({
          isLoading: false,
          message: "",
        })
      );
    },
    [dispatch]
  );

  const handleSubThemeChange = useCallback(
    async (subThemeId) => {
      // Show loading for sub-theme change
      dispatch(
        setLayersLoading({
          isLoading: true,
          message: "",
        })
      );

      // Add delay for smooth user experience
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(setSelectedSubTheme(subThemeId));

      // Hide loading after delay
      dispatch(
        setLayersLoading({
          isLoading: false,
          message: "",
        })
      );
    },
    [dispatch]
  );

  const handleCloseWaterShadeBasinPopup = useCallback(() => {
    dispatch(closeWaterShadeBasinPopup());
  }, [dispatch]);

  const handleToggleBasin = useCallback(
    async (basinId) => {
      // Show loading for basin change
      dispatch(
        setLayersLoading({
          isLoading: true,
          message: "",
        })
      );

      // Add delay for smooth user experience
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(toggleBasinVisibility(basinId));

      // Hide loading after delay
      dispatch(
        setLayersLoading({
          isLoading: false,
          message: "",
        })
      );
    },
    [dispatch]
  );

  const handleCloseStatisticsPopup = useCallback(() => {
    dispatch(closeStatisticsPopup());
  }, [dispatch]);

  const handleToggleRiverOrder = useCallback(
    async (riverOrderId) => {
      // Show loading for river order change
      dispatch(
        setLayersLoading({
          isLoading: true,
          message: "",
        })
      );

      // Add delay for smooth user experience
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(toggleRiverOrder(riverOrderId));

      // Hide loading after delay
      dispatch(
        setLayersLoading({
          isLoading: false,
          message: "",
        })
      );
    },
    [dispatch]
  );

  // Optimized map click handler
  const handleMapClick = useCallback(async () => {
    if (selectedTheme === "landuse" || selectedTheme === "hydrology") {
      return;
    }

    if (selectedTheme === "terrain") {
      if (
        selectedSubTheme === "elevation" ||
        selectedSubTheme === "slope" ||
        selectedSubTheme === "aspect"
      ) {
        try {
          dispatch(
            setLoading({
              isLoading: true,
              message: "",
            })
          );

          // Simulate loading time
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
          // Just hide the loading state, no error popup
        } finally {
          dispatch(setLoading({ isLoading: false, message: "" }));
        }
      }
    }
  }, [selectedTheme, selectedSubTheme, dispatch]);

  // Memoized image URL
  const getCurrentImageUrl = useMemo(() => {
    const currentTheme = themes.find((theme) => theme.id === selectedTheme);
    if (selectedTheme === "terrain" && selectedSubTheme) {
      const subTheme = currentTheme?.subThemes?.find(
        (sub) => sub.id === selectedSubTheme
      );
      return subTheme?.image ? `/${subTheme.image}` : null;
    }
    return currentTheme?.image ? `/${currentTheme.image}` : null;
  }, [themes, selectedTheme, selectedSubTheme]);

  // OPTIMIZED: Lazy load GeoJSON data only for visible layers
  useEffect(() => {
    const loadGeoJsonData = async () => {
      const data = { ...geoJsonData };
      const centroids = { ...centroidsData };

      const visibleLayers = layers.filter((layer) => layer.visible);

      for (const layer of visibleLayers) {
        if (!data[layer.id]) {
          try {
            const response = await fetch(`/${layer.file}`);
            const geoJson = await response.json();
            data[layer.id] = geoJson;

            if (layer.centroidsFile && !centroids[layer.id]) {
              const centroidsResponse = await fetch(`/${layer.centroidsFile}`);
              centroids[layer.id] = await centroidsResponse.json();
            }
          } catch {
            // Silent error handling for production
          }
        }
      }

      setGeoJsonData(data);
      setCentroidsData(centroids);

      // Hide loading when done
      dispatch(setLayersLoading({ isLoading: false, message: "" }));
    };

    loadGeoJsonData();
  }, [layers, geoJsonData, centroidsData, dispatch]); // Only trigger when visibility changes

  // OPTIMIZED: Lazy load Water Shade Basin data only when selected
  useEffect(() => {
    const loadWaterBasinData = async () => {
      const data = { ...waterBasinData };
      const selectedBasinObjects = basins.filter((basin) =>
        selectedBasins.includes(basin.id)
      );

      for (const basin of selectedBasinObjects) {
        if (!data[basin.id]) {
          try {
            const response = await fetch(`/${basin.file}`);
            const geoJson = await response.json();
            data[basin.id] = measurePerformance(`Transform ${basin.file}`, () =>
              transformUTMToWGS84(geoJson)
            );
          } catch {
            // Silent error handling for production
          }
        }
      }

      // Load centroids only once
      if (!waterBasinCentroidsData && selectedBasins.length > 0) {
        try {
          const centroidsResponse = await fetch(`/${centroidsFile}`);
          const centroidsJson = await centroidsResponse.json();
          const transformedCentroids = measurePerformance(
            "Transform centroids",
            () => transformUTMToWGS84(centroidsJson)
          );
          setWaterBasinCentroidsData(transformedCentroids);
        } catch {
          // Silent error handling for production
        }
      }

      setWaterBasinData(data);
    };

    if (selectedBasins.length > 0) {
      loadWaterBasinData();
    }
  }, [selectedBasins, centroidsFile, waterBasinData, waterBasinCentroidsData, basins, measurePerformance]); // Only load when selection changes

  // Sync selected basins with river system
  useEffect(() => {
    dispatch(setRiverSelectedBasins(selectedBasins));
  }, [selectedBasins, dispatch]);

  // OPTIMIZED: Load River Order data only when hydrology theme is selected
  useEffect(() => {
    if (selectedTheme !== "hydrology") return;

    const loadRiverOrderData = async () => {
      const hydrologyTheme = themes.find((theme) => theme.id === "hydrology");

      if (hydrologyTheme?.subThemes) {
        for (const riverOrder of hydrologyTheme.subThemes) {
          if (!riverData[riverOrder.id]) {
            try {
              const response = await fetch(`/${riverOrder.file}`);
              const geoJson = await response.json();
              const transformedGeoJson = measurePerformance(
                `Transform ${riverOrder.file}`,
                () => transformUTMToWGS84(geoJson)
              );
              dispatch(
                setRiverData({
                  orderId: riverOrder.id,
                  data: transformedGeoJson,
                })
              );
            } catch {
              // Silent error handling for production
            }
          }
        }
      }
    };

    loadRiverOrderData();
  }, [selectedTheme, themes, dispatch, riverData, measurePerformance]);

  // Memoized style function
  const getLayerStyle = useMemo(() => {
    const styles = {
      district: { color: "#000000", weight: 2, fillOpacity: 0.1 },
      talukas: { color: "#1f78b4", weight: 1, fillOpacity: 0.1 },
      road: { color: "#878787", weight: 2, fillOpacity: 0, dashArray: "5, 5" },
      railways: { color: "#e31a1c", weight: 3, fillOpacity: 0 },
      canal: { color: "#2741ea", weight: 2, fillOpacity: 0 },
    };
    return (layerId) =>
      styles[layerId] || { color: "#000", weight: 1, fillOpacity: 0.1 };
  }, []);

  // Memoized centroid renderer
  const renderCentroids = useCallback((layerId, centroidsGeoJson) => {
    if (!centroidsGeoJson?.features) return null;

    return centroidsGeoJson.features.map((feature, index) => {
      if (feature.geometry?.type === "Point") {
        const coordinates = feature.geometry.coordinates;
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
  }, []);

  // Map events handler
  const MapEventsHandler = memo(() => {
    useMapEvents({
      click: handleMapClick,
      mousemove: (e) => {
        const { lat, lng } = e.latlng;
        setMouseCoordinates({ lat, lng });
      },
      mouseleave: () => setMouseCoordinates(null),
    });
    return null;
  });

  // Memoized water basin centroids renderer
  const renderWaterBasinCentroids = useCallback(
    (centroidsGeoJson, selectedBasins) => {
      if (!centroidsGeoJson?.features) return null;

      return centroidsGeoJson.features
        .filter((feature) => selectedBasins.includes(feature.properties.layer))
        .map((feature, index) => {
          if (feature.geometry?.type === "Point") {
            const coordinates = feature.geometry.coordinates;
            const basinName = feature.properties["Basin Name"] || "Unknown";

            return (
              <Marker
                key={`water-basin-centroid-${index}`}
                position={[coordinates[1], coordinates[0]]}
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
    },
    []
  );

  // Image overlay bounds
  const imageOffset = 0.03;
  const topOffset = -0.01;
  const imageBounds = [
    [21.6538526169347278 + topOffset, 72.4500108944436363 + imageOffset],
    [24.599028110435821 + topOffset, 75.2870019434714663 + imageOffset],
  ];

  return (
    <div className="relative h-full w-full border rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <MapEventsHandler />
        <TileLayer
          url={tileUrls[activeLayer]}
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Theme Image Overlay */}
        {getCurrentImageUrl && (
          <ImageOverlay
            url={getCurrentImageUrl}
            bounds={imageBounds}
            opacity={0.7}
          />
        )}

        {/* GeoJSON layers - only render visible ones */}
        {layers
          .filter((layer) => layer.visible && geoJsonData[layer.id])
          .map((layer) => (
            <div key={layer.id}>
              <GeoJSON
                data={geoJsonData[layer.id]}
                style={() => getLayerStyle(layer.id)}
                pathOptions={{
                  className: layer.id === "road" ? "road-animated" : "",
                }}
              />
              {layer.centroidsFile &&
                centroidsData[layer.id] &&
                renderCentroids(layer.id, centroidsData[layer.id])}
            </div>
          ))}

        {/* Water Shade Basin layers - only render selected ones */}
        {basins
          .filter((basin) => basin.visible && waterBasinData[basin.id])
          .map((basin) => (
            <GeoJSON
              key={basin.id}
              data={waterBasinData[basin.id]}
              style={() => ({
                color: "#8B6B55",
                weight: 2,
                fillOpacity: 0.2,
              })}
            />
          ))}

        {/* Water Basin Centroids */}
        {waterBasinCentroidsData &&
          renderWaterBasinCentroids(waterBasinCentroidsData, selectedBasins)}

        {/* River Orders - only when Hydrology theme is selected */}
        {selectedTheme === "hydrology" &&
          riverOrders.length > 0 &&
          riverOrders.map((orderId) => {
            if (riverData[orderId]) {
              const filteredData = filterRiversByBasin(
                riverData[orderId],
                selectedBasins
              );
              if (filteredData.features?.length > 0) {
                return (
                  <GeoJSON
                    key={`river-order-${orderId}`}
                    data={filteredData}
                    style={() => ({
                      ...getRiverStyle(orderId),
                      color: "blue",
                      weight: getRiverStyle(orderId).weight,
                      opacity: 0.8,
                    })}
                  />
                );
              }
            }
            return null;
          })}

        <ZoomControl />
      </MapContainer>

      {/* Coordinate Display */}
      <CoordinateDisplay coordinates={mouseCoordinates} />

      {/* Legend */}
      <Legend
        selectedTheme={selectedTheme}
        selectedSubTheme={selectedSubTheme}
        layers={layers}
      />

      {/* Popups */}
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
          onToggleRiverOrder={handleToggleRiverOrder}
          selectedTheme={selectedTheme}
        />
      )}

      {showStatisticsPopup && (
        <StatisticsPopup
          selectedBasins={selectedBasins}
          onClose={handleCloseStatisticsPopup}
        />
      )}
    </div>
  );
});

export default OptimizedMapComponent;
