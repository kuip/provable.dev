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
        --bg: #f2f5f7;
        --card: rgba(255, 255, 255, 0.92);
        --text: #141b21;
        --muted: #697581;
        --line: rgba(20, 27, 33, 0.1);
        --link: #0b667f;
        --shadow: 0 24px 64px rgba(17, 24, 31, 0.08);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #141b20;
          --card: rgba(19, 27, 33, 0.94);
          --text: #ecf2f6;
          --muted: #97a6b1;
          --line: rgba(236, 242, 246, 0.1);
          --link: #67b6cd;
          --shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(124, 138, 149, 0.14), transparent 28%),
          radial-gradient(circle at top right, rgba(11, 102, 127, 0.15), transparent 30%),
          linear-gradient(180deg, #f2f5f7 0%, #edf2f5 52%, #e6ecef 100%);
        color: var(--text);
        font: 16px/1.75 "Roboto Condensed", "Arial Narrow", "Liberation Sans Narrow", "Nimbus Sans Narrow", sans-serif;
      }

      main {
        max-width: 860px;
        margin: 40px auto;
        padding: 34px 38px;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 14px;
        box-shadow: var(--shadow);
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
        background: color-mix(in srgb, var(--link) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--link) 18%, var(--line));
        border-radius: 4px;
        padding: 0.1rem 0.3rem;
        font-size: 0.9em;
      }

      a {
        color: var(--link);
      }

      footer {
        max-width: 860px;
        margin: 0 auto 40px;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        color: var(--muted);
      }

      .contact {
        display: grid;
        gap: 8px;
      }

      .contact-title {
        margin: 0;
        color: var(--text);
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .contact-links,
      .copyright {
        display: flex;
        flex-wrap: wrap;
        gap: 14px 18px;
      }

      .contact-links a,
      .copyright a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        text-decoration: none;
      }

      .contact-links a:hover,
      .copyright a:hover {
        color: var(--text);
      }

      .icon {
        width: 14px;
        height: 14px;
        fill: currentColor;
        flex: 0 0 auto;
      }

      @media (max-width: 760px) {
        main {
          margin: 18px;
          padding: 24px 20px;
        }

        h1 {
          font-size: 1.65rem;
        }

        footer {
          margin: 0 18px 24px;
          padding: 0;
          flex-direction: column;
          align-items: flex-start;
        }
      }
    </style>
  </head>
  <body>
    <main>
      ${contentHtml}
    </main>
    <footer>
      <div class="contact">
        <p class="contact-title">Contact</p>
        <div class="contact-links">
          <a href="https://x.com/is_provable" target="_blank" rel="noreferrer" aria-label="Provable on X">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="icon">
              <path d="M18.901 1.153h3.68l-8.039 9.188 9.457 12.506H16.594L10.79 15.26l-6.64 7.587H.47l8.598-9.826L0 1.153h7.595l5.247 6.942 6.059-6.942Zm-1.291 19.49h2.039L6.487 3.24H4.3L17.61 20.643Z"></path>
            </svg>
            <span>@is_provable</span>
          </a>
          <a href="mailto:contact@mail.provable.dev">contact@mail.provable.dev</a>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
        </div>
      </div>
      <div class="copyright">
        <a href="https://www.kuip.co.uk" target="_blank" rel="noreferrer">&copy; 2025-present Kuip Limited</a>
      </div>
    </footer>
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
