import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/bookmark-organizer/",
  build: { sourcemap: false },
  plugins: [react()],
});

