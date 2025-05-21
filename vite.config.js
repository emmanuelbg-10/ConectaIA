import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        cors: true, // <- habilita CORS
        headers: {
            "Access-Control-Allow-Origin": "*", // <- permite cualquier origen
        },
        hmr: {
            host: "192.168.0.20",
            protocol: "http",
            port: 5173,
        },
    },
});
