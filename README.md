#  EcoRoute — Green Route Optimization System

A C-based route optimization project that uses graph algorithms to find routes between locations based on road distances. The project is being developed as part of the Design and Analysis of Algorithms (DAA) course.

##  Project Overview

EcoRoute represents a small campus or city road network as a weighted graph. Locations are represented as vertices, and roads are represented as weighted edges, where the weight indicates the distance in kilometres.

The project uses graph algorithms to explore locations and calculate shortest routes. Future improvements will extend the system with all-pairs shortest paths, algorithm analysis, and estimated carbon emissions.

##  Objectives

- Represent a road network using a weighted graph.
- Implement Breadth-First Search (BFS) and Depth-First Search (DFS).
- Find the shortest route between two locations using Dijkstra's algorithm.
- Analyse the time and space complexity of the algorithms.
- Extend the system with additional route analysis and environmental-impact estimation.

##  Technology Stack

- **Language:** C
- **IDE:** Visual Studio Code
- **Compiler:** GCC
- **Data Structure:** Adjacency Matrix
- **Domain:** Graph Algorithms and Route Optimization

##  Development Progress

### Phase 1 — Core Implementation

**Status: Implemented; individual features are being tested.**

- [x] Project setup in VS Code.
- [x] Define seven predefined locations.
- [x] Represent road connections using a weighted adjacency matrix.
- [x] Display available locations.
- [x] Display the distance matrix.
- [x] Implement BFS traversal.
- [x] Implement DFS traversal.
- [x] Implement Dijkstra's shortest-route algorithm.
- [x] Display the selected route and total distance.
- [ ] Complete systematic testing of all menu options.

### Phase 2 — Algorithm Improvements

**Status: Planned.**

- [ ] Implement Floyd–Warshall for all-pairs shortest paths.
- [ ] Improve input validation and error handling.
- [ ] Add test cases for different source and destination pairs.
- [ ] Document algorithm time and space complexity.
- [ ] Compare shortest-path results from Dijkstra and Floyd–Warshall.

### Phase 3 — Environmental Analysis and Finalization

**Status: Planned.**

- [ ] Estimate CO₂ emissions using configurable emission factors.
- [ ] Compare route distances and estimated emissions.
- [ ] Improve menu presentation and user guidance.
- [ ] Add sample outputs and test-case documentation.
- [ ] Prepare the final project report and viva notes.

##  Algorithms and Complexity

The current implementation uses an adjacency matrix with `V` vertices.

| Algorithm | Purpose                               | Time Complexity |
|-----------|---------------------------------------|-----------------|
| BFS       | Traverse reachable locations          | O(V²)           |
| DFS       | Explore connected locations           | O(V²)           |
| Dijkstra  | Find a shortest route from one source | O(V²)           |

The listed complexities apply to the current adjacency-matrix implementation. The graph representation requires O(V²) space. Floyd–Warshall, planned for Phase 2, has O(V³) time complexity and O(V²) space complexity.

## ▶ How to Run

### Prerequisites

- GCC compiler installed.
- Visual Studio Code installed.

### Compile

Open a terminal in the project directory and run:

```powershell
gcc main.c -o ecoroute.exe
```

### Execute

```powershell
.\ecoroute.exe
```

##  Current Network

The program currently contains seven predefined locations:

1. College
2. Library
3. Hostel
4. Canteen
5. Hospital
6. Metro Station
7. Sports Complex

Road distances are predefined for demonstration and testing. The project does not currently use live maps, GPS, real-time traffic, or external routing APIs.

##  Expected Outcome

The completed project aims to demonstrate how graph algorithms can support route optimization and how algorithm analysis can be applied to a practical problem.

The proposed environmental feature will estimate emissions from route distance and a configurable emission factor. Such estimates will be illustrative rather than real-time measurements.

##  Academic Relevance

This project primarily applies graph representation, graph traversal, shortest-path algorithms, and time and space complexity analysis from the Design and Analysis of Algorithms course.

##  Project Status

**Currently developing — Phase 1 implemented; testing and future phases pending.**