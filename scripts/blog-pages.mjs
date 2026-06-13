import path from "node:path";
import { promises as fs } from "node:fs";
import { SITE_ORIGIN, renderMarkdown } from "./legal-pages.mjs";
import { renderSiteFooterHtml } from "../app/src/components/siteFooter.js";

const BASE_BLOG_KEYWORDS = [
  "Provable",
  "cryptographic integrity",
  "time-ordered data",
  "tamper-evident records",
  "evidence systems",
  "verifiable data",
  "Kayros",
  "media integrity",
  "database integrity",
  "trust infrastructure"
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return { attributes: {}, body: markdown };
  }

  const end = markdown.indexOf("\n---\n", 4);
  if (end < 0) {
    return { attributes: {}, body: markdown };
  }

  const rawAttributes = markdown.slice(4, end).split("\n");
  const attributes = {};

  for (const line of rawAttributes) {
    const separator = line.indexOf(":");
    if (separator < 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key) {
      attributes[key] = value;
    }
  }

  return {
    attributes,
    body: markdown.slice(end + 5).trim()
  };
}

function formatBlogDate(dateValue) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function uniqueKeywords(values) {
  const seen = new Set();
  const result = [];

  for (const value of values.flat()) {
    const normalized = String(value || "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function parseKeywordList(rawKeywords = "") {
  return String(rawKeywords)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildPageShell({
  title,
  description,
  canonicalPath,
  bodyClass = "",
  socialImage = "/images/provable.png",
  content,
  keywords = [],
  ogType = "website",
  jsonLd = null,
  extraMeta = ""
}) {
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const keywordList = uniqueKeywords([BASE_BLOG_KEYWORDS, keywords]);
  const keywordContent = keywordList.join(", ");
  const jsonLdMarkup = jsonLd
    ? `\n    <script type="application/ld+json">${escapeJsonForHtml(jsonLd)}</script>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | provable.dev</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywordContent)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(`${SITE_ORIGIN}${socialImage}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(`${SITE_ORIGIN}${socialImage}`)}" />
    ${extraMeta}${jsonLdMarkup}
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
    <link rel="preload" href="/fonts/RobotoCondensed-Regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/RobotoCondensed-Bold.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/RobotoCondensed-Light.woff2" as="font" type="font/woff2" crossorigin />
    <style>
      @font-face {
        font-family: "Roboto Condensed";
        src: url("/fonts/RobotoCondensed-Light.woff2") format("woff2");
        font-weight: 300;
        font-style: normal;
        font-display: block;
      }

      @font-face {
        font-family: "Roboto Condensed";
        src: url("/fonts/RobotoCondensed-Regular.woff2") format("woff2");
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }

      @font-face {
        font-family: "Roboto Condensed";
        src: url("/fonts/RobotoCondensed-Bold.woff2") format("woff2");
        font-weight: 700;
        font-style: normal;
        font-display: block;
      }

      :root {
        color-scheme: light dark;
        --ink: #16202a;
        --text: #24303a;
        --muted: #66727d;
        --line: rgba(20, 27, 33, 0.1);
        --line-strong: rgba(20, 27, 33, 0.16);
        --bg-top: #eef2f5;
        --bg-mid: #e9edf1;
        --bg-bottom: #e3e8ec;
        --panel: rgba(255, 255, 255, 0.9);
        --panel-strong: rgba(255, 255, 255, 0.98);
        --panel-soft: rgba(246, 248, 250, 0.98);
        --warm: #6f7f89;
        --cool: #5d7385;
        --button-bg: #639cce;
        --button-bg-strong: #98958f;
        --button-text: #ffffff;
        --shadow: 0 10px 24px rgba(17, 24, 31, 0.035);
        --shadow-soft: 0 4px 12px rgba(17, 24, 31, 0.028);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --ink: #e6eaec;
          --text: #cdd3d6;
          --muted: #9ea4a8;
          --line: rgba(241, 243, 244, 0.05);
          --line-strong: rgba(241, 243, 244, 0.1);
          --bg-top: #181a1c;
          --bg-mid: #1c1f22;
          --bg-bottom: #212428;
          --panel: #23272b;
          --panel-strong: #202428;
          --panel-soft: #2a2f34;
          --button-bg: #4a6b89;
          --button-bg-strong: #1c1c1d;
          --button-text: #eeeeee;
          --shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
          --shadow-soft: 0 5px 14px rgba(0, 0, 0, 0.12);
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-mid) 52%, var(--bg-bottom) 100%);
        color: var(--text);
        font: 16px/1.72 "Roboto Condensed", "Arial Narrow", "Liberation Sans Narrow", "Nimbus Sans Narrow", sans-serif;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      img {
        display: block;
        max-width: 100%;
      }

      .blog-shell,
      .site-footer {
        width: min(1480px, calc(100vw - 24px));
      }

      .blog-shell {
        margin: 0 auto;
        padding: 20px 0 56px;
      }

      .masthead {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 18px;
        margin-bottom: 18px;
      }

      .topbar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
        flex: 1 1 640px;
        min-height: 56px;
        padding: 8px 16px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel-strong);
        backdrop-filter: blur(8px);
        box-shadow: var(--shadow-soft);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        padding: 2px 0;
        flex: 0 0 auto;
      }

      .brand--logo-only {
        padding: 0;
      }

      .brand--inline {
        margin-right: auto;
        gap: 0;
        padding: 0 8px 0 4px;
      }

      .brand__logo {
        width: 100px;
        height: 100px;
      }

      .brand__name {
        color: var(--ink);
        font-size: 1.8rem;
        font-weight: bolder;
        line-height: 1;
        letter-spacing: 0.01em;
        text-transform: lowercase;
        padding-left: 5px;
      }

      .topnav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
        width: 100%;
      }

      .topnav a {
        color: var(--muted);
        font-size: 0.98rem;
      }

      .topnav a:hover,
      .topnav a[aria-current="page"] {
        color: var(--ink);
      }

      .blog-hero,
      .blog-entry,
      .blog-post {
        margin-top: 20px;
        border: 1px solid var(--line);
        border-radius: 32px;
        background: var(--panel);
        box-shadow: var(--shadow);
      }

      .blog-hero {
        display: grid;
        gap: 14px;
        padding: 24px;
      }

      .blog-hero__eyebrow {
        margin: 0;
        color: var(--warm);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.03em;
      }

      .blog-hero h1,
      .blog-entry h2,
      .blog-post h1,
      .blog-content h2,
      .blog-content h3 {
        margin: 0;
        color: var(--ink);
        line-height: 1.04;
      }

      .blog-hero h1 {
        font-size: 2.35rem;
      }

      .blog-hero p,
      .blog-entry p,
      .blog-post__summary,
      .blog-content p {
        margin: 0;
        color: var(--muted);
      }

      .blog-index {
        display: grid;
        gap: 18px;
        margin-top: 18px;
      }

      .blog-entry {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(220px, 320px);
        gap: 18px;
        padding: 18px;
      }

      .blog-entry--no-image {
        grid-template-columns: minmax(0, 1fr);
      }

      .blog-entry__meta,
      .blog-post__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .blog-entry__meta span,
      .blog-post__meta span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .blog-entry__content {
        display: grid;
        gap: 12px;
        align-content: start;
      }

      .blog-entry__content a {
        color: var(--ink);
      }

      .blog-entry__content a:hover h2 {
        color: var(--cool);
      }

      .blog-entry__image {
        min-height: 200px;
        border: 1px solid var(--line);
        border-radius: 24px;
        overflow: hidden;
        background: color-mix(in srgb, var(--panel-soft) 88%, transparent);
      }

      .blog-entry__image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .blog-post {
        overflow: hidden;
      }

      .blog-post__image {
        aspect-ratio: 3 / 1;
        border-bottom: 1px solid var(--line);
        background: color-mix(in srgb, var(--panel-soft) 88%, transparent);
        overflow: hidden;
      }

      .blog-post__image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        mask-image: linear-gradient(180deg, #000 0%, #000 92%, rgba(0, 0, 0, 0.88) 100%);
      }

      .blog-post__body {
        padding: 24px;
      }

      .blog-post__header {
        display: grid;
        gap: 12px;
        margin-bottom: 22px;
      }

      .blog-post h1 {
        font-size: 2.45rem;
      }

      .blog-post__summary {
        font-size: 1.08rem;
        line-height: 1.6;
      }

      .blog-content {
        display: grid;
        gap: 1rem;
      }

      .blog-content h2 {
        margin-top: 0.8rem;
        font-size: 1.45rem;
      }

      .blog-content h3 {
        margin-top: 0.6rem;
        font-size: 1.16rem;
      }

      .blog-content ul,
      .blog-content ol {
        margin: 0;
        padding-left: 1.25rem;
      }

      .blog-content li {
        margin: 0.3rem 0;
      }

      .blog-content blockquote {
        margin: 0;
        padding: 0 0 0 16px;
        border-left: 3px solid var(--cool);
        color: var(--ink);
      }

      .blog-content code {
        background: color-mix(in srgb, var(--cool) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--cool) 20%, var(--line));
        border-radius: 4px;
        padding: 0.08rem 0.3rem;
        font: inherit;
      }

      .blog-content pre {
        margin: 0;
        padding: 14px;
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: color-mix(in srgb, var(--panel-soft) 94%, transparent);
      }

      .blog-content pre code {
        padding: 0;
        border: 0;
        background: transparent;
      }

      .blog-back {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--cool);
        font-weight: 700;
      }

      .blog-content a {
        color: var(--cool);
        text-decoration: underline;
        text-underline-offset: 0.14em;
      }

      .blog-content a:hover {
        color: var(--ink);
      }

      .site-footer {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.9fr);
        align-items: start;
        gap: 24px;
        margin-top: 20px;
        padding: 0 0 28px;
        color: var(--muted);
      }

      .site-footer__brand {
        display: grid;
        gap: 10px;
      }

      .site-footer__brand-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .site-footer__logo {
        width: 48px;
        height: 48px;
      }

      .site-footer__contact {
        display: grid;
        gap: 8px;
      }

      .site-footer__motto-lines {
        display: grid;
        gap: 6px;
      }

      .site-footer__motto-lines p {
        margin: 0;
        color: var(--ink);
        line-height: 1.35;
      }

      .site-footer__links,
      .site-footer__legal {
        display: grid;
        gap: 10px;
        font-size: 0.96rem;
      }

      .site-footer__title {
        margin: 0;
        color: var(--ink);
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .site-footer__links a,
      .site-footer__legal a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
      }

      .site-footer__links a:hover,
      .site-footer__legal a:hover {
        color: var(--ink);
      }

      .site-footer__icon {
        width: 14px;
        height: 14px;
        fill: currentColor;
        flex: 0 0 auto;
      }

      @media (max-width: 780px) {
        .blog-shell,
        .site-footer {
          width: min(100vw - 16px, 1480px);
        }

        .masthead {
          gap: 12px;
        }

        .topbar {
          width: 100%;
          justify-content: flex-start;
          border-radius: 28px;
        }

        .topnav {
          gap: 14px;
        }

        .blog-hero,
        .blog-post__body {
          padding: 20px;
        }

        .blog-hero h1,
        .blog-post h1 {
          font-size: 1.95rem;
        }

        .blog-entry {
          grid-template-columns: minmax(0, 1fr);
        }

        .blog-entry__image {
          min-height: 180px;
        }

        .site-footer {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body class="${escapeHtml(bodyClass)}">
    ${content}
  </body>
</html>
`;
}

function renderBlogShell({
  pageTitle,
  pageDescription,
  canonicalPath,
  currentPath,
  content,
  socialImage,
  keywords,
  ogType,
  jsonLd,
  extraMeta
}) {
  const shell = `
    <main class="blog-shell">
      <div class="masthead">
        <a href="/" class="brand brand--logo-only" aria-label="Provable">
          <img src="/images/provable.png" alt="Provable" class="brand__logo" />
        </a>
        <header class="topbar">
          <nav class="topnav" aria-label="Primary">
            <a href="/" class="brand brand--inline" aria-label="Provable">
              <span class="brand__name">provable</span>
            </a>
            <a href="/#kayros">Kayros</a>
            <a href="/#workflows">Use Cases</a>
            <a href="/blog/"${currentPath.startsWith("/blog") ? ' aria-current="page"' : ""}>Blog</a>
            <a href="https://dashboard.kayros.provable.dev" target="_blank" rel="noreferrer">Dashboard</a>
          <a href="/proof.html" class="topnav__cta">Verify a proof</a>
          </nav>
        </header>
      </div>
      ${content}
      ${renderSiteFooterHtml()}
    </main>
  `;

  return buildPageShell({
    title: pageTitle,
    description: pageDescription,
    canonicalPath,
    content: shell,
    socialImage,
    keywords,
    ogType,
    jsonLd,
    extraMeta
  });
}

export async function loadBlogPosts(rootDir) {
  const blogDir = path.join(rootDir, "blog");
  let filenames = [];

  try {
    filenames = await fs.readdir(blogDir);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const posts = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith(".md"))
      .map(async (filename) => {
        const sourcePath = path.join(blogDir, filename);
        const markdown = await fs.readFile(sourcePath, "utf8");
        const { attributes, body } = parseFrontmatter(markdown);

        const title = attributes.title || filename.replace(/\.md$/, "");
        const slug = attributes.slug || slugify(filename.replace(/\.md$/, ""));
        const summary = attributes.summary || "";
        const author = attributes.author || "Provable";
        const date = attributes.date || "";
        const image = attributes.image || "";
        const keywords = parseKeywordList(attributes.keywords);

        if (!summary) {
          throw new Error(`Blog post ${filename} is missing a summary in frontmatter.`);
        }
        if (!date) {
          throw new Error(`Blog post ${filename} is missing a date in frontmatter.`);
        }

        return {
          slug,
          title,
          summary,
          author,
          date,
          formattedDate: formatBlogDate(date),
          image,
          keywords,
          contentMarkdown: body,
          contentHtml: renderMarkdown(body),
          sourcePath
        };
      })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function renderBlogIndexHtml(posts) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Provable Blog",
    url: `${SITE_ORIGIN}/blog/`,
    description: "Notes on integrity systems, timestamped evidence, and the products built on top of them.",
    publisher: {
      "@type": "Organization",
      name: "Provable",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/images/provable.png`
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_ORIGIN}/blog/${post.slug}/`,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: post.author
      },
      description: post.summary,
      image: `${SITE_ORIGIN}${post.image || "/images/provable.png"}`,
      keywords: uniqueKeywords([post.keywords, post.slug.replaceAll("-", " "), post.title])
    }))
  };

  const hero = `
    <section class="blog-hero">
      <p class="blog-hero__eyebrow">Provable blog</p>
      <h1>Notes on integrity systems, timestamped evidence, and the products built on top of them.</h1>
      <p>Data integrity, hash chains, public verifiability, user rights, evidence.</p>
    </section>
  `;

  const entries = posts
    .map((post) => {
      const entryClass = post.image ? "blog-entry" : "blog-entry blog-entry--no-image";
      return `
        <article class="${entryClass}">
          <div class="blog-entry__content">
            <div class="blog-entry__meta">
              <span>${escapeHtml(post.author)}</span>
              <span><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.formattedDate)}</time></span>
            </div>
            <a href="/blog/${escapeHtml(post.slug)}/">
              <h2>${escapeHtml(post.title)}</h2>
            </a>
            <p>${escapeHtml(post.summary)}</p>
          </div>
          ${
            post.image
              ? `<a class="blog-entry__image" href="/blog/${escapeHtml(post.slug)}/" aria-label="Open ${escapeHtml(post.title)}"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" /></a>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  return renderBlogShell({
    pageTitle: "Blog",
    pageDescription: posts[0]?.summary || "Provable blog posts.",
    canonicalPath: "/blog/",
    currentPath: "/blog/",
    socialImage: posts[0]?.image || "/images/provable.png",
    keywords: uniqueKeywords([
      "Provable blog",
      "cryptographic integrity blog",
      "verifiable systems",
      posts.map((post) => post.title),
      posts.flatMap((post) => post.keywords)
    ]),
    ogType: "website",
    jsonLd,
    content: `${hero}<section class="blog-index">${entries}</section>`
  });
}

export function renderBlogPostHtml(post) {
  const keywordList = uniqueKeywords([
    post.keywords,
    post.title,
    post.slug.replaceAll("-", " "),
    "Provable blog",
    "cryptographic integrity"
  ]);
  const image = post.image
    ? `<div class="blog-post__image"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" /></div>`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author
    },
    publisher: {
      "@type": "Organization",
      name: "Provable",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/images/provable.png`
    },
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${post.slug}/`,
    image: `${SITE_ORIGIN}${post.image || "/images/provable.png"}`,
    keywords: keywordList,
    articleSection: "Blog"
  };

  const extraMeta = `
    <meta property="article:published_time" content="${escapeHtml(post.date)}" />
    <meta property="article:author" content="${escapeHtml(post.author)}" />
    <meta property="article:section" content="Blog" />
  `;

  return renderBlogShell({
    pageTitle: post.title,
    pageDescription: post.summary,
    canonicalPath: `/blog/${post.slug}/`,
    currentPath: `/blog/${post.slug}/`,
    socialImage: post.image || "/images/provable.png",
    keywords: keywordList,
    ogType: "article",
    jsonLd,
    extraMeta,
    content: `
      <article class="blog-post">
        ${image}
        <div class="blog-post__body">
          <a href="/blog/" class="blog-back">← Back to blog</a>
          <header class="blog-post__header">
            <div class="blog-post__meta">
              <span>${escapeHtml(post.author)}</span>
              <span><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.formattedDate)}</time></span>
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            <p class="blog-post__summary">${escapeHtml(post.summary)}</p>
          </header>
          <div class="blog-content">
            ${post.contentHtml}
          </div>
        </div>
      </article>
    `
  });
}

export function renderPathRedirectHtml(targetPath, siteOrigin = SITE_ORIGIN) {
  const canonicalUrl = `${siteOrigin}${targetPath}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(targetPath)}">${escapeHtml(targetPath)}</a>...</p>
  </body>
</html>
`;
}

export function resolveBlogRoute(pathname) {
  if (pathname === "/blog") {
    return { type: "redirect", targetPath: "/blog/" };
  }

  if (pathname === "/blog/" || pathname === "/blog/index.html") {
    return { type: "index" };
  }

  const postMatch = /^\/blog\/([a-z0-9-]+)(?:\/|\.html)?$/i.exec(pathname);
  if (!postMatch) {
    return null;
  }

  const slug = postMatch[1];

  if (pathname === `/blog/${slug}`) {
    return { type: "redirect", targetPath: `/blog/${slug}/` };
  }

  return { type: "post", slug };
}
