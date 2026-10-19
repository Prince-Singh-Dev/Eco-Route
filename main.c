
#include <stdio.h>

#define V 7
#define INF 999999

// Locations in our EcoRoute network
const char *locations[V] = {
    "College",
    "Library",
    "Hostel",
    "Canteen",
    "Hospital",
    "Metro Station",
    "Sports Complex"
};

// Adjacency matrix: distance between connected locations in km
// 0 means there is no direct road between two different locations
int graph[V][V] = {
    {0, 4, 3, 0, 0, 0, 6},
    {4, 0, 0, 2, 0, 0, 0},
    {3, 0, 0, 5, 4, 5, 0},
    {0, 2, 5, 0, 0, 3, 0},
    {0, 0, 4, 0, 0, 6, 2},
    {0, 0, 5, 3, 6, 0, 0},
    {6, 0, 0, 0, 2, 0, 0}
};

void displayLocations(void) {
    printf("\n--- Available Locations ---\n");

    for (int i = 0; i < V; i++) {
        printf("%d. %s\n", i, locations[i]);
    }
}

void displayGraph(void) {
    printf("\n--- Distance Matrix (km) ---\n\n");

    printf("%-18s", "Location");

    for (int i = 0; i < V; i++) {
        printf("%-10d", i);
    }

    printf("\n");

    for (int i = 0; i < V; i++) {
        printf("%-18s", locations[i]);

        for (int j = 0; j < V; j++) {
            printf("%-10d", graph[i][j]);
        }

        printf("\n");
    }

    printf("\n0 between different locations means no direct road.\n");
}

void BFS(int start) {
    int visited[V] = {0};
    int queue[V];
    int front = 0, rear = 0;

    visited[start] = 1;
    queue[rear++] = start;

    printf("\nBFS Traversal: ");

    while (front < rear) {
        int current = queue[front++];
        printf("%s", locations[current]);

        if (front < rear) {
            printf(" -> ");
        }

        for (int i = 0; i < V; i++) {
            if (graph[current][i] > 0 && !visited[i]) {
                visited[i] = 1;
                queue[rear++] = i;
            }
        }
    }

    printf("\n");
}

void DFSVisit(int current, int visited[]) {
    visited[current] = 1;
    printf("%s ", locations[current]);

    for (int i = 0; i < V; i++) {
        if (graph[current][i] > 0 && !visited[i]) {
            DFSVisit(i, visited);
        }
    }
}

void DFS(int start) {
    int visited[V] = {0};

    printf("\nDFS Traversal: ");
    DFSVisit(start, visited);
    printf("\n");
}

void dijkstra(int source, int destination) {
    int distance[V];
    int visited[V] = {0};
    int parent[V];

    for (int i = 0; i < V; i++) {
        distance[i] = INF;
        parent[i] = -1;
    }

    distance[source] = 0;

    for (int count = 0; count < V; count++) {
        int current = -1;
        int minimum = INF;

        // Find the unvisited location with minimum distance
        for (int i = 0; i < V; i++) {
            if (!visited[i] && distance[i] < minimum) {
                minimum = distance[i];
                current = i;
            }
        }

        if (current == -1) {
            break;
        }

        visited[current] = 1;

        // Update distances of neighboring locations
        for (int i = 0; i < V; i++) {
            if (graph[current][i] > 0 && !visited[i]) {
                int newDistance = distance[current] + graph[current][i];

                if (newDistance < distance[i]) {
                    distance[i] = newDistance;
                    parent[i] = current;
                }
            }
        }
    }

    if (distance[destination] == INF) {
        printf("\nNo route exists between these locations.\n");
        return;
    }

    // Reconstruct the shortest route using parent[]
    int path[V];
    int pathLength = 0;
    int current = destination;

    while (current != -1) {
        path[pathLength++] = current;
        current = parent[current];
    }

    printf("\n--- Shortest Route ---\n");
    printf("From: %s\n", locations[source]);
    printf("To:   %s\n", locations[destination]);

    printf("Route: ");

    for (int i = pathLength - 1; i >= 0; i--) {
        printf("%s", locations[path[i]]);

        if (i > 0) {
            printf(" -> ");
        }
    }

    printf("\nTotal Distance: %d km\n", distance[destination]);
    printf("Algorithm: Dijkstra's Shortest Path Algorithm\n");
    printf("Time Complexity: O(V^2)\n");
}

int getLocationChoice(const char *message) {
    int choice;

    displayLocations();
    printf("%s", message);

    if (scanf("%d", &choice) != 1) {
        printf("Invalid input. Please restart and enter a number.\n");
        return -1;
    }

    if (choice < 0 || choice >= V) {
        printf("Invalid location number.\n");
        return -1;
    }

    return choice;
}

int main(void) {
    int choice;

    do {
        printf("\n====================================\n");
        printf("             ECOROUTE\n");
        printf("      Green Route Optimization\n");
        printf("====================================\n");
        printf("1. Display Locations\n");
        printf("2. Display Distance Matrix\n");
        printf("3. BFS Traversal\n");
        printf("4. DFS Traversal\n");
        printf("5. Find Shortest Route (Dijkstra)\n");
        printf("6. Exit\n");
        printf("Enter your choice: ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Please enter a number.\n");
            return 1;
        }

        switch (choice) {
            case 1:
                displayLocations();
                break;

            case 2:
                displayGraph();
                break;

            case 3: {
                int start = getLocationChoice("Enter starting location number: ");
                if (start != -1) {
                    BFS(start);
                }
                break;
            }

            case 4: {
                int start = getLocationChoice("Enter starting location number: ");
                if (start != -1) {
                    DFS(start);
                }
                break;
            }

            case 5: {
                int source = getLocationChoice("Enter source location number: ");

                if (source != -1) {
                    int destination = getLocationChoice(
                        "Enter destination location number: "
                    );

                    if (destination != -1) {
                        dijkstra(source, destination);
                    }
                }
                break;
            }

            case 6:
                printf("\nThank you for using EcoRoute!\n");
                break;

            default:
                printf("\nInvalid choice. Please select 1 to 6.\n");
        }

    } while (choice != 6);

    return 0;
}
