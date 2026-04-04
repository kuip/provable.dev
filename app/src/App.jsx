import { useEffect, useMemo, useState } from "react";
import { ethos, kayrosSlides, workflows } from "./siteData";

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
  const content = (
    <>
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
          <span className="product-card__link-icon" aria-hidden="true">
            ↗
          </span>
        ) : null}
      </div>
      <p>{product.description}</p>
    </>
  );

  if (product.href) {
    return (
      <a
        href={product.href}
        target="_blank"
        rel="noreferrer"
        className="product-card product-card--link"
      >
        {content}
      </a>
    );
  }

  return <article className="product-card">{content}</article>;
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
              <a href="#kayros">Kayros</a>
              <a href="#workflows">Use Cases</a>
              <a href="#ethos">Ethos</a>
              <a href="/proof.html" className="topnav__cta">
                Verify a proof
              </a>
            </nav>
          </header>
        </div>

        <section id="kayros" className="panel hero">
          <div className="hero__copy">
            <div className="hero__title-row">
              <img src="/images/kayros.png" alt="Kayros" className="hero__logo" />
              <h1>Kayros</h1>
            </div>
            <p className="hero__lead">
              High-throughput cryptographic notarization for time ordered actions, with nanosecond precision.
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

        <section id="ethos" className="panel ethos">
          <div className="ethos__grid">
            {ethos.map((statement) => (
              <article key={statement} className="ethos__card">
                <p>{statement}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <img src="/images/provable.png" alt="Provable" className="site-footer__logo" />
          <p>Infrastructure for evidence, provenance, and high-trust systems.</p>
        </div>

        <div className="site-footer__contact">
          <p className="site-footer__title">Contact</p>
          <div className="site-footer__links">
            <a href="https://x.com/is_provable" target="_blank" rel="noreferrer" aria-label="Provable on X">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="site-footer__icon">
                <path d="M18.901 1.153h3.68l-8.039 9.188 9.457 12.506H16.594L10.79 15.26l-6.64 7.587H.47l8.598-9.826L0 1.153h7.595l5.247 6.942 6.059-6.942Zm-1.291 19.49h2.039L6.487 3.24H4.3L17.61 20.643Z" />
              </svg>
              <span>@is_provable</span>
            </a>
            <a href="mailto:contact@mail.provable.dev">contact@mail.provable.dev</a>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
          </div>
        </div>

        <div className="site-footer__meta">
          <a href="https://www.kuip.co.uk" target="_blank" rel="noreferrer">
            &copy; 2025-present Kuip Limited
          </a>
        </div>
      </footer>
    </>
  );
}
