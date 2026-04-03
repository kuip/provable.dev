import { useMemo, useState } from "react";

const kayrosSlides = [
  {
    kicker: "Banks",
    title: "VISA-scale indexing without censorship.",
    body: "A transparent indexer for payment-scale systems that remains content-agnostic and preserves transaction privacy."
  },
  {
    kicker: "Blockchains",
    title: "Consensus for execution layers that need maximum TPS.",
    body: "Use Kayros indexers for the maximum TPS an execution layer can support, without MEV pressure, bots, or front-running."
  },
  {
    kicker: "Private contracts",
    title: "Private transactions until proof is needed.",
    body: "Index private cryptocurrencies or private digital contracts while preserving privacy until a proof must be shown."
  },
  {
    kicker: "Demo",
    title: "Kayros Demo Version 1",
    body: "65k TPS on Mac Mini M4, with architecture designed to move far beyond that on a single layer and expand across multiple layers.",
    videoId: "JEw9N6c1i2g"
  }
];

const workflows = [
  {
    id: "vision",
    label: "Vision systems",
    title: "Frames, detections, and machine decisions should be provable together.",
    description:
      "For maritime software, public cameras, bodycams, drones, and industrial glasses where frame-level evidence and operational chronology both matter.",
    bullets: [
      "Frame-level video notarization",
      "Detection and action provenance",
      "Reviewable evidence for sensitive incidents"
    ],
    products: [
      {
        name: "Oliver",
        logo: "/images/oliver.png",
        description:
          "Frame-level video notarization and authentication for visual evidence pipelines.",
        videoId: "jQGVPddBclc",
        href: "https://oliver.provable.dev"
      },
      {
        name: "Carpe!",
        logo: "/images/carpe.png",
        description:
          "Record-level database notarization for detections, alerts, decisions, and downstream operational data.",
        videoId: "EuwNDeDu9Ao"
      },
      {
        name: "Provable SDK",
        description:
          "TypeScript, Python, and Golang packages for notarizing critical APIs and machine-event pipelines.",
        href: "https://github.com/kuip/provable-sdk"
      }
    ]
  },
  {
    id: "industry",
    label: "Industry, RWA, IoT",
    title: "Attach proof to assets, telemetry, and machine-generated events.",
    description:
      "For production systems, real-world asset traceability, industrial telemetry, and IoT actions where throughput and chronology both matter.",
    bullets: [
      "RWA-linked records for QR, barcode, NFC/RFID, and BLE",
      "High-throughput operational streams",
      "Inspectability beyond coarse audit logs"
    ],
    products: [
      {
        name: "Oliver for RWA",
        logo: "/images/oliver.png",
        description:
          "Notarization for physical assets and tags across logistics, custody, and verification workflows.",
        videoId: "5U1kOKrBDts",
        href: "https://oliver.provable.dev"
      },
      {
        name: "Carpe!",
        logo: "/images/carpe.png",
        description:
          "Record-level history for operational datasets, asset events, and IoT-driven changes.",
        videoId: "EuwNDeDu9Ao"
      },
      {
        name: "Provable SDK",
        description:
          "Add cryptographic notarization directly to industrial APIs and event-processing systems.",
        href: "https://github.com/kuip/provable-sdk"
      }
    ]
  },
  {
    id: "comms",
    label: "Comms & Journalism",
    title: "Comms, documents, and captured media under pressure.",
    description:
      "If you are fighting a proof war (journalist, activist, researcher, citizen, etc.), we want to know your specific needs. Let's work together.",
    bullets: [
      "Capture-time media authenticity",
      "Notarized web forms, webpages, and email flows",
      "Document history that remains inspectable later"
    ],
    products: [
      {
        name: "Veritas",
        logo: "/images/veritas.png",
        description:
          "A secure, fully notarized folder that captures file changes and document history. Compatible with Google Drive.",
        videoId: "8VEWngK8S7E"
      },
      {
        name: "Provable Form",
        description:
          "Chrome extension that creates a cryptographic timestamped proof of submitting an online form without storing your data.",
        href: "https://chromewebstore.google.com/detail/provable-form/djppgolnnaeaoingadhdbianibehcpeb"
      },
      {
        name: "Provable Web",
        description:
          "Chrome extension that creates a timestamped proof of a web page, HTTP requests, and loaded browser scripts.",
        href: "https://chromewebstore.google.com/detail/provable-web/kgmbhnafpiiiapfpheibbahlmladldmi"
      },
      {
        name: "Provable Email",
        description:
          "Notarize emails by adding kayros1@dmail.provable.dev as To, Cc, or Bcc and receive a cryptographic proof."
      },
      {
        name: "Provable SDK",
        description:
          "SDKs for adding notarization to communication platforms, editorial workflows, and critical APIs.",
        href: "https://github.com/kuip/provable-sdk"
      },
      {
        name: "Provable Email Forwarding",
        description:
          "A new forwarding protocol that authenticates the original email and the full email chain.",
        href: "https://wasmx.provable.dev/docs/architecture/provable_email_forwarding"
      },
      {
        name: "Provable Wallet",
        description:
          "Your personal digital notary for the AI era, with encrypted storage for proofs and private summaries."
      },
      {
        name: "Timestamped Media",
        description:
          "Timestamp images and videos with Kayros and keep a public proof without exposing the underlying media.",
        videoId: "6sLufsnUMK4",
        href: "https://youtu.be/6sLufsnUMK4?si=rSocRDdGovTUNl9S"
      }
    ]
  },
  {
    id: "blockchain",
    label: "Blockchain Systems",
    title: "Expressive blockchain systems with maximum execution freedom.",
    description:
      "Use wasmX where you need multi-VM execution, language flexibility, domain-specific interpreters, and host APIs beyond conventional chains.",
    bullets: [
      "Multi-VM and language-agnostic execution",
      "General and domain-specific interpreters",
      "Host APIs for broader system integration"
    ],
    products: [
      {
        name: "wasmX",
        logo: "/images/wasmx.png",
        description:
          "The most expressive WASM blockchain tech: multi VM, language-agnostic, general and domain-specific interpreters, and a broad host API surface.",
        href: "https://wasmx.provable.dev"
      }
    ]
  }
];

