const fs = require("fs");

const INPUT = "./public/street_data/clean.geojson";
const OUTPUT = "./public/street_data/merged.geojson";

// key dla punktów (zaokrąglamy bo floaty są brudne)
function key([lat, lng]) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

// buduje adjacency list
function buildGraph(segments) {
  const graph = new Map();

  for (const seg of segments) {
    for (let i = 0; i < seg.length - 1; i++) {
      const a = key(seg[i]);
      const b = key(seg[i + 1]);

      if (!graph.has(a)) graph.set(a, new Set());
      if (!graph.has(b)) graph.set(b, new Set());

      graph.get(a).add(b);
      graph.get(b).add(a);
    }
  }

  return graph;
}

// znajduje start (node z 1 połączeniem)
function findStart(graph) {
  for (const [node, neighbors] of graph.entries()) {
    if (neighbors.size === 1) return node;
  }
  return graph.keys().next().value;
}

// rekonstrukcja linii
function walk(graph, start) {
  const visited = new Set();
  const result = [];

  let current = start;
  let prev = null;

  while (current) {
    visited.add(current);

    const [lat, lng] = current.split(",").map(Number);
    result.push([lat, lng]);

    const neighbors = graph.get(current);
    if (!neighbors) break;

    let next = null;

    for (const n of neighbors) {
      if (n !== prev && !visited.has(n)) {
        next = n;
        break;
      }
    }

    prev = current;
    current = next;
  }

  return result;
}

// merge per street
function mergeStreet(coordsList) {
  const graph = buildGraph(coordsList);

  const start = findStart(graph);

  return walk(graph, start);
}

// main
function run(data) {
  const map = new Map();

  for (const f of data.features) {
    const name = f.properties?.name;
    const highway = f.properties?.highway;
    const coords = f.geometry?.coordinates;

    if (!name || !coords?.length) continue;

    if (!map.has(name)) {
      map.set(name, { segments: [], highway });
    }

    const entry = map.get(name);
    if (highway && !entry.highway) {
      entry.highway = highway;
    }
    entry.segments.push(coords);
  }

  const result = [];

  for (const [name, entry] of map.entries()) {
    const segments = entry.segments;
    if (segments.length === 0) continue;

    const merged = mergeStreet(segments);

    if (merged.length < 2) continue;

    result.push({
      type: "Feature",
      properties: { name, highway: entry.highway },
      geometry: {
        type: "LineString",
        coordinates: merged,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features: result,
  };
}

// run
const raw = fs.readFileSync(INPUT, "utf8");
const json = JSON.parse(raw);

const out = run(json);

fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));

console.log("✅ Advanced merge done:", OUTPUT);