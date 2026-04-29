# provable.dev

## Build
```bash
npm install
npm run build
```

Build output goes to `dist/`.

Static assets now live in `public/`.

- Files in `public/` are copied to the site root during build.
- Use `public/images/` for image assets and generated favicon files.
- Use `public/fonts/` for web fonts.
- Use `public/CNAME` for the custom domain file.
- Markdown legal sources now live in `public/PrivacyPolicy.md` and `public/Terms.md`.
- Generated legal routes are `/privacy/` and `/terms/`.

## React app (Vite)
```bash
npm run dev
```

The React workspace lives at `/app/` and is built into `dist/app/`.

## Proof UI
```bash
npm run dev
```

The proof viewer at `/proof.html` is a Vite-built React entry that imports the
published `@kuip/provable-ui` package.

## Blog

Blog posts live in `/blog/*.md` and are rendered to static HTML routes:

- `/blog/`
- `/blog/<slug>/`

Each post uses simple frontmatter:

```md
---
title: "Post title"
author: "Author name"
date: "2026-04-29"
slug: "post-slug"
summary: "Short summary used on the blog index and post header."
image: "/images/example.png"
---
```
