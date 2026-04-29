import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kayrosSlides, workflows } from "../app/src/siteData.js";
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
            <a href="#kayros">Kayros</a>
            <a href="#workflows">Use Cases</a>
            <a href="/blog/">Blog</a>
            <a href="/proof.html" class="topnav__cta">Verify a proof</a>
          </nav>
        </header>
      </div>

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
