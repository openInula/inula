import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

let alias = {
  react: "openinula",
  "react-dom": "openinula",
  "react/jsx-dev-runtime": "openinula/jsx-dev-runtime",
  "react/jsx-runtime": "openinula/jsx-runtime",
  "@openinula/next": "openinula",
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // 禁用 sourcemap 以避免混淆问题
    minify: false,

    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        manualChunks: undefined,
        globals: {
          openinula: "Inula",
          "inula-router": "InulaRouter",
        },
      },
    },

    target: "es2015",
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
    lib: false,
    ssr: false,
  },

  server: {
    port: 5173,
    open: true,
  },

  optimizeDeps: {
    include: ["openinula", "inula-router", "@babytian/openinula-repl-next"],
    force: true,
  },

  esbuild: {
    keepNames: true,
    legalComments: "none",
  },
});
