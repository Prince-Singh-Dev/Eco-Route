const $ = (id) => document.getElementById(id);

const sourceSelect = $("source");
const destinationSelect = $("destination");
const algorithmSelect = $("algorithm");
const svg = $("map");

let graphData = null;
let routeData = null;
let positions = {};
let zoomLevel = 1;
let view = { x: 0, y: 0, width: 1000, height: 620 };

const NS = "http://www.w3.org/2000/svg";
const W = 1000;
const H = 620;

// Approximate coordinates arrange the map illustration.
// Road distances come from the project CSV file.
const coordinates = {
  "MRIIRS Main Gate": [28.4507, 77.2827],
  "MRIIRS Academic Block": [28.4498, 77.2850],
  "MRIIRS Library": [28.4502, 77.2845],
  "MRIIRS Canteen": [28.4501, 77.2857],
  "MRIIRS Hostel": [28.4489, 77.2860],
  "MRIIRS Auditorium": [28.4494, 77.2861],
  "MRIIRS Sports Complex": [28.4486, 77.2870],
  "MRIIRS Medical Centre": [28.4497, 77.2877],
  "Delhi-Surajkund Road Junction": [28.4510, 77.2805],
  "Surajkund Road Crossing": [28.4540, 77.2885],
  "Anangpur Village": [28.4710, 77.2825],
  "Charmwood Village": [28.4660, 77.2910],
  "Greenfield Colony": [28.4620, 77.3000],
  "Badarpur Border": [28.4930, 77.3030],
  "Surajkund": [28.4750, 77.2690],
  "NHPC Chowk Metro Station": [28.4577, 77.3074],
  "NHPC Chowk": [28.4570, 77.3070],
  "Sector 37 Market": [28.4520, 77.3110],
  "Badkal Chowk": [28.4310, 77.3000],
  "Badkal Mor Metro Station": [28.4228, 77.3103],
  "NIT 5 Market": [28.3950, 77.2960],
  "BK Chowk": [28.3970, 77.3050],
  "NIT 1 Market": [28.3980, 77.3150],
  "Old Faridabad Metro Station": [28.4108, 77.3114],
  "Sector 15 Market": [28.4140, 77.3190],
  "Sector 16 Market": [28.4190, 77.3190],
  "Bata Chowk Metro Station": [28.3850, 77.3130],
  "Escorts Mujesar Metro Station": [28.3670, 77.3160],
  "Tughlakabad Metro Station": [28.5190, 77.2960],
  "Sarai Metro Station": [28.4800, 77.3035],
  "Sector 21C Market": [28.4280, 77.2950]
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function svgEl(tag, attrs = {}, text) {
  const element = document.createElementNS(NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (text !== undefined) element.textContent = text;
  return element;
}

function add(parent, tag, attrs = {}, text) {
  const element = svgEl(tag, attrs, text);
  parent.appendChild(element);
  return element;
}

function clearSvg() {
  svg.replaceChildren();
}

function fillSelect(select, places) {
  select.replaceChildren();

  places.forEach((place) => {
    const option = document.createElement("option");
    option.value = place.id;
    option.textContent = place.name;
    select.appendChild(option);
  });
}

function getPlace(id) {
  return graphData?.places.find((place) => place.id === Number(id));
}

function pointFor(place) {
  return coordinates[place.name] || null;
}

// Convert approximate latitude/longitude into map illustration coordinates.
function calculatePositions() {
  const known = graphData.places
    .map((place) => ({ place, coordinate: pointFor(place) }))
    .filter((item) => item.coordinate);

  if (!known.length) {
    throw new Error("No place coordinates are available for the map.");
  }

  const latitudes = known.map((item) => item.coordinate[0]);
  const longitudes = known.map((item) => item.coordinate[1]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const padX = 85;
  const padY = 65;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  positions = {};

  known.forEach(({ place, coordinate }) => {
    const [lat, lon] = coordinate;

    positions[place.id] = {
      x: padX + ((lon - minLon) / (maxLon - minLon || 1)) * usableW,
      y: padY + ((maxLat - lat) / (maxLat - minLat || 1)) * usableH
    };
  });
}

function edgeKey(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

// Draw slightly curved network links for visual clarity.
function roadPath(a, b, seed = 0) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = ((seed % 3) - 1) * Math.min(24, length * 0.12);
  const mx = (a.x + b.x) / 2 - (dy / length) * bend;
  const my = (a.y + b.y) / 2 + (dx / length) * bend;

  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

function addDefs() {
  const defs = add(svg, "defs");

  const pattern = add(defs, "pattern", {
    id: "mapDots",
    width: 22,
    height: 22,
    patternUnits: "userSpaceOnUse"
  });

  add(pattern, "circle", {
    cx: 2,
    cy: 2,
    r: 1,
    fill: "#d9e0d2"
  });

  const gradient = add(defs, "linearGradient", {
    id: "mapWash",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  });

  add(gradient, "stop", {
    offset: "0%",
    "stop-color": "#f5f6ec"
  });

  add(gradient, "stop", {
    offset: "100%",
    "stop-color": "#eaf0e3"
  });

  const shadow = add(defs, "filter", {
    id: "labelShadow",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%"
  });

  add(shadow, "feDropShadow", {
    dx: 0,
    dy: 2,
    stdDeviation: 2,
    "flood-color": "#314832",
    "flood-opacity": 0.08
  });
}

function drawBackground(scene) {
  add(scene, "rect", {
    x: 0,
    y: 0,
    width: W,
    height: H,
    fill: "url(#mapWash)"
  });

  add(scene, "rect", {
    x: 0,
    y: 0,
    width: W,
    height: H,
    fill: "url(#mapDots)",
    opacity: 0.6
  });

  const parks = [
    [75, 80, 145, 76],
    [345, 112, 110, 70],
    [720, 100, 155, 88],
    [135, 390, 155, 85],
    [510, 455, 140, 74],
    [805, 365, 105, 110]
  ];

  parks.forEach(([x, y, width, height], index) => {
    add(scene, "rect", {
      x,
      y,
      width,
      height,
      rx: 17,
      fill: index % 2 ? "#e0ead7" : "#e5ecd9",
      opacity: 0.9
    });

    for (let i = 0; i < 5; i++) {
      add(scene, "circle", {
        cx: x + 20 + i * ((width - 40) / 4),
        cy: y + height / 2 + Math.sin(i * 2) * 12,
        r: 4 + (i % 2),
        fill: "#c8ddbd",
        opacity: 0.9
      });
    }
  });

  const blocks = [
    [245, 65, 46, 24], [300, 65, 32, 24],
    [490, 70, 54, 29], [552, 70, 30, 29],
    [630, 155, 44, 25], [685, 155, 38, 25],
    [75, 250, 48, 28], [130, 250, 32, 28],
    [365, 270, 48, 25], [420, 270, 35, 25],
    [675, 285, 48, 25], [730, 285, 35, 25],
    [300, 505, 46, 24], [355, 505, 34, 24],
    [690, 500, 45, 24], [745, 500, 36, 24]
  ];

  blocks.forEach(([x, y, width, height]) => {
    add(scene, "rect", {
      x,
      y,
      width,
      height,
      rx: 4,
      fill: "#f9faf4",
      stroke: "#e1e7d9",
      "stroke-width": 1
    });
  });

  [
    [145, 185, "GREEN BELT"],
    [400, 205, "RESIDENTIAL AREA"],
    [790, 220, "FARIDABAD"],
    [215, 495, "LOCAL STREETS"],
    [590, 555, "CONNECTED NETWORK"]
  ].forEach(([x, y, label]) => {
    add(scene, "text", {
      x,
      y,
      class: "road-label",
      opacity: 0.65,
      "text-anchor": "middle"
    }, label);
  });
}

function drawDecorativeStreets(scene) {
  const roads = [
    "M -30 215 Q 150 165 310 230 T 620 205 T 1030 250",
    "M 70 -20 Q 130 140 105 300 T 150 650",
    "M 285 -20 Q 250 140 330 290 T 290 650",
    "M 580 -20 Q 520 140 605 300 T 565 650",
    "M 845 -20 Q 785 140 835 300 T 890 650",
    "M -20 350 Q 190 320 390 375 T 800 350 T 1030 385",
    "M -20 475 Q 180 430 370 485 T 740 470 T 1030 500",
    "M 190 10 Q 360 120 460 170 T 760 110",
    "M 410 620 Q 490 500 575 425 T 760 300"
  ];

  roads.forEach((path, index) => {
    add(scene, "path", {
      d: path,
      class: "map-road-casing",
      "stroke-width": index < 3 ? 9 : 6,
      opacity: 0.8
    });

    add(scene, "path", {
      d: path,
      class: "map-road",
      "stroke-width": index < 3 ? 6 : 4,
      opacity: 0.95
    });
  });
}

function drawNetworkRoads(scene) {
  const routeIds = routeData?.route || [];
  const selectedEdges = new Set();

  for (let i = 0; i < routeIds.length - 1; i++) {
    selectedEdges.add(edgeKey(routeIds[i], routeIds[i + 1]));
  }

  graphData.roads.forEach((road, index) => {
    const a = positions[road.source];
    const b = positions[road.destination];

    if (!a || !b) return;

    const path = roadPath(a, b, index);
    const selected = selectedEdges.has(
      edgeKey(road.source, road.destination)
    );

    if (selected) {
      add(scene, "path", {
        d: path,
        class: "map-road-casing selected-casing",
        "stroke-width": 10
      });

      add(scene, "path", {
        d: path,
        class: "map-road selected",
        "stroke-width": 5,
        "stroke-dasharray": "10 5"
      });
    } else {
      add(scene, "path", {
        d: path,
        class: "map-road-casing major-casing",
        "stroke-width": 6,
        opacity: 0.95
      });

      add(scene, "path", {
        d: path,
        class: "map-road major",
        "stroke-width": 3,
        opacity: 0.98
      });
    }

    if (selected) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;

      add(scene, "text", {
        x: mx + 5,
        y: my - 8,
        class: "road-label",
        "text-anchor": "middle"
      }, `${Number(road.distance).toFixed(1)} km*`);
    }
  });
}

function drawPlaceMarkers(scene) {
  const routeIds = new Set(routeData?.route || []);
  const sourceId = Number(sourceSelect.value);
  const destinationId = Number(destinationSelect.value);

  graphData.places.forEach((place) => {
    const position = positions[place.id];
    if (!position) return;

    const isStart = place.id === sourceId;
    const isEnd = place.id === destinationId;
    const isRoute = routeIds.has(place.id);

    const group = add(scene, "g", {
      class:
        "node-hit" +
        (isStart ? " node-start" : "") +
        (isEnd ? " node-end" : "") +
        (isRoute ? " node-route" : ""),
      tabindex: 0,
      role: "button",
      "aria-label": `Select ${place.name}`
    });

    group.style.cursor = "pointer";

    add(group, "circle", {
      cx: position.x,
      cy: position.y,
      r: isStart || isEnd ? 12 : 8,
      class: "node-halo"
    });

    add(group, "circle", {
      cx: position.x,
      cy: position.y,
      r: isStart || isEnd ? 6 : 4,
      class: "node-core"
    });

    const shortName = place.name
      .replace(/^MRIIRS /, "")
      .replace(" Metro Station", " Metro");

    const label = shortName.length > 23
      ? shortName.slice(0, 21) + "…"
      : shortName;

    const labelWidth = Math.min(
      190,
      Math.max(55, label.length * 5.8 + 16)
    );

    const putLeft = position.x > W * 0.72;
    const labelX = putLeft
      ? position.x - labelWidth - 11
      : position.x + 11;

    const labelY = position.y - 11;

    add(group, "rect", {
      x: labelX,
      y: labelY - 12,
      width: labelWidth,
      height: 20,
      rx: 6,
      class: "place-label-bg",
      filter: "url(#labelShadow)"
    });

    add(group, "text", {
      x: labelX + 8,
      y: labelY + 2,
      class: "place-label",
      "font-size": label.length > 19 ? 8 : 9
    }, label);

    const selectPlace = () => {
      if (sourceSelect.value === String(place.id)) {
        destinationSelect.value = String(place.id);
      } else {
        sourceSelect.value = String(place.id);
      }

      drawMap();
    };

    group.addEventListener("click", selectPlace);

    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPlace();
      }
    });
  });
}

