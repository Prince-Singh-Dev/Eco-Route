
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_PLACES 35
#define NAME_LEN 100
#define MAX_LINE 256
#define INF 1e12

static char places[MAX_PLACES][NAME_LEN];
static double graph[MAX_PLACES][MAX_PLACES];
static int countPlaces = 0;

static void trim(char *s) {
    size_t n;
    char *p = s;

    while (isspace((unsigned char)*p)) p++;
    if (p != s) memmove(s, p, strlen(p) + 1);

    n = strlen(s);
    while (n && isspace((unsigned char)s[n - 1]))
        s[--n] = '\0';
}

static int find_or_add(const char *name) {
    for (int i = 0; i < countPlaces; i++)
        if (strcmp(places[i], name) == 0) return i;

    if (countPlaces >= MAX_PLACES) return -1;

    snprintf(places[countPlaces], NAME_LEN, "%s", name);
    return countPlaces++;
}

static int load_csv(const char *path) {
    FILE *f = fopen(path, "r");
    char line[MAX_LINE];
    int first = 1;

    if (!f) return 0;

    memset(graph, 0, sizeof(graph));
    countPlaces = 0;

    while (fgets(line, sizeof(line), f)) {
        char *a, *b, *c, *end;
        double d;

        trim(line);
        if (!line[0]) continue;

        if (first) {
            first = 0;
            if (strncmp(line, "source,", 7) == 0) continue;
        }

        a = strtok(line, ",");
        b = strtok(NULL, ",");
        c = strtok(NULL, ",");

        if (!a || !b || !c) {
            fclose(f);
            return 0;
        }

        trim(a);
        trim(b);
        trim(c);
        d = strtod(c, &end);

        if (end == c || *end || d <= 0) {
            fclose(f);
            return 0;
        }

        int u = find_or_add(a);
        int v = find_or_add(b);

        if (u < 0 || v < 0 || u == v) {
            fclose(f);
            return 0;
        }

        graph[u][v] = graph[v][u] = d;
    }

    fclose(f);
    return countPlaces > 0;
}

static void json_string(const char *s) {
    putchar('"');

    for (; *s; s++) {
        if (*s == '"' || *s == '\\') putchar('\\');

        if (*s == '\n') {
            printf("\\n");
            continue;
        }

        putchar(*s);
    }

    putchar('"');
}

static void print_graph(void) {
    printf("{\"places\":[");

    for (int i = 0; i < countPlaces; i++) {
        if (i) putchar(',');
        printf("{\"id\":%d,\"name\":", i);
        json_string(places[i]);
        putchar('}');
    }

    printf("],\"roads\":[");
    int first = 1;

    for (int i = 0; i < countPlaces; i++) {
        for (int j = i + 1; j < countPlaces; j++) {
            if (graph[i][j] <= 0) continue;

            if (!first) putchar(',');
            first = 0;

            printf(
                "{\"source\":%d,\"destination\":%d,\"distance\":%.3f}",
                i, j, graph[i][j]
            );
        }
    }

    printf("]}\n");
}

