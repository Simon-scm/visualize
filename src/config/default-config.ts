import type { VisualizeConfig } from "./schema.js";

export const defaultConfig: VisualizeConfig = {
  baseUrl: "http://localhost:5173",
  routes: [
    { name: "home", path: "/" },
    { name: "login", path: "/login" }
  ],
  viewports: [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1440, height: 900 }
  ],
  outputDir: ".visualize",
  watch: {
    include: ["src/**/*.{html,css,scss,js,jsx,ts,tsx}", "public/**/*"],
    exclude: ["node_modules/**", ".visualize/**"]
  },
  stabilize: {
    waitUntil: "networkidle",
    disableAnimations: true,
    waitMs: 300,
    timeoutMs: 30000
  }
};
