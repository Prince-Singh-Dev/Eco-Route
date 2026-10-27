# EcoRoute — Green Route Optimization System

EcoRoute is a graph-based route optimization project that finds shortest paths between connected locations and estimates the CO₂ emissions associated with a journey. It combines a C-based graph algorithm engine with a browser-based web interface built using HTML, CSS, JavaScript, and Node.js.

The project uses a road network represented as a weighted graph. Users can select a starting point and destination, choose between Dijkstra's and Floyd–Warshall algorithms, visualize the calculated route on a schematic map, and compare estimated emissions for different modes of transport.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Phase-Wise Implementation](#phase-wise-implementation)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
- [How to Use](#how-to-use)
- [Algorithms Used](#algorithms-used)
- [CO₂ Emission Estimation](#co-emission-estimation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

## Project Overview

Finding an efficient route between two locations can be represented as a shortest-path problem in graph theory.

EcoRoute models locations as **vertices (nodes)** and roads between them as **weighted edges**. Each edge represents the distance between two connected locations.

The application uses this graph to calculate shortest routes and presents the results through a web interface.

The project also introduces a sustainability aspect by estimating direct operational CO₂ emissions for different transport modes based on the calculated route distance.

## Features

- **Location Network:** Represents connected locations using a weighted graph.
- **Shortest-Path Algorithms:** Supports Dijkstra's and Floyd–Warshall algorithms.
- **Algorithm Selection:** Allows users to choose the routing algorithm through the web interface.
- **Interactive Route Planner:** Select a source and destination from dropdown menus.
- **Schematic Network Map:** Displays locations, network connections, and the selected route.
- **Route Information:** Shows the calculated distance and sequence of locations.
- **CO₂ Estimation:** Compares estimated emissions for a petrol car, motorcycle, public bus, and walking/cycling.
- **C Backend:** Performs graph processing and shortest-path calculations.
- **Node.js Server:** Connects the browser interface with the C program.
- **CSV-Based Network:** Stores road connections and distances in `data/roads.csv`.
- **Zoom Controls:** Allows users to zoom in, zoom out, and reset the map view.

## Technology Stack

| Technology | Purpose |
|---|---|
| C | Graph representation and shortest-path algorithms |
| HTML5 | Webpage structure |
| CSS3 | Styling and responsive layout |
| JavaScript | User interaction, map rendering, and API requests |
| Node.js | Local HTTP server and C backend integration |
| CSV | Storage of road network data |
| GCC | Compiling the C backend |

## Phase-Wise Implementation

### Phase 1 — Graph Representation and Traversal

**Objective:** Build the basic road network and implement fundamental graph operations.

Implementation:

- Represent locations as vertices in a graph.
- Represent roads as weighted edges.
- Store the network in an adjacency matrix in the command-line implementation.
- Load and display location and distance information.
- Implement Breadth-First Search (BFS) for graph traversal.
- Implement Depth-First Search (DFS) for graph traversal.
- Create a menu-driven command-line interface.

**Outcome:** A working C-based graph system that supports location display, distance information, and graph traversal.

### Phase 2 — Shortest-Path Algorithms and Route Optimization

**Objective:** Calculate shortest routes between selected locations.

Implementation:

- Implement Dijkstra's algorithm for single-source shortest-path calculation.
- Implement Floyd–Warshall for all-pairs shortest-path calculation.
- Reconstruct the selected route using predecessor or next-hop information.
- Calculate the total distance of the resulting route.
- Read the road network from `data/roads.csv`.
- Create `ecoroute_api.c` to provide structured JSON output for the web application.

**Outcome:** The C backend can calculate routes using either algorithm and return the route, distance, and estimated emissions data to the server.

### Phase 3 — Web GUI and Backend Integration

**Objective:** Build a browser-based interface for using the route optimization system.

Implementation:

- Create the webpage using HTML.
- Style the interface with CSS.
- Implement frontend interaction using JavaScript.
- Build a Node.js HTTP server in `server.js`.
- Compile and execute the C backend through the server.
- Provide API endpoints for graph data and route calculations.
- Connect the source and destination selectors to the backend.
- Add algorithm selection for Dijkstra and Floyd–Warshall.
- Display the calculated route on a custom SVG schematic map.
- Add map zoom, reset, and location-swap controls.
- Display route distance, route sequence, and estimated CO₂ emissions.

**Outcome:** A functioning browser-based route planner that integrates the C algorithms with a web interface.

### Phase 4 — Testing, Documentation, and Repository Preparation

**Objective:** Prepare the project for demonstration, evaluation, and sharing.

Implementation:

- Test graph loading and API responses.
- Verify that both shortest-path algorithms can be selected.
- Test source and destination selection.
- Check route distance and route visualization.
- Verify that emission estimates are displayed.
- Document the installation and execution process.
- Prepare the repository with source files and required data.
- Exclude generated executables and unnecessary local files from version control.

**Outcome:** A documented project that can be shared through GitHub and run on a compatible development environment.

## Project Structure

```text
EcoRoute-Web-GUI/
│
├── public/
│   ├── index.html          # Webpage structure
│   ├── style.css           # Styling and responsive layout
│   └── app.js              # Frontend logic and SVG map
│
├── data/
│   └── roads.csv           # Road network and distance data
│
├── ecoroute_api.c          # C backend adapter for the web GUI
├── main.c                  # Command-line C implementation
├── server.js               # Node.js HTTP server
├── package.json            # Project scripts and dependencies
├── README.md               # Project documentation
└── .gitignore              # Files excluded from Git
```

The generated executable, such as `ecoroute_api.exe` on Windows, does not need to be committed if the server compiles it automatically.

## Requirements

Install the following software before running the project:

- **Node.js and npm:** For running the local web server.
- **GCC:** For compiling the C backend.
- **Git:** Optional, for cloning the repository.

Verify the installations in your terminal:

```bash
node --version
npm --version
gcc --version
```

The project does not require external npm packages if `server.js` uses only Node.js built-in modules.

## Installation and Setup

### 1. Clone the Repository

Replace `YOUR-USERNAME` with the GitHub username that owns the repository.

```bash
git clone https://github.com/YOUR-USERNAME/EcoRoute-Web-GUI.git
```

### 2. Open the Project Folder

```bash
cd EcoRoute-Web-GUI
```

Open this folder in VS Code if desired.

**Important:** Open the actual project root containing `package.json`, `server.js`, `ecoroute_api.c`, `data/`, and `public/`.

### 3. Verify the Requirements

```bash
node --version
gcc --version
```

If either command is unavailable, install the missing software and ensure its executable is available through your system's PATH.

### 4. Start the Application

Run:

```bash
npm start
```

The server starts the application and, according to the server configuration, compiles the C backend when needed.

### 5. Open the Web Application

Open the following address in your browser:

http://localhost:3000

No separate frontend development server is required.

> If the project adds npm dependencies in the future, run `npm install` before `npm start`. With the current dependency-free setup, `npm start` should be sufficient once Node.js, GCC, and the project files are available.

## How to Use

1. Start the application using `npm start`.
2. Open `http://localhost:3000`.
3. Select a starting point.
4. Select a destination.
5. Choose either **Dijkstra's Algorithm** or **Floyd–Warshall Algorithm**.
6. Click **Find best route**.
7. Review the calculated route and total distance.
8. Inspect the route highlighted on the schematic map.
9. Compare the estimated CO₂ emissions for different transport modes.
10. Use the map controls to zoom in, zoom out, or reset the view.

The application uses the distances stored in `data/roads.csv`; it does not retrieve live traffic or real-time road conditions.

## Algorithms Used

### Dijkstra's Algorithm

Dijkstra's algorithm calculates shortest paths from a selected source to other reachable vertices in a weighted graph with non-negative edge weights.

In EcoRoute, it is used to calculate the shortest route between the selected starting point and destination.

### Floyd–Warshall Algorithm

Floyd–Warshall calculates shortest paths between all pairs of vertices using dynamic programming.

It repeatedly considers whether travelling through an intermediate vertex produces a shorter path. A next-hop matrix is used by the implementation to reconstruct the selected route.

### Complexity Comparison

Let `V` represent the number of vertices and `E` represent the number of edges.

| Algorithm | Time Complexity | Purpose |
|---|---|---|
| Dijkstra with an adjacency matrix | O(V²) | Single-source shortest paths |
| Floyd–Warshall | O(V³) | All-pairs shortest paths |
| BFS | O(V + E) | Graph traversal |
| DFS | O(V + E) | Graph traversal |

The stated BFS and DFS complexities assume an adjacency-list representation. Implementations using an adjacency matrix may require O(V²) time.

## CO₂ Emission Estimation

EcoRoute estimates direct operational CO₂ emissions using the following formula:

**Estimated emissions = Route distance × Emission factor**

The application compares these transport modes:

- Petrol car
- Motorcycle
- Public bus
- Walking/cycling

Emission factors are illustrative project values. They are intended to demonstrate how route distance can be used to estimate emissions, rather than to provide verified environmental measurements.

Walking/cycling is assigned zero direct operational emissions in this model.

## API Endpoints

The Node.js server exposes endpoints used by the browser interface.

### Get the Graph

```http
GET /api/graph
```

Returns the locations and road connections loaded from the CSV file.

### Calculate a Route

```http
GET /api/route?source=0&destination=1&algorithm=dijkstra
```

Calculates a route using Dijkstra's algorithm.

To use Floyd–Warshall:

```http
GET /api/route?source=0&destination=1&algorithm=floyd-warshall
```

The route response contains the selected source and destination, total distance, algorithm name, route as a sequence of location IDs, and emission estimates.

The IDs in these examples are illustrative; use IDs that exist in the loaded graph.

## Testing

Before demonstrating the project, check the following:

- [ ] `npm start` launches the server without errors.
- [ ] The browser can load the location network.
- [ ] The source and destination selectors contain the expected places.
- [ ] Dijkstra calculates and displays a route.
- [ ] Floyd–Warshall calculates and displays a route.
- [ ] The total route distance is displayed.
- [ ] The selected route is highlighted on the map.
- [ ] The emissions cards display estimated values.
- [ ] The zoom, reset, and swap controls work.
- [ ] The application reports errors when a route cannot be calculated.

You can also test the API endpoints directly in your browser.

## Limitations

- The map is schematic and is not geographically accurate or to scale.
- The supplied road distances are illustrative demo data, not verified real-world distances.
- The application does not use live traffic, road closures, or real-time navigation.
- CO₂ estimates use fixed illustrative factors and do not account for traffic, occupancy, vehicle condition, or road-specific conditions.
- Shortest distance does not necessarily mean shortest travel time or lowest actual emissions.
- Running the project requires Node.js, GCC, and a compatible environment.
- The server's compiler command and executable handling may need adjustment for operating systems other than the environment in which it was developed.

## Future Enhancements

Possible extensions include:

- Integrating verified geographic road data.
- Displaying real geographic maps.
- Adding travel-time-based route optimization.
- Introducing user-defined emission factors.
- Comparing routes by distance, time, and estimated emissions.
- Adding more graph algorithms and performance comparisons.
- Improving automated tests and error handling.
- Supporting additional operating systems with platform-aware compilation.

## Author

**Prince Kumar Singh**

EcoRoute — Green Route Optimization System

A student project combining Data Structures and Algorithms, C programming, web development, and sustainability concepts.
