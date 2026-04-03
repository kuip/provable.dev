export function App() {
  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">provable.dev</p>
        <h1>React Workspace Ready</h1>
        <p>
          This Vite + React app is mounted at <code>/app/</code> and coexists with
          your existing static pages.
        </p>
        <ul>
          <li>
            <a href="/">Home (existing static page)</a>
          </li>
          <li>
            <a href="/proof.html">Proof page (existing static page)</a>
          </li>
          <li>
            <a href="/privacy/">Privacy Policy (generated from markdown)</a>
          </li>
          <li>
            <a href="/terms/">Terms of Use (generated from markdown)</a>
          </li>
        </ul>
      </section>
    </main>
  );
}