function drawMap() {
  if (!graphData) return;

  clearSvg();
  addDefs();

  const scene = add(svg, "g", { id: "mapScene" });

  drawBackground(scene);
  drawDecorativeStreets(scene);
  drawNetworkRoads(scene);
  drawPlaceMarkers(scene);
  applyView();

  $("networkCount").textContent =
    `${graphData.places.length} places · ${graphData.roads.length} links`;

  $("map").setAttribute(
    "aria-label",
    "Custom illustrated EcoRoute network. Road distances are project CSV weights."
  );
}

function applyView() {
  svg.setAttribute(
    "viewBox",
    `${view.x} ${view.y} ${view.width} ${view.height}`
  );
}

function zoomMap(factor) {
  const nextWidth = Math.max(
    300,
    Math.min(1000, view.width / factor)
  );

  const nextHeight = nextWidth * (H / W);
  const centerX = view.x + view.width / 2;
  const centerY = view.y + view.height / 2;

  view = {
    x: centerX - nextWidth / 2,
    y: centerY - nextHeight / 2,
    width: nextWidth,
    height: nextHeight
  };

  zoomLevel = W / nextWidth;
  applyView();
}

function resetMapView() {
  view = { x: 0, y: 0, width: W, height: H };
  zoomLevel = 1;
  applyView();
}

