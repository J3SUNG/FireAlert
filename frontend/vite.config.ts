import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        dead_code: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet"]
        }
      }
    },
    cssMinify: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      strict: false,
      allow: [".."], // 상위 디렉토리에도 접근 허용
    },
    proxy: {
      "/api": {
        target: "http://openapi.forest.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/openapi"),
      },
    },
  },
});
