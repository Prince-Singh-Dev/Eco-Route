
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const CSV = path.join(ROOT, "data", "roads.csv");

const isWindows = process.platform === "win32";

const binary = path.join(
  ROOT,
  isWindows ? "ecoroute_api.exe" : "ecoroute_api"
);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

// Compile the C backend.
function buildBackend() {
  execFileSync(
    "gcc",
    [
      "-Wall",
      "-Wextra",
      "-std=c11",
      path.join(ROOT, "ecoroute_api.c"),
      "-o",
      binary,
      "-lm"
    ],
    {
      cwd: ROOT,
      stdio: "inherit"
    }
  );
}

// Execute the C backend and parse its JSON output.
function runC(...args) {
  const output = execFileSync(
    binary,
    [CSV, ...args.map(String)],
    {
      cwd: ROOT,
      encoding: "utf8"
    }
  );

  return JSON.parse(output);
}

// Send an HTTP response.
function send(
  res,
  status,
  body,
  type = "application/json; charset=utf-8"
) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  res.end(body);
}

// Create the HTTP server.
const server = http.createServer((req, res) => {
  let url;

  try {
    url = new URL(
      req.url,
      `http://${req.headers.host || "localhost"}`
    );
  } catch {
    return send(
      res,
      400,
      JSON.stringify({ error: "Invalid request URL." })
    );
  }

  // Allow only GET and HEAD requests.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");

    return send(
      res,
      405,
      "Method not allowed",
      "text/plain; charset=utf-8"
    );
  }

  try {
    // GET /api/graph
    if (url.pathname === "/api/graph") {
      const graph = runC("graph");

      return send(res, 200, JSON.stringify(graph));
    }

    // GET /api/route?source=0&destination=1&algorithm=dijkstra
    // GET /api/route?source=0&destination=1&algorithm=floyd-warshall
    if (url.pathname === "/api/route") {
      const sourceText = url.searchParams.get("source");
      const destinationText = url.searchParams.get("destination");

      // Default algorithm is Dijkstra.
      const algorithm =
        url.searchParams.get("algorithm") || "dijkstra";

      // Validate source and destination.
      if (
        sourceText === null ||
        destinationText === null ||
        !/^\d+$/.test(sourceText) ||
        !/^\d+$/.test(destinationText)
      ) {
        return send(
          res,
          400,
          JSON.stringify({
            error: "Choose a valid starting point and destination."
          })
        );
      }

      // Validate the selected algorithm.
      if (
        algorithm !== "dijkstra" &&
        algorithm !== "floyd-warshall"
      ) {
        return send(
          res,
          400,
          JSON.stringify({
            error: "Invalid algorithm. Choose dijkstra or floyd-warshall."
          })
        );
      }

      // Pass the selected algorithm to the C program.
      const result = runC(
        "route",
        sourceText,
        destinationText,
        algorithm
      );

      if (result.error) {
        return send(res, 400, JSON.stringify(result));
      }

      return send(res, 200, JSON.stringify(result));
    }

    // Serve frontend files.
    let requested =
      url.pathname === "/"
        ? "index.html"
        : url.pathname.slice(1);

    try {
      requested = decodeURIComponent(requested);
    } catch {
      return send(
        res,
        400,
        "Invalid path",
        "text/plain; charset=utf-8"
      );
    }

    const file = path.resolve(PUBLIC, requested);

    // Prevent access to files outside the public directory.
    if (
      file !== PUBLIC &&
      !file.startsWith(PUBLIC + path.sep)
    ) {
      return send(
        res,
        403,
        "Forbidden",
        "text/plain; charset=utf-8"
      );
    }

    fs.readFile(file, (error, data) => {
      if (error) {
        return send(
          res,
          404,
          "File not found",
          "text/plain; charset=utf-8"
        );
      }

      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(file).toLowerCase()] ||
          "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });

      if (req.method === "HEAD") {
        return res.end();
      }

      res.end(data);
    });
  } catch (error) {
    console.error("Request failed:", error.message);

    send(
      res,
      500,
      JSON.stringify({
        error: "The C backend could not complete the request.",
        detail: error.message
      })
    );
  }
});

// Check files and compile the backend before starting.
try {
  if (!fs.existsSync(CSV)) {
    throw new Error(`CSV file not found: ${CSV}`);
  }

  if (!fs.existsSync(path.join(ROOT, "ecoroute_api.c"))) {
    throw new Error("C source file not found: ecoroute_api.c");
  }

  buildBackend();

  console.log("C backend compiled successfully.");
} catch (error) {
  console.error("Could not build the C backend:", error.message);
  process.exit(1);
}

// Start the server.
const PORT = Number(process.env.PORT || 3000);

server.listen(PORT, () => {
  console.log(`EcoRoute is running at http://localhost:${PORT}`);
  console.log("Algorithms available: Dijkstra, Floyd-Warshall");
});

// Graceful shutdown.
process.on("SIGINT", () => {
  console.log("\nShutting down EcoRoute...");

  server.close(() => {
    process.exit(0);
  });
});
