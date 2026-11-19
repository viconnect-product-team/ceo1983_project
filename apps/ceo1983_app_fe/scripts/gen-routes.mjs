#!/usr/bin/env node
// Regenerates src/routeTree.gen.ts from the files in src/routes.
// Runs automatically before dev/build (see predev/prebuild npm scripts) so the
// route tree never goes stale after a route is added, renamed, or deleted.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Generator, getConfig } from "@tanstack/router-generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const generatedFile = path.resolve(root, "./src/routeTree.gen.ts");
const config = getConfig(
  {
    routesDirectory: path.resolve(root, "./src/routes"),
    generatedRouteTree: generatedFile,
  },
  root,
);

const generator = new Generator({ config, root });

try {
  await generator.run();
  if (generator.crawlingResult) {
    const res = generator.buildRouteTree(generator.crawlingResult);
    if (res?.routeTreeContent) {
      await fs.writeFile(generatedFile, res.routeTreeContent, "utf-8");
      console.log("[gen-routes] routeTree.gen.ts successfully written to disk with all routes.");
    }
  }
} catch (err) {
  console.error("[gen-routes] Failed to generate route tree:", err);
  process.exit(1);
}
