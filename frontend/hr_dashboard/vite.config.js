import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  // ASSET BASE: Where js/css files are served from
  base: "/assets/nacoc/",

  define: {
    // ROUTER BASE: The URL where the user accesses the app
    __ROUTER_BASE__: JSON.stringify("/executive-dashboard"),
  },

  build: {
    // Output to the Frappe app's public folder
    // We assume this repo is in apps/nacoc/frontend/hr_dashboard
    // So ../../../nacoc/public takes us to apps/nacoc/nacoc/public
    outDir: path.resolve(__dirname, "../../nacoc/public"),
    emptyOutDir: false, // IMPORTANT: Do not delete existing files in public

    rollupOptions: {
      output: {
        entryFileNames: "js/[name].js",
        chunkFileNames: "js/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "css/[name][extname]";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },

  plugins: [
    {
      name: "move-index-html",
      closeBundle() {
        // Source: where Vite wrote index.html (in outDir)
        const src = path.resolve(__dirname, "../../nacoc/public/index.html");

        // Destination: apps/nacoc/nacoc/www/executive-dashboard/index.html
        const destDir = path.resolve(
          __dirname,
          "../../nacoc/www/executive-dashboard"
        );
        const dest = path.join(destDir, "index.html");

        if (fs.existsSync(src)) {
          console.log(`Moving index.html from ${src} to ${dest}...`);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          // Rename (move) the file
          fs.renameSync(src, dest);
          console.log("Done.");
        } else {
          console.warn(`Warning: Could not find ${src} to move.`);
        }
      },
    },
  ],
});
