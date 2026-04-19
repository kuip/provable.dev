import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SITE_ORIGIN,
  resolveLegalRoute,
  renderMarkdown,
  renderLegalHtml
} from "./scripts/legal-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function legalRoutesDevPlugin() {
  return {
    name: "legal-routes-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const pathname = (req.url || "/").split("?")[0];
          const match = resolveLegalRoute(pathname);

          if (!match) {
            next();
            return;
          }

          if (match.type === "redirect") {
            res.statusCode = 302;
            res.setHeader("Location", `/${match.page.slug}/`);
            res.end();
            return;
          }

          if (pathname === `/${match.page.slug}`) {
            res.statusCode = 302;
            res.setHeader("Location", `/${match.page.slug}/`);
            res.end();
            return;
          }

          const markdownPath = path.resolve(__dirname, match.page.source);
          const markdown = await fs.readFile(markdownPath, "utf8");
          const contentHtml = renderMarkdown(markdown);
          const html = renderLegalHtml({
            ...match.page,
            contentHtml,
            siteOrigin: SITE_ORIGIN
          });

          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), legalRoutesDevPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        proof: path.resolve(__dirname, "proof.html")
      }
    }
  }
});
