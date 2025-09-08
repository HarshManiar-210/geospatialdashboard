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
} from "../store/riverSlice";
import { getRiverStyle, filterRiversByBasin } from "../utils/riverUtils";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import proj4 from "proj4";
import { fromArrayBuffer } from "geotiff";

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
    console.log("🚀 Using cached transformation for:", geoJson.name);
    return transformCache.get(cacheKey);
  }

  console.log("🔄 Transforming GeoJSON:", geoJson.name || "Unknown", {
    featureCount: geoJson.features?.length || 0,
  });

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
  console.log("✅ Transformation complete and cached");

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
  const [clickedMarker, setClickedMarker] = useState(null);
  const [popupContent, setPopupContent] = useState("");
  const [loadingLayers, setLoadingLayers] = useState(new Set());
  const popupRef = useRef(null);

  // Performance monitoring
  const measurePerformance = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
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
    (layerId) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer && !layer.visible) {
        // Show loading when enabling a layer
        dispatch(
          setLayersLoading({
            isLoading: true,
            message: `Loading ${layer.label}...`,
          })
        );
      }
      dispatch(toggleLayerVisibility(layerId));
    },
    [dispatch, layers]
  );

  const handleCloseThemePopup = useCallback(() => {
    dispatch(closeThemePopup());
  }, [dispatch]);

  const handleThemeChange = useCallback(
    (themeId) => {
      dispatch(setSelectedTheme(themeId));
    },
    [dispatch]
  );

  const handleSubThemeChange = useCallback(
    (subThemeId) => {
      dispatch(setSelectedSubTheme(subThemeId));
    },
    [dispatch]
  );

  const handleCloseWaterShadeBasinPopup = useCallback(() => {
    dispatch(closeWaterShadeBasinPopup());
  }, [dispatch]);

  const handleToggleBasin = useCallback(
    (basinId) => {
      dispatch(toggleBasinVisibility(basinId));
    },
    [dispatch]
  );

  const handleCloseStatisticsPopup = useCallback(() => {
    dispatch(closeStatisticsPopup());
  }, [dispatch]);

  // Optimized map click handler
  const handleMapClick = useCallback(
    async (event) => {
      if (selectedTheme === "landuse" || selectedTheme === "hydrology") {
        return;
      }

      if (selectedTheme === "terrain") {
        const { lat, lng } = event.latlng;
        let tifFileName = "";
        let layerType = "";

        if (selectedSubTheme === "elevation") {
          tifFileName = "/MahiElevation.tif";
          layerType = "Elevation";
        } else if (selectedSubTheme === "slope") {
          tifFileName = "/MahiSlope.tif";
          layerType = "Slope";
        } else if (selectedSubTheme === "aspect") {
          tifFileName = "/MahiAspect.tif";
          layerType = "Aspect";
        } else {
          return;
        }

        try {
          dispatch(
            setLoading({
              isLoading: true,
              message: `Loading ${layerType} data...`,
            })
          );

          const response = await fetch(tifFileName);
          const arrayBuffer = await response.arrayBuffer();
          const tiff = await fromArrayBuffer(arrayBuffer);
          const image = await tiff.getImage();
          const rasters = await image.readRasters();
          const bbox = image.getBoundingBox();
          const width = image.getWidth();
          const height = image.getHeight();

          const x = ((lng - bbox[0]) / (bbox[2] - bbox[0])) * width;
          const y = ((bbox[3] - lat) / (bbox[3] - bbox[1])) * height;
          const pixelIndex = Math.floor(y) * width + Math.floor(x);

          let pixelValue = undefined;
          const raster0 = rasters[0];

          if (Array.isArray(raster0) || ArrayBuffer.isView(raster0)) {
            pixelValue = raster0[pixelIndex];
          }

          const value =
            pixelValue !== undefined ? pixelValue.toFixed(2) : "N/A";
          const unit = layerType === "Elevation" ? " meters" : "";
          setPopupContent(`${layerType}: ${value}${unit}`);
          setClickedMarker({ lat, lng });

          setTimeout(() => {
            if (popupRef.current) {
              popupRef.current.openPopup();
            }
          }, 100);
        } catch (error) {
          console.error(`Error loading ${tifFileName}:`, error);
          setPopupContent(`Error loading ${layerType} data`);
          setClickedMarker({ lat, lng });
        } finally {
          dispatch(setLoading({ isLoading: false, message: "" }));
        }
      }
    },
    [selectedTheme, selectedSubTheme, dispatch]
  );

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
      console.log("🔄 Loading GeoJSON data for visible layers...");
      const data = { ...geoJsonData };
      const centroids = { ...centroidsData };
      const newLoadingLayers = new Set(loadingLayers);

      const visibleLayers = layers.filter((layer) => layer.visible);
      console.log(
        "👁️ Visible layers:",
        visibleLayers.map((l) => l.id)
      );

      for (const layer of visibleLayers) {
        if (!data[layer.id] && !newLoadingLayers.has(layer.id)) {
          newLoadingLayers.add(layer.id);
          setLoadingLayers(new Set(newLoadingLayers));

          try {
            console.log(`📥 Loading ${layer.file}...`);
            const start = performance.now();

            const response = await fetch(`/${layer.file}`);
            const geoJson = await response.json();
            data[layer.id] = geoJson;

            const end = performance.now();
            console.log(
              `✅ Loaded ${layer.file} in ${(end - start).toFixed(2)}ms`
            );

            if (layer.centroidsFile && !centroids[layer.id]) {
              const centroidsResponse = await fetch(`/${layer.centroidsFile}`);
              centroids[layer.id] = await centroidsResponse.json();
            }
          } catch (error) {
            console.error(`❌ Error loading ${layer.file}:`, error);
          } finally {
            newLoadingLayers.delete(layer.id);
            setLoadingLayers(new Set(newLoadingLayers));
          }
        }
      }

      setGeoJsonData(data);
      setCentroidsData(centroids);

      // Hide loading when done
      dispatch(setLayersLoading({ isLoading: false, message: "" }));
    };

    loadGeoJsonData();
  }, [layers, geoJsonData, centroidsData, loadingLayers, dispatch]); // Only trigger when visibility changes

  // OPTIMIZED: Lazy load Water Shade Basin data only when selected
  useEffect(() => {
    const loadWaterBasinData = async () => {
      console.log("🌊 Loading water basin data...");
      const data = { ...waterBasinData };
      const selectedBasinObjects = basins.filter((basin) =>
        selectedBasins.includes(basin.id)
      );

      for (const basin of selectedBasinObjects) {
        if (!data[basin.id]) {
          try {
            console.log(`📥 Loading ${basin.file}...`);
            const response = await fetch(`/${basin.file}`);
            const geoJson = await response.json();
            data[basin.id] = measurePerformance(`Transform ${basin.file}`, () =>
              transformUTMToWGS84(geoJson)
            );
          } catch (error) {
            console.error(`❌ Error loading ${basin.file}:`, error);
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
        } catch (error) {
          console.error(`❌ Error loading ${centroidsFile}:`, error);
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
      console.log("🌊 Loading river order data...");
      const hydrologyTheme = themes.find((theme) => theme.id === "hydrology");

      if (hydrologyTheme?.subThemes) {
        for (const riverOrder of hydrologyTheme.subThemes) {
          if (!riverData[riverOrder.id]) {
            try {
              console.log(`📥 Loading ${riverOrder.file}...`);
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
            } catch (error) {
              console.error(`❌ Error loading ${riverOrder.file}:`, error);
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
      {/* Loading indicator */}
      {loadingLayers.size > 0 && (
        <div className="absolute top-4 left-4 z-[9999] bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
          Loading {loadingLayers.size} layer{loadingLayers.size > 1 ? "s" : ""}
          ...
        </div>
      )}

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

        {/* Clicked Marker */}
        {clickedMarker && (
          <Marker
            position={[clickedMarker.lat, clickedMarker.lng]}
            icon={defaultIcon}
          >
            <Popup ref={popupRef}>
              <div className="text-center">
                <strong>{popupContent}</strong>
              </div>
            </Popup>
          </Marker>
        )}

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