function renderResults(data) {
  const source = getPlace(data.source);
  const destination = getPlace(data.destination);

  if (!source || !destination) {
    throw new Error("The C backend returned an unknown place ID.");
  }

  const routeNames = data.route.map(
    (id) => getPlace(id)?.name || `Place ${id}`
  );

  const algorithmName =
    data.algorithm === "floyd-warshall"
      ? "Floyd–Warshall"
      : "Dijkstra";

  $("results").innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="section-kicker">YOUR JOURNEY</div>
        <h2>Route summary</h2>
      </div>
      <span class="summary-icon">⌁</span>
    </div>

    <div class="route-stats">
      <div class="stat">
        <small>Distance (CSV graph weights)</small>
        <b>${Number(data.distance).toFixed(2)}
          <span class="unit">km</span>
        </b>
      </div>

      <div class="stat">
        <small>Places in route</small>
        <b>${data.route.length}</b>
      </div>
    </div>

    <div class="route-path">
      <strong>Algorithm: ${algorithmName}</strong>
      <strong>${esc(source.name)} → ${esc(destination.name)}</strong>
      <ol>
        ${routeNames.map((name) => `<li>${esc(name)}</li>`).join("")}
      </ol>
    </div>

    <p class="hint">
      ${
        data.algorithm === "floyd-warshall"
          ? "Floyd–Warshall calculates shortest paths between all pairs of places."
          : "Dijkstra calculates the shortest route from the selected starting point."
      }
      Route distances use roads.csv project weights. The illustrated roads
      are schematic, not turn-by-turn navigation.
    </p>
  `;

  $("emissionsGrid").innerHTML = data.emissions.map((emission) => {
    const icon =
      emission.mode === "Petrol car" ? "↗" :
      emission.mode === "Motorcycle" ? "↗" :
      emission.mode === "Public bus" ? "↗" : "✳";

    const iconClass =
      emission.mode === "Petrol car" ? "car-icon" :
      emission.mode === "Motorcycle" ? "bike-icon" :
      emission.mode === "Public bus" ? "bus-icon" : "walk-icon";

    return `
      <div class="emission-card ${
        emission.factor === 0 ? "emission-best" : ""
      }">
        <div class="emission-icon ${iconClass}">${icon}</div>
        <div class="emission-copy">
          <span>${esc(emission.mode)}</span>
          <strong>${Number(emission.kg).toFixed(3)} kg</strong>
          <small>${Number(emission.factor).toFixed(3)} kg CO₂ / km</small>
        </div>
      </div>
    `;
  }).join("");
}

async function findRoute() {
  $("error").textContent = "";

  if (!sourceSelect.value || !destinationSelect.value) {
    $("error").textContent =
      "Please select a starting point and destination.";
    return;
  }

  if (sourceSelect.value === destinationSelect.value) {
    $("error").textContent = "Choose two different places.";
    return;
  }

  const button = $("findRoute");
  button.disabled = true;
  button.innerHTML = "<span>Calculating route…</span>";

  try {
    const algorithm = algorithmSelect?.value || "dijkstra";

    const response = await fetch(
      `/api/route?source=${encodeURIComponent(sourceSelect.value)}` +
      `&destination=${encodeURIComponent(destinationSelect.value)}` +
      `&algorithm=${encodeURIComponent(algorithm)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The C backend could not calculate this route."
      );
    }

    if (
      !Array.isArray(data.route) ||
      !Number.isFinite(Number(data.distance))
    ) {
      throw new Error("The C backend returned an invalid route.");
    }

    routeData = data;
    renderResults(data);
    drawMap();
    resetMapView();
  } catch (error) {
    $("error").textContent = error.message;
    console.error("Route calculation failed:", error);
  } finally {
    button.disabled = false;
    button.innerHTML =
      '<span>Find best route</span><span class="button-arrow">↗</span>';
  }
}

