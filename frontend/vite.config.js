import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    allowedHosts: ["jobloria.click", ".jobloria.click", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5007",
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            // Bỏ qua lỗi ngắt kết nối socket tự nhiên khi client F5/reload trang hoặc đổi tab
            if (["ECONNABORTED", "ECONNRESET", "EPIPE"].includes(err?.code)) {
              return;
            }
            console.error("[Vite WS Proxy Error]:", err.message);
          });
        },
      },
    },
  },
});
