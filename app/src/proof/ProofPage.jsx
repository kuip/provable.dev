import { useEffect, useMemo, useRef, useState } from "react";
import { ProofViewer } from "@kuip/provable-ui";
import {
  createEnvelopeAdapter,
  decodeBase64ToText,
  extractTopLevelDataJson,
  isEnvelope,
  readPath
} from "./envelopeAdapter";

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useProofTheme() {
  const [theme, setTheme] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("theme");
    if (requested === "dark" || requested === "light") {
      return requested;
    }
    return getSystemTheme();
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("theme");
    if (requested === "dark" || requested === "light") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return theme;
}

function parseJsonText(text) {
  const parsed = JSON.parse(text);
  if (!isEnvelope(parsed)) {
    throw new Error("Invalid proof JSON. Expected an envelope with { data, kayros }.");
  }
  return { parsed, text };
}

function getDisplayedSourceFromData(data) {
  if (!data || typeof data !== "object") {
    return "Proof loaded";
  }
  return (
    data.pageUrl ||
    data.url ||
    readPath(data, ["meta", "url"]) ||
    readPath(data, ["meta", "value", "url"]) ||
    "Proof loaded"
  );
}

function getDisplayedSource(envelope) {
  return getDisplayedSourceFromData(envelope?.data);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(String(event.target?.result || ""));
    };
    reader.onerror = () => reject(new Error("Failed to read selected file."));
    reader.readAsText(file);
  });
}

export function ProofPage() {
  const [error, setError] = useState("");
  const [loadLabel, setLoadLabel] = useState("Upload a proof file to view");
  const [proof, setProof] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const theme = useProofTheme();

  const viewerEnvelope = useMemo(() => {
    if (!proof) {
      return null;
    }
    const rawDataJson = extractTopLevelDataJson(proof.text);
    return createEnvelopeAdapter(proof.parsed, rawDataJson);
  }, [proof]);

  const displayedLoadLabel = useMemo(() => {
    if (!viewerEnvelope) {
      return loadLabel;
    }
    return getDisplayedSourceFromData(viewerEnvelope.parseData());
  }, [loadLabel, viewerEnvelope]);

  useEffect(() => {
    document.documentElement.dataset.proofTheme = theme;
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    const dataParam = params.get("data");

    async function loadFromUrl(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch proof URL (${response.status})`);
      }
      return parseJsonText(await response.text());
    }

    async function init() {
      if (!urlParam && !dataParam) {
        return;
      }

      try {
        const nextProof = urlParam
          ? await loadFromUrl(urlParam)
          : parseJsonText(decodeBase64ToText(dataParam));
        setProof(nextProof);
        setLoadLabel(getDisplayedSource(nextProof.parsed));
        setError("");
      } catch (loadError) {
        setProof(null);
        setLoadLabel(urlParam ? "Failed to load proof from URL" : "Failed to load proof from data");
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    }

    init();
  }, []);

  async function loadText(text) {
    const nextProof = parseJsonText(text);
    setProof(nextProof);
    setLoadLabel(getDisplayedSource(nextProof.parsed));
    setError("");
  }

  async function loadFile(file) {
    try {
      await loadText(await readFileAsText(file));
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : String(fileError));
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFileInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      loadFile(file);
    }
    event.target.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  }

  return (
    <main className="proof-shell" data-theme={theme}>
      <header className="proof-header">
        <div className="proof-header__copy">
          <p className="proof-kicker">Proof viewer</p>
          <h1>Verify a Provable proof</h1>
          <p>{displayedLoadLabel}</p>
        </div>
        <a href="/" className="proof-home-link" aria-label="Provable home">
          <img src="/images/provable.png" alt="Provable" />
        </a>
      </header>

      {error ? <div className="proof-error">{error}</div> : null}

      {!viewerEnvelope ? (
        <section
          className={`proof-upload${isDragging ? " proof-upload--dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div>
            <p className="proof-upload__eyebrow">JSON envelope</p>
            <h2>Drop a proof file here</h2>
            <p>or choose a local proof JSON file.</p>
          </div>
          <button type="button" className="proof-button" onClick={openFilePicker}>
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={onFileInputChange}
          />
        </section>
      ) : (
        <>
          <div className="proof-actions">
            <button type="button" className="proof-button proof-button--secondary" onClick={openFilePicker}>
              Open another proof
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={onFileInputChange}
            />
          </div>
          <section className="proof-viewer" aria-label="Proof details">
            <ProofViewer envelope={viewerEnvelope} theme={theme} showRemoteRecord />
          </section>
        </>
      )}
    </main>
  );
}