const allProducts = [
  {
    name: "Oliver",
    logo: "/images/oliver.png",
    description:
      "Frame-level video notarization and authentication for visual evidence pipelines.",
    videoId: "jQGVPddBclc",
    href: "https://oliver.provable.dev"
  },
  {
    name: "Oliver for RWA",
    logo: "/images/oliver.png",
    description:
      "Notarization for physical assets and tags across logistics, custody, and verification workflows.",
    videoId: "5U1kOKrBDts",
    href: "https://oliver.provable.dev"
  },
  {
    name: "Carpe!",
    logo: "/images/carpe.png",
    description:
      "Record-level database notarization for operational data, detections, alerts, asset events, and downstream decisions.",
    videoId: "EuwNDeDu9Ao"
  },
  {
    name: "Veritas",
    logo: "/images/veritas.png",
    description:
      "A secure, fully notarized folder that captures file changes and document history. Compatible with Google Drive.",
    videoId: "8VEWngK8S7E"
  },
  {
    name: "Provable Form",
    description:
      "Chrome extension that creates a cryptographic timestamped proof of submitting an online form without storing your data.",
    href: "https://chromewebstore.google.com/detail/provable-form/djppgolnnaeaoingadhdbianibehcpeb"
  },
  {
    name: "Provable Web",
    description:
      "Chrome extension that creates a timestamped proof of a web page, HTTP requests, and loaded browser scripts.",
    href: "https://chromewebstore.google.com/detail/provable-web/kgmbhnafpiiiapfpheibbahlmladldmi"
  },
  {
    name: "Provable Email",
    description:
      "Notarize emails by adding kayros1@dmail.provable.dev as To, Cc, or Bcc and receive a cryptographic proof."
  },
  {
    name: "Provable SDK",
    description:
      "TypeScript, Python, and Golang packages for adding cryptographic notarization to critical APIs and systems.",
    href: "https://github.com/kuip/provable-sdk"
  },
  {
    name: "Provable Email Forwarding",
    description:
      "A new forwarding protocol that authenticates the original email and the full email chain.",
    href: "https://wasmx.provable.dev/docs/architecture/provable_email_forwarding"
  },
  {
    name: "Provable Wallet",
    description:
      "Your personal digital notary for the AI era, with encrypted storage for proofs and private summaries."
  },
  {
    name: "Timestamped Media",
    description:
      "Timestamp images and videos with Kayros and keep a public proof without exposing the underlying media.",
    videoId: "6sLufsnUMK4",
    href: "https://youtu.be/6sLufsnUMK4?si=rSocRDdGovTUNl9S"
  },
  {
    name: "wasmX",
    logo: "/images/wasmx.png",
    description:
      "The most expressive WASM blockchain tech: multi VM, language-agnostic, general and domain-specific interpreters, and a broad host API surface.",
    href: "https://wasmx.provable.dev"
  }
];