async function init() {
  try {
    const response = await fetch("/api/graph");

    if (!response.ok) {
      throw new Error(`Graph API returned HTTP ${response.status}.`);
    }

    graphData = await response.json();

    if (
      !Array.isArray(graphData.places) ||
      !Array.isArray(graphData.roads) ||
      graphData.places.length === 0
    ) {
      throw new Error("The C backend returned an invalid or empty graph.");
    }

    fillSelect(sourceSelect, graphData.places);
    fillSelect(destinationSelect, graphData.places);

    if (graphData.places.length > 1) {
      destinationSelect.selectedIndex = 1;
    }

    calculatePositions();
    drawMap();

    $("results").querySelector(".empty-state")?.classList.add("ready");
  } catch (error) {
    $("error").textContent =
      "Could not load the C backend: " + error.message;

    console.error("EcoRoute initialization failed:", error);
  }
}

$("findRoute").addEventListener("click", findRoute);

$("swap").addEventListener("click", () => {
  const previousSource = sourceSelect.value;
  sourceSelect.value = destinationSelect.value;
  destinationSelect.value = previousSource;
  drawMap();
});

sourceSelect.addEventListener("change", drawMap);
destinationSelect.addEventListener("change", drawMap);

$("zoomIn").addEventListener("click", () => zoomMap(1.25));
$("zoomOut").addEventListener("click", () => zoomMap(0.8));
$("resetMap").addEventListener("click", resetMapView);

// Mouse-wheel zoom while the pointer is over the map.
$("mapCanvas").addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomMap(event.deltaY < 0 ? 1.12 : 0.89);
}, { passive: false });

init();