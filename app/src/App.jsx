import { useEffect, useMemo, useState } from "react";
import { kayrosSlides, sdkHighlights, workflows } from "./siteData";
import { SiteFooter } from "./components/siteFooter";

function hashToWorkflowId(hash) {
  const match = /^#workflows-([a-z0-9-]+)$/i.exec(hash || "");
  return match ? match[1] : null;
}

function workflowHref(id) {
  return `#workflows-${id}`;
}

function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const onChange = () => setMatches(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}

function VideoEmbed({ videoId, title }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="video-preview"
      onClick={() => setLoaded(true)}
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
      />
      <span className="video-preview__play" aria-hidden="true">
        ▶
      </span>
    </button>
  );
}

function MediaPlaceholder({ label, logo }) {
  return (
    <div className="card-placeholder">
      {logo ? <img src={logo} alt={label} className="card-placeholder__logo" /> : null}
      <span>{label}</span>
    </div>
  );
}

function ImageMedia({ imageUrl, title }) {
  return (
    <div className="media-image-frame">
      <img src={imageUrl} alt={title} loading="lazy" />
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.videoId ? (
          <VideoEmbed videoId={product.videoId} title={product.name} />
        ) : product.imageUrl ? (
          <ImageMedia imageUrl={product.imageUrl} title={product.name} />
        ) : (
          <MediaPlaceholder label={product.name} logo={product.logo} />
        )}
      </div>
      <div className="product-card__head">
        {product.logo ? (
          <img src={product.logo} alt={product.name} className="product-card__logo" />
        ) : null}
        <h3>{product.name}</h3>
        {product.href ? (
          <a
            href={product.href}
            target="_blank"
            rel="noreferrer"
            className="product-card__link-icon"
            aria-label={`Open ${product.name} in a new tab`}
            title={`Open ${product.name}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z" />
            </svg>
          </a>
        ) : null}
      </div>
      <p>{product.description}</p>
    </article>
  );
}

function SdkCard({ sdk }) {
  return (
    <a href={sdk.href} target="_blank" rel="noreferrer" className="sdk-link-button">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="sdk-link-button__icon">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.19-.02-2.16-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.19 1.18a10.99 10.99 0 0 1 5.8 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.77 1.07.77 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
      {sdk.name}
    </a>
  );
}

function Carousel({ items, index, onPrev, onNext, renderItem, label, countLabel }) {
  const safeCountLabel = countLabel || `${index + 1} / ${items.length}`;

  return (
    <div className="slider">
      <div className="slider__controls" aria-label={`${label} controls`}>
        <span className="slider__count">{safeCountLabel}</span>
        <div className="slider__buttons">
          <button type="button" className="slider__button" onClick={onPrev} aria-label={`Previous ${label}`}>
            ‹
          </button>
          <button type="button" className="slider__button" onClick={onNext} aria-label={`Next ${label}`}>
            ›
          </button>
        </div>
      </div>
      <div className="slider__viewport">{renderItem(items[index], index)}</div>
    </div>
  );
}

function CarouselPair({
  items,
  index,
  onPrev,
  onNext,
  renderItem,
  label,
  itemsPerView = 2
}) {
  const visibleCount = Math.min(itemsPerView, items.length);
  const visible = Array.from({ length: visibleCount }, (_, visibleIndex) => items[(index + visibleIndex) % items.length]);
  const endIndex = ((index + visible.length - 1) % items.length) + 1;
  const safeCountLabel =
    items.length > 1 ? `${index + 1}-${endIndex} / ${items.length}` : `1 / 1`;

  return (
    <div className="slider">
      <div className="slider__controls" aria-label={`${label} controls`}>
        <span className="slider__count">{safeCountLabel}</span>
        <div className="slider__buttons">
          <button type="button" className="slider__button" onClick={onPrev} aria-label={`Previous ${label}`}>
            ‹
          </button>
          <button type="button" className="slider__button" onClick={onNext} aria-label={`Next ${label}`}>
            ›
          </button>
        </div>
      </div>
      <div className="slider__viewport slider__viewport--pair">
        {visible.map((item, visibleIndex) => (
          <div key={`${item.name}-${visibleIndex}`} className="slider__item">
            {renderItem(item, (index + visibleIndex) % items.length)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [kayrosIndex, setKayrosIndex] = useState(0);
  const [workflowId, setWorkflowId] = useState(workflows[0].id);
  const [productIndexes, setProductIndexes] = useState(() =>
    Object.fromEntries(workflows.map((workflow) => [workflow.id, 0]))
  );
  const showSingleCard = useMediaQuery("(max-width: 1100px)");

  const activeWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === workflowId) ?? workflows[0],
    [workflowId]
  );

  const activeProductIndex = productIndexes[activeWorkflow.id] ?? 0;

  useEffect(() => {
    const applyHash = () => {
      const nextId = hashToWorkflowId(window.location.hash);
      if (nextId && workflows.some((workflow) => workflow.id === nextId)) {
        setWorkflowId(nextId);
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);

    return () => {
      window.removeEventListener("hashchange", applyHash);
    };
  }, []);

  function cycle(count, current, delta) {
    return (current + delta + count) % count;
  }

  function setProductIndex(workflowKey, delta) {
    setProductIndexes((current) => {
      const workflow = workflows.find((entry) => entry.id === workflowKey);
      if (!workflow) {
        return current;
      }

      return {
        ...current,
        [workflowKey]: cycle(workflow.products.length, current[workflowKey] ?? 0, delta)
      };
    });
  }

  return (
    <>
      <main className="site-shell">
        <div className="masthead">
          <a href="/" className="brand brand--logo-only" aria-label="Provable">
            <img src="/images/provable.png" alt="Provable" className="brand__logo" />
          </a>
          <header className="topbar">
            <nav className="topnav" aria-label="Primary">
            <a href="/" className="brand brand--inline" aria-label="Provable">
              <span className="brand__name">provable</span>
            </a>
              <a href="#sdks">SDKs</a>
              <a href="#kayros">Kayros</a>
              <a href="#workflows">Use Cases</a>
              <a href="/blog/">Blog</a>
               <a href="https://dashboard.kayros.provable.dev" target="_blank" rel="noreferrer">
                Dashboard
              </a>
              <a href="/proof.html" className="topnav__cta">
                Verify a proof
              </a>
            </nav>
          </header>
        </div>

        <section id="sdks" className="sdk-showcase">
          <div className="sdk-showcase__grid">
            {sdkHighlights.map((sdk) => (
              <SdkCard key={sdk.name} sdk={sdk} />
            ))}
          </div>
        </section>

        <section id="kayros" className="panel hero">
          <div className="hero__copy">
            <div className="hero__title-row">
              <img src="/images/kayros.png" alt="Kayros" className="hero__logo" />
              <h1>Kayros</h1>
            </div>
            <p className="hero__lead">
              High-throughput cryptographic integrity infrastructure for time ordered data streams, with nanosecond precision.
              Software and hardware metrology.
              Prevent tampering at CPU Core level.
            </p>
            <div className="metric-pills">
              <span>&gt; 1 million TPS on one single level</span>
              <span>multi-level expansion</span>
              <span>ordered by time</span>
              <span>nanosecond precision</span>
              <span>content-agnostic</span>
              <span>full privacy</span>
              <span>data-blind</span>
              <span>publicly-verifiable</span>
              <span>software and hardware metrology</span>
              <span>prevent tampering at CPU Core level</span>
            </div>
          </div>

          <CarouselPair
            items={kayrosSlides}
            index={kayrosIndex}
            onPrev={() => setKayrosIndex((current) => cycle(kayrosSlides.length, current, -1))}
            onNext={() => setKayrosIndex((current) => cycle(kayrosSlides.length, current, 1))}
            label="Kayros slide"
            itemsPerView={showSingleCard ? 1 : 2}
            renderItem={(slide) =>
              slide.videoId ? (
                <article className="slide-card slide-card--video">
                  <VideoEmbed videoId={slide.videoId} title={slide.title} />
                  <h2>{slide.title}</h2>
                  <p>{slide.body}</p>
                </article>
              ) : slide.imageUrl ? (
                <article className="slide-card">
                  <div className="slide-card__media">
                    <ImageMedia imageUrl={slide.imageUrl} title={slide.title} />
                  </div>
                  <h2>{slide.title}</h2>
                  <p>{slide.body}</p>
                </article>
              ) : (
                <article className="slide-card">
                  <div className="slide-card__media">
                    <MediaPlaceholder label={slide.kicker} logo="/images/kayros.png" />
                  </div>
                  <h2>{slide.title}</h2>
                  <p>{slide.body}</p>
                </article>
              )
            }
          />
        </section>

        <section id="workflows" className="panel workflows">
          <div className="workflow-tabs" role="tablist" aria-label="Use cases">
            {workflows.map((workflow) => {
              const active = workflow.id === workflowId;
              return (
                <button
                  key={workflow.id}
                  type="button"
                  className={`workflow-tab${active ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setWorkflowId(workflow.id);
                    window.history.replaceState(null, "", workflowHref(workflow.id));
                  }}
                >
                  {workflow.label}
                </button>
              );
            })}
          </div>

          <div className="workflow-panel">
            <div className="workflow-panel__copy">
              <h2>{activeWorkflow.title}</h2>
              <p className={activeWorkflow.id === "comms" ? "workflow-panel__quote" : ""}>
                {activeWorkflow.description}
              </p>
              <ul className="workflow-panel__list">
                {activeWorkflow.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>

            <CarouselPair
              items={activeWorkflow.products}
              index={activeProductIndex}
              onPrev={() => setProductIndex(activeWorkflow.id, -1)}
              onNext={() => setProductIndex(activeWorkflow.id, 1)}
              label={`${activeWorkflow.label} product`}
              itemsPerView={showSingleCard ? 1 : 2}
              renderItem={(product) => <ProductCard product={product} />}
            />
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
