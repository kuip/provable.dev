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

## Existing proof UI workflow
```bash
cd ./provable-sdk/provable-sdk-ui
npm run build:browser

cd ./dist/browser
python3 -m http.server 8080

# open in browser
# file:///path_to/provable.dev/proof.html?ui=local
```
