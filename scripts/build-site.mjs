import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEGAL_PAGES,
  SITE_ORIGIN,
  renderMarkdown,
  renderLegalHtml,
  renderRedirectHtml
} from "./legal-pages.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const STATIC_FILES = [
  "LICENSE",
  "_config.yml",
  "proof.html",
  "robots.txt",
  "site.webmanifest",
  "sitemap.xml",
  "styles.css"
];

const STATIC_DIRS = ["public", "medals"];

async function exists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(relativePath) {
  if (!(await exists(relativePath))) {
    return;
  }

  const from = path.join(ROOT, relativePath);
  const to = path.join(DIST, relativePath);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.cp(from, to, { recursive: true });
}

async function copyPublicDir() {
  const from = path.join(ROOT, "public");
  if (!(await exists("public"))) {
    return;
  }

  await fs.cp(from, DIST, { recursive: true });
}

async function removeIfExists(relativePath) {
  const target = path.join(ROOT, relativePath);
  try {
    await fs.rm(target, { force: true });
  } catch {
    // Ignore missing files in generated output.
  }
}

async function buildSite() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  await copyPublicDir();

  for (const file of STATIC_FILES) {
    await copyIfExists(file);
  }

  for (const dir of STATIC_DIRS) {
    if (dir === "public") {
      continue;
    }
    await copyIfExists(dir);
  }

  for (const page of LEGAL_PAGES) {
    const markdownPath = path.join(ROOT, page.source);
    const markdown = await fs.readFile(markdownPath, "utf8");
    const contentHtml = renderMarkdown(markdown);
    const pageHtml = renderLegalHtml({ ...page, contentHtml, siteOrigin: SITE_ORIGIN });
    const pageDir = path.join(DIST, page.slug);

    await fs.mkdir(pageDir, { recursive: true });
    await fs.writeFile(path.join(pageDir, "index.html"), pageHtml, "utf8");
    await fs.writeFile(
      path.join(DIST, `${page.slug}.html`),
      renderRedirectHtml(page.slug, SITE_ORIGIN),
      "utf8"
    );
  }

  await removeIfExists("dist/.DS_Store");
  await fs.writeFile(path.join(DIST, ".nojekyll"), "", "utf8");
}

buildSite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
