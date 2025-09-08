# Performance Optimization Guide

## Critical Issues & Solutions

### 1. 🚨 IMMEDIATE FIXES (High Impact)

#### A. Enable Gzip Compression on Server

```nginx
# Add to your nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    application/json
    application/geo+json
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

#### B. Add Caching Headers

```nginx
# Add to nginx.conf
location ~* \.(geojson|tif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### C. Implement Lazy Loading

Only load data when layers are actually visible:

```javascript
// Modified useEffect - only load visible layers
useEffect(() => {
  const loadGeoJsonData = async () => {
    const data = { ...geoJsonData };
    const centroids = { ...centroidsData };

    // Only load data for visible layers
    const visibleLayers = layers.filter((layer) => layer.visible);

    for (const layer of visibleLayers) {
      if (!data[layer.id]) {
        // Only load if not already loaded
        try {
          const response = await fetch(`/${layer.file}`);
          const geoJson = await response.json();
          data[layer.id] = geoJson;

          if (layer.centroidsFile && !centroids[layer.id]) {
            const centroidsResponse = await fetch(`/${layer.centroidsFile}`);
            centroids[layer.id] = await centroidsResponse.json();
          }
        } catch (error) {
          console.error(`Error loading ${layer.file}:`, error);
        }
      }
    }

    setGeoJsonData(data);
    setCentroidsData(centroids);
  };

  loadGeoJsonData();
}, [layers.map((l) => `${l.id}:${l.visible}`).join(",")]); // Only trigger when visibility changes
```

### 2. 🔧 MEDIUM TERM FIXES (Medium Impact)

#### A. Simplify Large GeoJSON Files

Use tools like `mapshaper` to reduce file sizes:

```bash
# Install mapshaper
npm install -g mapshaper

# Simplify large files (reduce precision and vertices)
mapshaper Roads_layer.geojson -simplify 10% -o Roads_layer_optimized.geojson
mapshaper Talukas.geojson -simplify 5% -o Talukas_optimized.geojson
mapshaper Districts.geojson -simplify 5% -o Districts_optimized.geojson
```

#### B. Pre-transform Coordinates Server-Side

Transform UTM coordinates to WGS84 during build time, not runtime:

```javascript
// Create a build script: scripts/transform-geojson.js
const fs = require("fs");
const proj4 = require("proj4");

proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const transformFile = (inputPath, outputPath) => {
  const data = JSON.parse(fs.readFileSync(inputPath));
  // Transform coordinates here...
  fs.writeFileSync(outputPath, JSON.stringify(data));
};
```

#### C. Implement Progressive Loading

Show a skeleton/loading state while data loads:

```javascript
const [loadingStates, setLoadingStates] = useState({});

const updateLoadingState = (layerId, isLoading) => {
  setLoadingStates((prev) => ({ ...prev, [layerId]: isLoading }));
};
```

### 3. 🚀 ADVANCED OPTIMIZATIONS (Long Term)

#### A. Implement Tile-Based Loading

Convert large GeoJSON files to vector tiles:

```bash
# Install tippecanoe for vector tile generation
# Generate tiles for large datasets
tippecanoe -o roads.mbtiles -z 14 -Z 8 Roads_layer.geojson
```

#### B. Use Web Workers for Heavy Processing

Move coordinate transformation to web workers:

```javascript
// worker.js
self.onmessage = function (e) {
  const { geoJson, projections } = e.data;
  // Transform coordinates in worker thread
  const transformed = transformGeoJSON(geoJson, projections);
  self.postMessage(transformed);
};
```

#### C. Implement Virtual Rendering

Only render features in current viewport:

```javascript
const useViewportFiltering = (features, bounds) => {
  return useMemo(() => {
    return features.filter((feature) => {
      // Check if feature intersects with current map bounds
      return isFeatureInBounds(feature, bounds);
    });
  }, [features, bounds]);
};
```

## 4. 📊 MONITORING & METRICS

Add performance monitoring:

```javascript
// Performance monitoring
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};
```

## 5. 🐳 DOCKER OPTIMIZATIONS

Optimize your Docker setup:

```dockerfile
# Multi-stage build with nginx optimization
FROM nginx:alpine
COPY nginx-optimized.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Enable gzip in nginx
RUN sed -i 's/#gzip/gzip/' /etc/nginx/nginx.conf
```

## Expected Performance Improvements

| Optimization           | Loading Time Reduction  | File Size Reduction |
| ---------------------- | ----------------------- | ------------------- |
| Gzip Compression       | 60-80%                  | 70-85%              |
| Lazy Loading           | 70-90%                  | N/A                 |
| GeoJSON Simplification | 30-50%                  | 40-60%              |
| Pre-transformation     | 40-60%                  | N/A                 |
| Caching                | 90%+ (subsequent loads) | N/A                 |

## Implementation Priority

1. **Week 1**: Gzip + Caching + Lazy Loading
2. **Week 2**: GeoJSON Simplification
3. **Week 3**: Pre-transformation
4. **Week 4**: Advanced optimizations
