import { defineConfig } from "tsup";

export default defineConfig([
  // Standard builds for package consumers
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    minify: false,
  },
  // Browser build for direct HTML usage
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "PlaywrightActuator",
    outDir: "dist",
    outExtension() {
      return {
        js: ".browser.js",
      };
    },
    sourcemap: true,
    minify: false,
    platform: "browser",
    target: "es2018",
    clean: false, // Don't clean since we're sharing the dist folder
  },
]);