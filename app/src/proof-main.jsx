import React from "react";
import { createRoot } from "react-dom/client";
import "@kuip/provable-ui/styles.css";
import "./proof.css";
import { ProofPage } from "./proof/ProofPage";

const rootElement = document.getElementById("proof-root");

createRoot(rootElement).render(
  <React.StrictMode>
    <ProofPage />
  </React.StrictMode>
);
