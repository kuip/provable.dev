import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ethos } from "../siteData.js";

export function SiteFooter() {
  return React.createElement(
    "footer",
    { className: "site-footer" },
    React.createElement(
      "div",
      { className: "site-footer__brand" },
      React.createElement(
        "div",
        { className: "site-footer__brand-row" },
        React.createElement("img", {
          src: "/images/provable.png",
          alt: "Provable",
          className: "site-footer__logo"
        }),
        React.createElement("p", null, "Infrastructure for evidence, provenance, and high-trust systems.")
      ),
      React.createElement("p", { className: "site-footer__title" }, "Motto"),
      React.createElement(
        "div",
        { className: "site-footer__motto-lines" },
        ...ethos.map((statement) => React.createElement("p", { key: statement }, statement))
      )
    ),
    React.createElement(
      "div",
      { className: "site-footer__contact" },
      React.createElement("p", { className: "site-footer__title" }, "Contact"),
      React.createElement(
        "div",
        { className: "site-footer__links" },
        React.createElement(
          "a",
          {
            href: "https://x.com/is_provable",
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "Provable on X"
          },
          React.createElement(
            "svg",
            { viewBox: "0 0 24 24", "aria-hidden": "true", className: "site-footer__icon" },
            React.createElement("path", {
              d: "M18.901 1.153h3.68l-8.039 9.188 9.457 12.506H16.594L10.79 15.26l-6.64 7.587H.47l8.598-9.826L0 1.153h7.595l5.247 6.942 6.059-6.942Z"
            })
          ),
          React.createElement("span", null, "@is_provable")
        ),
        React.createElement("a", { href: "mailto:contact@mail.provable.dev" }, "contact@mail.provable.dev")
      )
    ),
    React.createElement(
      "div",
      { className: "site-footer__legal" },
      React.createElement("p", { className: "site-footer__title" }, "Legal"),
      React.createElement(
        "a",
        { href: "https://www.kuip.co.uk", target: "_blank", rel: "noreferrer" },
        "\u00A9 2025-present Kuip Limited"
      ),
      React.createElement("a", { href: "/privacy/" }, "Privacy"),
      React.createElement("a", { href: "/terms/" }, "Terms")
    )
  );
}

export function renderSiteFooterHtml() {
  return renderToStaticMarkup(React.createElement(SiteFooter));
}
