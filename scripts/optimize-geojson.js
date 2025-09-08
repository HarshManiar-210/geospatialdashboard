#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Optimize GeoJSON files by reducing precision and simplifying geometries
 */

const PRECISION = 6; // Decimal places for coordinates
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

function roundCoordinate(coord, precision = PRECISION) {
  return Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision);
}

function simplifyCoordinates(coordinates, precision = PRECISION) {
  if (Array.isArray(coordinates[0])) {
    return coordinates.map((coord) => simplifyCoordinates(coord, precision));
  }
  return [
    roundCoordinate(coordinates[0], precision),
    roundCoordinate(coordinates[1], precision),
  ];
}

function simplifyGeometry(geometry, precision = PRECISION) {
  if (!geometry || !geometry.coordinates) return geometry;

  return {
    ...geometry,
    coordinates: simplifyCoordinates(geometry.coordinates, precision),
  };
}

function optimizeGeoJSON(geoJson, options = {}) {
  const { precision = PRECISION, removeProperties = [] } = options;

  if (!geoJson.features) return geoJson;

  const optimizedFeatures = geoJson.features.map((feature) => {
    const optimizedFeature = {
      ...feature,
      geometry: simplifyGeometry(feature.geometry, precision),
    };

    // Remove unnecessary properties
    if (removeProperties.length > 0 && feature.properties) {
      const filteredProperties = { ...feature.properties };
      removeProperties.forEach((prop) => {
        delete filteredProperties[prop];
      });
      optimizedFeature.properties = filteredProperties;
    }

    return optimizedFeature;
  });

  return {
    ...geoJson,
    features: optimizedFeatures,
  };
}

function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

function optimizeFile(inputPath, outputPath, options = {}) {
  const originalSize = getFileSizeInMB(inputPath);

  if (originalSize < 1) {
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    const optimized = optimizeGeoJSON(data, options);

    fs.writeFileSync(outputPath, JSON.stringify(optimized));
  } catch (error) {
    // Silent error handling for production
  }
}

function main() {
  const publicDir = path.join(__dirname, "../public");
  const backupDir = path.join(publicDir, "backup");

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Files to optimize with their specific settings
  const filesToOptimize = [
    {
      name: "Roads_layer.geojson",
      precision: 5, // Less precision for roads
      removeProperties: ["OBJECTID", "Shape_Leng"], // Remove unnecessary properties
    },
    {
      name: "Talukas.geojson",
      precision: 6,
      removeProperties: ["OBJECTID"],
    },
    {
      name: "Districts.geojson",
      precision: 6,
      removeProperties: ["OBJECTID"],
    },
    {
      name: "Mahi_Streams.geojson",
      precision: 5,
      removeProperties: ["OBJECTID"],
    },
    {
      name: "order1.geojson",
      precision: 5,
      removeProperties: ["OBJECTID"],
    },
    {
      name: "order2.geojson",
      precision: 5,
      removeProperties: ["OBJECTID"],
    },
  ];

  filesToOptimize.forEach((fileConfig) => {
    const inputPath = path.join(publicDir, fileConfig.name);
    const backupPath = path.join(backupDir, fileConfig.name);
    const outputPath = inputPath; // Overwrite original

    if (fs.existsSync(inputPath)) {
      // Create backup
      fs.copyFileSync(inputPath, backupPath);

      // Optimize
      optimizeFile(inputPath, outputPath, {
        precision: fileConfig.precision,
        removeProperties: fileConfig.removeProperties,
      });
    }
  });
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeGeoJSON, optimizeFile };
