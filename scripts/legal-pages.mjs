import { marked } from "marked";

export const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://provable.dev";

export const LEGAL_PAGES = [
  {
    slug: "privacy",
    source: "public/PrivacyPolicy.md",
    title: "Privacy Policy",
    description: "Privacy policy for provable.dev."
  },
  {
    slug: "terms",
    source: "public/Terms.md",
    title: "Terms of Use",
    description: "Terms of use for provable.dev."
  }
];

marked.setOptions({
  gfm: true,
  breaks: false
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderMarkdown(markdown) {
  return marked.parse(markdown);
}

export function renderLegalHtml({
  title,
  description,
  slug,
  contentHtml,
  siteOrigin = SITE_ORIGIN
}) {
  const canonicalPath = `/${slug}/`;
  const canonicalUrl = `${siteOrigin}${canonicalPath}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | provable.dev</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <style>
      :root {
        --bg: #f5f7fb;
        --card: #ffffff;
        --text: #16202a;
        --muted: #5d6b79;
        --line: #d7e0ea;
        --link: #0a5ca8;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: radial-gradient(circle at top left, #edf2fb 0%, #f8fafd 40%, var(--bg) 100%);
        color: var(--text);
        font: 16px/1.75 "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      main {
        max-width: 860px;
        margin: 40px auto;
        padding: 34px 38px;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 14px;
      }

      h1,
      h2,
      h3 {
        line-height: 1.3;
      }

      h1 {
        font-size: 2rem;
        margin: 0 0 0.8rem;
      }

      h2 {
        margin-top: 2rem;
        font-size: 1.3rem;
      }

      h3 {
        margin-top: 1.2rem;
        font-size: 1.05rem;
      }

      p {
        margin: 0.55rem 0;
      }

      ul {
        margin: 0.6rem 0 0.8rem;
        padding-left: 1.25rem;
      }

      li {
        margin: 0.25rem 0;
      }

      code {
        background: #eef4fb;
        border: 1px solid #d5e2ef;
        border-radius: 4px;
        padding: 0.1rem 0.3rem;
        font-size: 0.9em;
      }

      a {
        color: var(--link);
      }

      @media (max-width: 760px) {
        main {
          margin: 18px;
          padding: 24px 20px;
        }

        h1 {
          font-size: 1.65rem;
        }
      }
    </style>
  </head>
  <body>
    <main>
      ${contentHtml}
    </main>
  </body>
</html>
`;
}

export function renderRedirectHtml(slug, siteOrigin = SITE_ORIGIN) {
  const targetPath = `/${slug}/`;
  const canonicalUrl = `${siteOrigin}${targetPath}`;
  const pageLabel = slug.replaceAll("_", " ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to ${escapeHtml(pageLabel)}</title>
    <meta name="robots" content="noindex,follow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}" />
    <script>
      window.location.replace(${JSON.stringify(targetPath)});
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(targetPath)}">${escapeHtml(targetPath)}</a>...</p>
  </body>
</html>
`;
}

export function resolveLegalRoute(pathname) {
  for (const page of LEGAL_PAGES) {
    if (pathname === `/${page.slug}` || pathname === `/${page.slug}/`) {
      return { page, type: "page" };
    }

    if (pathname === `/${page.slug}.html`) {
      return { page, type: "redirect" };
    }
  }

  return null;
}