workflows.unshift({
  id: "all-products",
  label: "All products",
  title: "One stack, multiple proof workflows.",
  description:
    "Browse the full product surface across media, real-world assets, databases, communications, and blockchain systems.",
  bullets: [
    "Media, documents, email, and web proofs",
    "RWA and industrial event notarization",
    "Developer tooling and blockchain infrastructure"
  ],
  products: allProducts
});

const ethos = [
  "Tools for a provable new world",
  "The right to evidence must be a human right.",
  "Proofs will become more important than money."
];

function ProductCard({ product }) {
  const content = (
    <>
      <div className="product-card__media">
        {product.videoId ? (
          <div className="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${product.videoId}`}
              title={product.name}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="product-card__placeholder">
            {product.logo ? (
              <img src={product.logo} alt={product.name} className="product-card__placeholder-logo" />
            ) : null}
            <span>{product.name}</span>
          </div>
        )}
      </div>
      <div className="product-card__head">
        {product.logo ? (
          <img src={product.logo} alt={product.name} className="product-card__logo" />
        ) : null}
        <h3>{product.name}</h3>
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

export function App() {
  const [kayrosIndex, setKayrosIndex] = useState(0);
  const [workflowId, setWorkflowId] = useState(workflows[0].id);
  const [productIndexes, setProductIndexes] = useState(() =>
    Object.fromEntries(workflows.map((workflow) => [workflow.id, 0]))
  );

  const activeWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === workflowId) ?? workflows[0],
    [workflowId]
  );

  const activeProductIndex = productIndexes[activeWorkflow.id] ?? 0;

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
        <header className="topbar">
          <a href="/" className="brand" aria-label="Provable">
            <img src="/images/provable.png" alt="Provable" className="brand__logo" />
            <span className="brand__name">Provable</span>
          </a>
          <nav className="topnav" aria-label="Primary">
            <a href="#kayros">Kayros</a>
            <a href="#workflows">Use Cases</a>
            <a href="#ethos">Ethos</a>
            <a href="/proof.html" className="topnav__cta">
              Verify a proof
            </a>
          </nav>
        </header>

        <section id="kayros" className="panel hero">
          <div className="hero__copy">
            <img src="/images/kayros.png" alt="Kayros" className="hero__logo" />
            <h1>The fastest transaction indexer ordered by time, at global scale.</h1>
            <p className="hero__lead">
              High-throughput notarization for systems that need more than conventional logging,
              slower consensus, or fragile audit trails.
            </p>
            <div className="metric-pills">
              <span>&gt; 1 million TPS on one single layer</span>
              <span>Multi-layer expansion</span>
              <span>Ordered by time</span>
              <span>Content-agnostic</span>
            </div>
          </div>

          <Carousel
            items={kayrosSlides}
            index={kayrosIndex}
            onPrev={() => setKayrosIndex((current) => cycle(kayrosSlides.length, current, -1))}
            onNext={() => setKayrosIndex((current) => cycle(kayrosSlides.length, current, 1))}
            label="Kayros slide"
            renderItem={(slide) =>
              slide.videoId ? (
                <article className="slide-card slide-card--video">
                  <div className="video-frame">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${slide.videoId}`}
                      title={slide.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <p className="slide-card__kicker">{slide.kicker}</p>
                  <h2>{slide.title}</h2>
                  <p>{slide.body}</p>
                </article>
              ) : (
                <article className="slide-card">
                  <p className="slide-card__kicker">{slide.kicker}</p>
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
                  onClick={() => setWorkflowId(workflow.id)}
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

            <Carousel
              items={activeWorkflow.products}
              index={activeProductIndex}
              onPrev={() => setProductIndex(activeWorkflow.id, -1)}
              onNext={() => setProductIndex(activeWorkflow.id, 1)}
              label={`${activeWorkflow.label} product`}
              countLabel={`${activeProductIndex + 1} / ${activeWorkflow.products.length}`}
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
