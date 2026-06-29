const fs = require("fs");

const INPUT_FILE = "./public/street_data/warsaw.geojson";
const OUTPUT_FILE = "./public/street_data/clean.geojson";

function clean(data) {
  const allowed = new Set([
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "residential",
    "living_street",
    "unclassified",
    "service",
  ]);

  const features = data.features ?? [];
  const result = [];

  for (const f of features) {
    const name = f.properties?.name;
    const highway = f.properties?.highway;

    // 1. tylko ulice z nazwą
    if (!name || !highway) continue;

    // 2. filtr dróg
    if (!allowed.has(highway)) continue;

    let coords = [];

    // 3. Polygon → LineString
    if (f.geometry?.type === "Polygon") {
      coords = f.geometry.coordinates?.[0] ?? [];
    } else if (f.geometry?.type === "LineString") {
      coords = f.geometry.coordinates ?? [];
    }

    if (!coords.length) continue;

    // 4. konwersja OSM [lng, lat] → Leaflet [lat, lng]
    coords = coords.map(([lng, lat]) => [lat, lng]);

    result.push({
      type: "Feature",
      properties: { name },
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features: result,
  };
}

// ===== RUN =====

const raw = fs.readFileSync(INPUT_FILE, "utf8");
const json = JSON.parse(raw);

const cleaned = clean(json);

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(cleaned, null, 2)
);

console.log("✅ Done! Cleaned file saved to:", OUTPUT_FILE);