import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  cacheDir: ".vite",
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
});
