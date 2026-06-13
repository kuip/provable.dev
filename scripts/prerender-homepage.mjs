import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kayrosSlides, sdkHighlights, workflows } from "../app/src/siteData.js";
import { renderSiteFooterHtml } from "../app/src/components/siteFooter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderVideoEmbed(videoId, title) {
  return `
    <button type="button" class="video-preview" aria-label="Play ${escapeHtml(title)}">
      <img src="https://i.ytimg.com/vi/${escapeHtml(videoId)}/hqdefault.jpg" alt="" loading="lazy" />
      <span class="video-preview__play" aria-hidden="true">▶</span>
    </button>
  `;
}

function renderPlaceholder(label, logo) {
  return `
    <div class="card-placeholder">
      ${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(label)}" class="card-placeholder__logo" />` : ""}
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderImageMedia(imageUrl, title) {
  return `
    <div class="media-image-frame">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy" />
    </div>
  `;
}

function renderProductCard(product) {
  const media = product.videoId
    ? renderVideoEmbed(product.videoId, product.name)
    : product.imageUrl
      ? renderImageMedia(product.imageUrl, product.name)
      : renderPlaceholder(product.name, product.logo);

  return `
    <article class="product-card">
    <div class="product-card__media">${media}</div>
    <div class="product-card__head">
      ${product.logo ? `<img src="${escapeHtml(product.logo)}" alt="${escapeHtml(product.name)}" class="product-card__logo" />` : ""}
      <h3>${escapeHtml(product.name)}</h3>
      ${product.href ? `<a href="${escapeHtml(product.href)}" target="_blank" rel="noreferrer" class="product-card__link-icon" aria-label="Open ${escapeHtml(product.name)} in a new tab" title="Open ${escapeHtml(product.name)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z"></path>
        </svg>
      </a>` : ""}
    </div>
    <p>${escapeHtml(product.description)}</p>
    </article>
  `;
}

function renderSlideCard(slide) {
  const media = slide.videoId
    ? renderVideoEmbed(slide.videoId, slide.title)
    : slide.imageUrl
      ? renderImageMedia(slide.imageUrl, slide.title)
      : renderPlaceholder(slide.kicker, "/images/kayros.png");

  return `<article class="slide-card${slide.videoId ? " slide-card--video" : ""}">
    <div class="slide-card__media">
      ${media}
    </div>
    <h2>${escapeHtml(slide.title)}</h2>
    <p>${escapeHtml(slide.body)}</p>
  </article>`;
}

function renderSdkCard(sdk) {
  return `
    <a href="${escapeHtml(sdk.href)}" target="_blank" rel="noreferrer" class="sdk-link-button">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="sdk-link-button__icon">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.19-.02-2.16-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.19 1.18a10.99 10.99 0 0 1 5.8 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.77 1.07.77 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"></path>
      </svg>
      ${escapeHtml(sdk.name)}
    </a>
  `;
}

function renderHtml() {
  const visibleKayros = kayrosSlides.slice(0, Math.min(2, kayrosSlides.length));
  const workflow = workflows[0];
  const visibleProducts = workflow.products.slice(0, Math.min(2, workflow.products.length));

  return `
    <main class="site-shell">
      <div class="masthead">
        <a href="/" class="brand brand--logo-only" aria-label="Provable">
          <img src="/images/provable.png" alt="Provable" class="brand__logo" />
        </a>
        <header class="topbar">
          <nav class="topnav" aria-label="Primary">
            <a href="/" class="brand brand--inline" aria-label="Provable">
              <span class="brand__name">provable</span>
            </a>
            <a href="#sdks">SDKs</a>
            <a href="#kayros">Kayros</a>
            <a href="#workflows">Use Cases</a>
            <a href="/blog/">Blog</a>
            <a href="https://dashboard.kayros.provable.dev" target="_blank" rel="noreferrer">Dashboard</a>
            <a href="/proof.html" class="topnav__cta">Verify a proof</a>
          </nav>
        </header>
      </div>

      <section id="sdks" class="sdk-showcase">
        <div class="sdk-showcase__grid">
          ${sdkHighlights.map((sdk) => renderSdkCard(sdk)).join("")}
        </div>
      </section>

      <section id="kayros" class="panel hero">
        <div class="hero__copy">
          <div class="hero__title-row">
            <img src="/images/kayros.png" alt="Kayros" class="hero__logo" />
            <h1>Kayros</h1>
          </div>
          <p class="hero__lead">High-throughput cryptographic integrity for data systems that need more than conventional logging, slower consensus, or fragile audit trails.</p>
          <div class="metric-pills">
            <span>&gt; 1 million TPS on one single level</span>
            <span>Multi-level expansion</span>
            <span>Ordered by time</span>
            <span>Content-agnostic</span>
          </div>
        </div>

        <div class="slider">
          <div class="slider__controls" aria-label="Kayros slide controls">
            <span class="slider__count">1-${visibleKayros.length} / ${kayrosSlides.length}</span>
            <div class="slider__buttons">
              <button type="button" class="slider__button" aria-label="Previous Kayros slide">‹</button>
              <button type="button" class="slider__button" aria-label="Next Kayros slide">›</button>
            </div>
          </div>
          <div class="slider__viewport slider__viewport--pair">
            ${visibleKayros
              .map((slide) =>
                `<div class="slider__item">${renderSlideCard(slide)}</div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section id="workflows" class="panel workflows">
        <div class="workflow-tabs" role="tablist" aria-label="Use cases">
          ${workflows
            .map(
              (item, index) => `
                <button type="button" class="workflow-tab${index === 0 ? " is-active" : ""}" role="tab" aria-selected="${index === 0 ? "true" : "false"}">
                  ${escapeHtml(item.label)}
                </button>
              `
            )
            .join("")}
        </div>

        <div class="workflow-panel">
          <div class="workflow-panel__copy">
            <h2>${escapeHtml(workflow.title)}</h2>
            <p>${escapeHtml(workflow.description)}</p>
            <ul class="workflow-panel__list">
              ${workflow.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
            </ul>
          </div>
          <div class="slider">
            <div class="slider__controls" aria-label="${escapeHtml(workflow.label)} product controls">
              <span class="slider__count">1-${visibleProducts.length} / ${workflow.products.length}</span>
              <div class="slider__buttons">
                <button type="button" class="slider__button" aria-label="Previous ${escapeHtml(workflow.label)} product">‹</button>
                <button type="button" class="slider__button" aria-label="Next ${escapeHtml(workflow.label)} product">›</button>
              </div>
            </div>
            <div class="slider__viewport slider__viewport--pair">
              ${visibleProducts
                .map((product) => `<div class="slider__item">${renderProductCard(product)}</div>`)
                .join("")}
            </div>
          </div>
        </div>
      </section>

    </main>
    ${renderSiteFooterHtml()}
  `;
}

async function prerender() {
  const indexPath = path.join(DIST, "index.html");
  const html = await fs.readFile(indexPath, "utf8");
  const rendered = html.replace('<div id="root"></div>', `<div id="root">${renderHtml()}</div>`);
  await fs.writeFile(indexPath, rendered, "utf8");
}

prerender().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
