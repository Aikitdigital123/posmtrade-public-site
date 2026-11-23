// Pages are generated into pages/ by build/render.mjs (texts live in src/content/).
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const inputs = JSON.parse(readFileSync(new URL("./pages/inputs.json", import.meta.url)));

export default defineConfig({
  root: "pages",
  base: "/posmtrade-public-site/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: { input: inputs },
  },
  server: { fs: { allow: [".."] } },
});
