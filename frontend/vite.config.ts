import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://openapi.forest.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/openapi"),
      },
    },
  },
});
