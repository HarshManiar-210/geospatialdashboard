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
import { closeLayersPopup, toggleLayerVisibility } from "../store/layersSlice";
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
import { useEffect, useState, useRef } from "react";
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

// Function to transform UTM coordinates to WGS84
const transformUTMToWGS84 = (geoJson) => {
  if (!geoJson || !geoJson.features) return geoJson;

  console.log("🔄 Transforming GeoJSON:", geoJson.name || "Unknown", {
    featureCount: geoJson.features?.length || 0,
    firstFeature: geoJson.features?.[0]?.geometry?.type || "Unknown",
  });

  const transformedFeatures = geoJson.features.map((feature, featureIndex) => {
    if (feature.geometry && feature.geometry.type === "MultiPolygon") {
      const transformedCoordinates = feature.geometry.coordinates.map(
        (polygon) =>
          polygon.map((ring) =>
            ring.map((coord) => {
              // Handle 3D coordinates (x, y, z) by taking only x, y
              const [x, y] = coord.slice(0, 2);
              try {
                const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
                return [lng, lat];
              } catch (error) {
                console.error("MultiPolygon transformation error:", error, {
                  x,
                  y,
                  coord,
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
    } else if (
      feature.geometry &&
      feature.geometry.type === "MultiLineString"
    ) {
      const transformedCoordinates = feature.geometry.coordinates.map(
        (lineString) =>
          lineString.map((coord) => {
            // Handle 3D coordinates (x, y, z) by taking only x, y
            const [x, y] = coord.slice(0, 2);
            try {
              const [lng, lat] = proj4("EPSG:32643", "EPSG:4326", [x, y]);
              return [lng, lat];
            } catch (error) {
              console.error("MultiLineString transformation error:", error, {
                x,
                y,
                coord,
              });
              return [x, y]; // Return original if transformation fails
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
      } catch (error) {
        console.error("Point transformation error:", error, { x, y });
        return feature; // Return original if transformation fails
      }
    }
    return feature;
  });

  console.log("✅ Transformation complete:", {
    originalFeatures: geoJson.features.length,
    transformedFeatures: transformedFeatures.length,
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
  const {
    showWaterShadeBasinPopup,
    showStatisticsPopup,
    basins,
    selectedBasins,
    centroidsFile,
  } = useSelector((state) => state.waterShadeBasin);
  const {
    riverData,
    selectedRiverOrders: riverOrders,
    selectedBasins: riverSelectedBasins,
  } = useSelector((state) => state.river);
  const [geoJsonData, setGeoJsonData] = useState({});
  const [centroidsData, setCentroidsData] = useState({});
  const [waterBasinData, setWaterBasinData] = useState({});
  const [waterBasinCentroidsData, setWaterBasinCentroidsData] = useState(null);
  const [mouseCoordinates, setMouseCoordinates] = useState(null);

  // State for click functionality
  const [clickedMarker, setClickedMarker] = useState(null);
  const [popupContent, setPopupContent] = useState("");
  const popupRef = useRef(null);

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

  const handleCloseStatisticsPopup = () => {
    dispatch(closeStatisticsPopup());
  };

  // Handle map click for GeoTIFF data fetching
  const handleMapClick = async (event) => {
    console.log("🖱️ Map clicked!", {
      event,
      selectedTheme,
      selectedSubTheme,
      latlng: event.latlng,
    });

    // If landuse is active, don't do anything
    if (selectedTheme === "landuse") {
      console.log("🚫 Landuse theme active - ignoring click");
      return;
    }

    // If hydrology is active, don't do anything
    if (selectedTheme === "hydrology") {
      console.log("🚫 Hydrology theme active - ignoring click");
      return;
    }

    // Only proceed for terrain sub-themes (elevation, slope, aspect)
    if (selectedTheme === "terrain") {
      console.log("🌄 Terrain theme active - processing click", {
        selectedSubTheme,
      });
      const { lat, lng } = event.latlng;

      // Determine which GeoTIFF file to load based on active sub-theme
      let tifFileName = "";
      let layerType = "";

      if (selectedSubTheme === "elevation") {
        tifFileName = "/MahiElevation.tif";
        layerType = "Elevation";
        console.log("📏 Selected Elevation sub-theme");
      } else if (selectedSubTheme === "slope") {
        tifFileName = "/MahiSlope.tif";
        layerType = "Slope";
        console.log("📐 Selected Slope sub-theme");
      } else if (selectedSubTheme === "aspect") {
        tifFileName = "/MahiAspect.tif";
        layerType = "Aspect";
        console.log("🧭 Selected Aspect sub-theme");
      } else {
        console.log("❌ No valid sub-theme selected:", selectedSubTheme);
        return; // No valid sub-theme selected
      }

      console.log("🎯 Processing GeoTIFF:", {
        tifFileName,
        layerType,
        coordinates: { lat, lng },
      });

      try {
        console.log("⏳ Starting GeoTIFF processing...");

        // Show global loader
        dispatch(
          setLoading({
            isLoading: true,
            message: `Loading ${layerType} data...`,
          })
        );

        console.log("📥 Fetching GeoTIFF file:", tifFileName);
        // Fetch GeoTIFF file
        const response = await fetch(tifFileName);
        console.log("📦 Response received:", {
          status: response.status,
          ok: response.ok,
          size: response.headers.get("content-length"),
        });

        const arrayBuffer = await response.arrayBuffer();
        console.log("📊 ArrayBuffer size:", arrayBuffer.byteLength);

        const tiff = await fromArrayBuffer(arrayBuffer);
        console.log("🗂️ TIFF loaded successfully");

        const image = await tiff.getImage();
        console.log("🖼️ Image loaded:", {
          width: image.getWidth(),
          height: image.getHeight(),
          bbox: image.getBoundingBox(),
        });

        const rasters = await image.readRasters();
        console.log("📈 Rasters loaded:", {
          count: rasters.length,
          firstRasterType: rasters[0]?.constructor?.name,
        });

        const bbox = image.getBoundingBox();
        console.log("🗺️ Bounding box:", bbox);

        const width = image.getWidth();
        const height = image.getHeight();

        console.log("📐 Image dimensions:", { width, height });

        // Convert lat/lng to pixel coordinates
        const x = ((lng - bbox[0]) / (bbox[2] - bbox[0])) * width;
        const y = ((bbox[3] - lat) / (bbox[3] - bbox[1])) * height;

        console.log("🎯 Pixel calculation:", {
          lat,
          lng,
          bbox,
          calculatedX: x,
          calculatedY: y,
          floorX: Math.floor(x),
          floorY: Math.floor(y),
        });

        const pixelIndex = Math.floor(y) * width + Math.floor(x);
        console.log("📍 Pixel index:", {
          pixelIndex,
          maxIndex: width * height - 1,
          isValid: pixelIndex >= 0 && pixelIndex < width * height,
        });

        let pixelValue = undefined;
        const raster0 = rasters[0];

        console.log("🔍 Extracting pixel value:", {
          rasterLength: raster0?.length,
          pixelIndex,
          rasterType: raster0?.constructor?.name,
        });

        if (Array.isArray(raster0)) {
          pixelValue = raster0[pixelIndex];
          console.log("📊 Array pixel value:", pixelValue);
        } else if (
          raster0 instanceof Float32Array ||
          raster0 instanceof Float64Array ||
          raster0 instanceof Int32Array ||
          raster0 instanceof Uint32Array ||
          raster0 instanceof Int16Array ||
          raster0 instanceof Uint16Array ||
          raster0 instanceof Int8Array ||
          raster0 instanceof Uint8Array
        ) {
          pixelValue = raster0[pixelIndex];
          console.log("📊 TypedArray pixel value:", pixelValue);
        } else {
          console.log("❌ Unknown raster type:", raster0?.constructor?.name);
        }

        // Update popup content
        const value = pixelValue !== undefined ? pixelValue.toFixed(2) : "N/A";
        const unit = layerType === "Elevation" ? " meters" : "";
        const popupText = `${layerType}: ${value}${unit}`;

        console.log("✅ Success! Creating popup:", {
          pixelValue,
          value,
          unit,
          popupText,
          coordinates: { lat, lng },
        });

        setPopupContent(popupText);

        // Set clicked marker position
        setClickedMarker({ lat, lng });
        console.log("📍 Marker set at:", { lat, lng });

        // Auto-open popup after a short delay
        setTimeout(() => {
          console.log("🔓 Attempting to open popup...");
          if (popupRef.current) {
            popupRef.current.openPopup();
            console.log("✅ Popup opened successfully");
          } else {
            console.log("❌ Popup ref not available");
          }
        }, 100);
      } catch (error) {
        console.error(`❌ Error loading ${tifFileName}:`, error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        setPopupContent(`Error loading ${layerType} data`);
        setClickedMarker({ lat, lng });

        // Auto-open popup for error case too
        setTimeout(() => {
          console.log("🔓 Attempting to open error popup...");
          if (popupRef.current) {
            popupRef.current.openPopup();
            console.log("✅ Error popup opened successfully");
          } else {
            console.log("❌ Error popup ref not available");
          }
        }, 100);
      } finally {
        console.log("🏁 GeoTIFF processing complete - hiding loader");
        // Hide global loader
        dispatch(setLoading({ isLoading: false, message: "" }));
      }
    } else {
      console.log("❌ Not terrain theme - ignoring click", {
        selectedTheme,
        selectedSubTheme,
      });
    }
  };

  // Image overlay bounds and current image
  const imageOffset = 0.03; // Offset to shift image to the right
  const topOffset = -0.01; // Offset to shift image up
  const imageBounds = [
    [21.6538526169347278 + topOffset, 72.4500108944436363 + imageOffset], // Southwest corner
    [24.599028110435821 + topOffset, 75.2870019434714663 + imageOffset], // Northeast corner
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

        // Transform centroids coordinates as well
        const transformedCentroids = transformUTMToWGS84(centroidsJson);

        setWaterBasinCentroidsData(transformedCentroids);
      } catch (error) {
        console.error(`Error loading ${centroidsFile}:`, error);
      }

      setWaterBasinData(data);
    };
    loadWaterBasinData();
  }, [basins, centroidsFile]);

  // Sync selected basins with river system
  useEffect(() => {
    dispatch(setRiverSelectedBasins(selectedBasins));
  }, [selectedBasins, dispatch]);

  // Load River Order data
  useEffect(() => {
    const loadRiverOrderData = async () => {
      console.log("🌊 Loading river order data...");
      const hydrologyTheme = themes.find((theme) => theme.id === "hydrology");
      console.log("🎯 Hydrology theme found:", !!hydrologyTheme);

      if (hydrologyTheme?.subThemes) {
        console.log(
          "📋 River orders to load:",
          hydrologyTheme.subThemes.map((r) => r.id)
        );

        for (const riverOrder of hydrologyTheme.subThemes) {
          try {
            console.log(
              `📥 Loading ${riverOrder.file} for order ${riverOrder.id}...`
            );
            const response = await fetch(`/${riverOrder.file}`);
            const geoJson = await response.json();
            console.log(`✅ Loaded ${riverOrder.file}:`, {
              type: geoJson.type,
              featureCount: geoJson.features?.length || 0,
              firstFeatureType:
                geoJson.features?.[0]?.geometry?.type || "Unknown",
            });

            // Transform UTM coordinates to WGS84
            const transformedGeoJson = transformUTMToWGS84(geoJson);

            // Store in river slice
            dispatch(
              setRiverData({ orderId: riverOrder.id, data: transformedGeoJson })
            );
            console.log(`💾 Stored river data for ${riverOrder.id}`);
          } catch (error) {
            console.error(`❌ Error loading ${riverOrder.file}:`, error);
          }
        }
      }
    };
    loadRiverOrderData();
  }, [themes, dispatch]);

  // Style function for GeoJSON layers
  const getLayerStyle = (layerId) => {
    const styles = {
      district: { color: "#000000", weight: 2, fillOpacity: 0.1 }, // Black for District Boundary
      talukas: { color: "#1f78b4", weight: 1, fillOpacity: 0.1 }, // Blue for Taluka Boundary
      road: { color: "#878787", weight: 2, fillOpacity: 0 }, // Gray for Road
      railways: { color: "#e31a1c", weight: 3, fillOpacity: 0 }, // Red for Railway
      canal: { color: "#2741ea", weight: 2, fillOpacity: 0 }, // Blue for Canal
    };
    return styles[layerId] || { color: "#000", weight: 1, fillOpacity: 0.1 };
  };

  // Style function for river orders with different thickness levels

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

  // Map events handler component (combines click and mouse events)
  const MapEventsHandler = () => {
    useMapEvents({
      click: (e) => {
        console.log("🎯 useMapEvents click event triggered");
        handleMapClick(e);
      },
      mousemove: (e) => {
        const { lat, lng } = e.latlng;
        setMouseCoordinates({ lat, lng });
      },
      mouseleave: () => {
        setMouseCoordinates(null);
      },
    });
    return null;
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
    <div className="relative h-screen w-full border rounded-xl">
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
                  color: "#7ac602", // Green for Vegetation Patches (MA-basins)
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
            {renderWaterBasinCentroids(waterBasinCentroidsData, selectedBasins)}
          </>
        )}

        {/* Render River Orders - Only when Hydrology theme is selected AND river orders are selected */}
        {selectedTheme === "hydrology" && riverOrders.length > 0 && (
          <>
            {console.log("🎨 Rendering rivers:", {
              selectedTheme,
              riverOrders,
              selectedBasins,
              riverSelectedBasins,
              riverDataKeys: Object.keys(riverData),
              hasRiverData: Object.keys(riverData).length > 0,
            })}
            {riverOrders.map((orderId) => {
              console.log(`🔍 Checking river order ${orderId}:`, {
                hasData: !!riverData[orderId],
                dataFeatures: riverData[orderId]?.features?.length || 0,
              });

              if (riverData[orderId]) {
                // Filter rivers by selected basins (use waterShadeBasinSlice selectedBasins)
                const filteredData = filterRiversByBasin(
                  riverData[orderId],
                  selectedBasins // This is from waterShadeBasinSlice
                );
                console.log(`🌊 Filtered data for ${orderId}:`, {
                  originalFeatures: riverData[orderId].features?.length || 0,
                  filteredFeatures: filteredData.features?.length || 0,
                  selectedBasins,
                });

                // Only render if there are features after filtering
                if (filteredData.features && filteredData.features.length > 0) {
                  console.log(
                    `✅ Rendering river order ${orderId} with ${filteredData.features.length} features`
                  );
                  return (
                    <GeoJSON
                      key={`river-order-${orderId}`}
                      data={filteredData}
                      style={() => ({
                        ...getRiverStyle(orderId),
                        color: "#013ddc", // Blue color for rivers (Waterbodies color)
                        weight: getRiverStyle(orderId).weight, // Use order-based thickness
                        opacity: 0.8,
                      })}
                    />
                  );
                } else {
                  console.log(
                    `❌ No features to render for ${orderId} after filtering`
                  );
                }
              } else {
                console.log(`❌ No data available for river order ${orderId}`);
              }
              return null;
            })}
          </>
        )}

        {/* Clicked Marker and Popup */}
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
}
