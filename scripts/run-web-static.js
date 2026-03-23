const { spawn } = require("node:child_process");
const { createServer } = require("node:http");
const { createReadStream, existsSync, mkdirSync, statSync } = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const expoHome = path.join(projectRoot, ".expo-home");
const distDir = path.join(projectRoot, "dist");
const port = Number(process.env.PORT || 19006);

mkdirSync(expoHome, { recursive: true });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function exportWebBuild() {
  return new Promise((resolve, reject) => {
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/s", "/c", "npx expo export --platform web"], {
            cwd: projectRoot,
            stdio: "inherit",
            env: {
              ...process.env,
              CI: "1",
              EXPO_NO_TELEMETRY: "1",
              __UNSAFE_EXPO_HOME_DIRECTORY: expoHome,
            },
          })
        : spawn("npx", ["expo", "export", "--platform", "web"], {
            cwd: projectRoot,
            stdio: "inherit",
            env: {
              ...process.env,
              CI: "1",
              EXPO_NO_TELEMETRY: "1",
              __UNSAFE_EXPO_HOME_DIRECTORY: expoHome,
            },
          });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`expo export exited with code ${code}`));
    });

    child.on("error", reject);
  });
}

function safeFilePath(urlPath) {
  const normalizedPath = decodeURIComponent(urlPath.split("?")[0]);
  const trimmed = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const absolutePath = path.join(distDir, trimmed);
  if (!absolutePath.startsWith(distDir)) {
    return path.join(distDir, "index.html");
  }

  if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
    return absolutePath;
  }

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    const nestedIndex = path.join(absolutePath, "index.html");
    if (existsSync(nestedIndex)) {
      return nestedIndex;
    }
  }

  return path.join(distDir, "index.html");
}

function contentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function startServer() {
  const server = createServer((request, response) => {
    const filePath = safeFilePath(request.url || "/");

    response.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": "no-store",
    });

    createReadStream(filePath).pipe(response);
  });

  server.listen(port, () => {
    console.log("");
    console.log(`Dark Diary web build is available at http://localhost:${port}`);
    console.log("Press Ctrl+C to stop the server.");
  });

  function shutdown() {
    server.close(() => process.exit(0));
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  console.log("Exporting the Expo web build...");
  await exportWebBuild();
  console.log("Static export complete.");
  startServer();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
