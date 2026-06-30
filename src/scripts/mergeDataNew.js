const fs = require("fs");

const INPUT = "./public/street_data/clean.geojson";
const OUTPUT = "./public/street_data/merged.geojson";

function pointKey([lat, lng]) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function segmentKey(segment) {
  const first = pointKey(segment[0]);
  const last = pointKey(segment[segment.length - 1]);

  // dzięki temu A->B i B->A są traktowane jako ten sam segment
  return first < last
    ? `${first}|${last}`
    : `${last}|${first}`;
}

function normalizeDirection(segment) {
  const first = pointKey(segment[0]);
  const last = pointKey(segment[segment.length - 1]);

  return first <= last ? segment : [...segment].reverse();
}

function run(data) {
  const streets = new Map();

  for (const feature of data.features) {
    const name = feature.properties?.name;
    const highway = feature.properties?.highway;
    const coords = feature.geometry?.coordinates;

    if (!name || !coords?.length) continue;

    if (!streets.has(name)) {
      streets.set(name, {
        highway,
        segments: [],
        seen: new Set(),
      });
    }

    const street = streets.get(name);

    const normalized = normalizeDirection(coords);
    const key = segmentKey(normalized);

    if (street.seen.has(key)) continue;

    street.seen.add(key);
    street.segments.push(normalized);
  }

  const features = [];

  for (const [name, street] of streets.entries()) {
    features.push({
      type: "Feature",
      properties: {
        name,
        highway: street.highway,
      },
      geometry: {
        type: "MultiLineString",
        coordinates: street.segments,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

const raw = fs.readFileSync(INPUT, "utf8");
const json = JSON.parse(raw);

const output = run(json);

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(output, null, 2)
);

console.log(`✅ Saved ${output.features.length} merged streets.`);