/* Dijkstra: shortest route from one source */
static int dijkstra(int src, int dst, double *distance, int *path) {
    double dist[MAX_PLACES];
    int used[MAX_PLACES] = {0};
    int parent[MAX_PLACES];
    int n = 0;

    for (int i = 0; i < countPlaces; i++) {
        dist[i] = INF;
        parent[i] = -1;
    }

    dist[src] = 0;

    for (int step = 0; step < countPlaces; step++) {
        int u = -1;
        double best = INF;

        for (int i = 0; i < countPlaces; i++) {
            if (!used[i] && dist[i] < best) {
                best = dist[i];
                u = i;
            }
        }

        if (u == -1) break;
        used[u] = 1;

        if (u == dst) break;

        for (int v = 0; v < countPlaces; v++) {
            if (graph[u][v] > 0 && !used[v] &&
                dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }

    if (dist[dst] >= INF / 2) return 0;

    for (int at = dst; at != -1; at = parent[at])
        path[n++] = at;

    /* Reverse path so it runs from source to destination. */
    for (int i = 0; i < n / 2; i++) {
        int temp = path[i];
        path[i] = path[n - 1 - i];
        path[n - 1 - i] = temp;
    }

    *distance = dist[dst];
    return n;
}

/* Floyd-Warshall: shortest paths between every pair */
static void floyd_warshall(
    double dist[MAX_PLACES][MAX_PLACES],
    int next[MAX_PLACES][MAX_PLACES]
) {
    for (int i = 0; i < countPlaces; i++) {
        for (int j = 0; j < countPlaces; j++) {
            if (i == j) {
                dist[i][j] = 0;
                next[i][j] = i;
            } else if (graph[i][j] > 0) {
                dist[i][j] = graph[i][j];
                next[i][j] = j;
            } else {
                dist[i][j] = INF;
                next[i][j] = -1;
            }
        }
    }

    for (int k = 0; k < countPlaces; k++) {
        for (int i = 0; i < countPlaces; i++) {
            for (int j = 0; j < countPlaces; j++) {
                if (dist[i][k] < INF / 2 &&
                    dist[k][j] < INF / 2 &&
                    dist[i][k] + dist[k][j] < dist[i][j]) {

                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
}

static void print_route(int src, int dst, const char *algorithm) {
    double distance = INF;
    int path[MAX_PLACES];
    int n = 0;

    if (src < 0 || src >= countPlaces ||
        dst < 0 || dst >= countPlaces) {
        printf("{\"error\":\"Invalid place selection\"}\n");
        return;
    }

    if (strcmp(algorithm, "floyd-warshall") == 0) {
        double dist[MAX_PLACES][MAX_PLACES];
        int next[MAX_PLACES][MAX_PLACES];

        floyd_warshall(dist, next);
        distance = dist[src][dst];

        if (next[src][dst] != -1) {
            int at = src;
            path[n++] = at;

            while (at != dst && n < countPlaces) {
                at = next[at][dst];
                if (at < 0) break;
                path[n++] = at;
            }

            if (at != dst) n = 0;
        }
    } else {
        n = dijkstra(src, dst, &distance, path);
    }

    if (n == 0 || distance >= INF / 2) {
        printf("{\"error\":\"No route exists between these places\"}\n");
        return;
    }

    printf(
        "{\"source\":%d,\"destination\":%d,\"distance\":%.3f,"
        "\"algorithm\":\"%s\",\"route\":[",
        src, dst, distance, algorithm
    );

    for (int i = 0; i < n; i++) {
        if (i) putchar(',');
        printf("%d", path[i]);
    }

    printf(
        "],\"emissions\":["
        "{\"mode\":\"Petrol car\",\"factor\":0.12,\"kg\":%.4f},"
        "{\"mode\":\"Motorcycle\",\"factor\":0.07,\"kg\":%.4f},"
        "{\"mode\":\"Public bus\",\"factor\":0.08,\"kg\":%.4f},"
        "{\"mode\":\"Walking / cycling\",\"factor\":0.00,\"kg\":0}"
        "]}\n",
        distance * 0.12,
        distance * 0.07,
        distance * 0.08
    );
}

int main(int argc, char **argv) {
    const char *csv = argc > 1 ? argv[1] : "data/roads.csv";

    if (!load_csv(csv)) {
        fprintf(stderr, "Could not load CSV: %s\n", csv);
        return 1;
    }

    if (argc < 3) {
        fprintf(stderr,
            "Usage: ecoroute_api <csv-path> graph | "
            "route <source-id> <destination-id> [algorithm]\n");
        return 2;
    }

    if (strcmp(argv[2], "graph") == 0) {
        print_graph();
    } else if (strcmp(argv[2], "route") == 0 && argc >= 5) {
        const char *algorithm =
            argc >= 6 ? argv[5] : "dijkstra";

        if (strcmp(algorithm, "dijkstra") != 0 &&
            strcmp(algorithm, "floyd-warshall") != 0) {
            printf("{\"error\":\"Unknown algorithm\"}\n");
            return 2;
        }

        print_route(atoi(argv[3]), atoi(argv[4]), algorithm);
    } else {
        fprintf(stderr, "Unknown command\n");
        return 2;
    }

    return 0;
}
