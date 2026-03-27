/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";

export const enableMocking = async () => {
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK !== "true") {
        return;
    }
    // ...
};

// https://vite.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react(), viteTsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            msw: path.resolve(__dirname, "./node_modules/msw/lib/core/index.js"),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
                secure: false,
                rewrite: (p) => p.replace(/^\/api/, ""),
            },
        },
        port: 3000,
        allowedHosts: [
            "test.1855789-cn23133.twc1.net",
            "fpin-projects.ru",
            "localhost",
            "localhost:8000",
            "127.0.0.1",
            "fpin-projects.ru:1268",
        ],
    },
    preview: {
        port: 3000,
    },
    optimizeDeps: { exclude: ["fsevents"] },
    build: {
        rollupOptions: {
            external: ["fs/promises"],
            output: {
                experimentalMinChunkSize: 3500,
            },
        },
    },
});
