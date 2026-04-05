<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 15.1.10 / React 19) has breaking changes — APIs, conventions, and file structure may differ from your training data. Check the official Next.js 15 docs or release notes before using unfamiliar APIs. Heed deprecation notices.

This app is served **statically through GitHub Pages** via `output: 'export'`. Many Next.js features are unsupported in static export mode.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:static-export-constraints -->
## Static Export Rules

These features are **NOT available** in this project:

- `app/api/` routes (no server runtime)
- `getServerSideProps`, `getInitialProps`, or any server-only data fetching
- Dynamic routes that require runtime resolution (build-time `generateStaticParams` is fine)
- Middleware (`middleware.ts`)
- Image Optimization (next/image with default loader — use `unoptimized: true` or static imports)
- Incremental Static Regeneration (ISR)
- Draft Mode
- Server Actions

If you're unsure whether a feature works with static export, test with `npm run build` before committing.
<!-- END:static-export-constraints -->

<!-- BEGIN:project-conventions -->
## Project Conventions

### File Structure
- **Route pages:** `app/<route>/page.tsx` — server component, exports `metadata`, renders `PageHeader` + client component
- **Client components:** `app/<route>/<Name>Client.tsx` — all interactivity here, must have `'use client'` directive
- **Shared UI:** `app/components/` — Navbar, Footer, PageHeader, PostTestForm
- **Shared logic:** `app/lib/` — classifiers, email-parser, file-parser
- **Styles:** `app/globals.css` — single global stylesheet, dark theme, no CSS modules or Tailwind

### Adding a New Page
1. Create `app/<route>/page.tsx` with metadata export and `PageHeader` + client component
2. Create `app/<route>/<Name>Client.tsx` with `'use client'` directive
3. Use existing CSS classes from `globals.css` before adding new ones
4. Add navigation link in `Navbar.tsx`
5. Run `npm run build` to verify static export succeeds

### Code Patterns
- Guard `localStorage` access with `typeof window !== 'undefined'`
- Use dynamic imports for heavy libraries (e.g., `pdfjs-dist`)
- No external API calls for core functionality — all processing is client-side
- Use `PostTestForm` component for any new exfiltration channel test pages
- Classifiers go in `app/lib/classifiers.ts` — follow the `ClassifierDef` interface

### Styling
- Dark theme: background `#0a0e17`, text `#e0e0e0`, accent `#4fc3f7`
- Responsive breakpoint at 768px
- Use existing `.card`, `.btn-primary`, `.btn-outline`, `.form-control`, `.info-box`, `.warning-box` classes
- Icons use HTML entities (e.g., `&#9776;`, `&#128451;`), not image files
<!-- END:project-conventions -->

<!-- BEGIN:build-deploy -->
## Build & Deploy

```bash
npm run dev          # Dev server (Turbo mode)
npm run build        # Static export to /out/
```

- `package-lock.json` MUST be committed — GitHub Actions CI uses `npm ci`
- `/out/` is git-ignored and rebuilt on every deploy
- `basePath` is injected by GitHub Actions via `PAGES_BASE_PATH` env var
- Custom domain: `fortrafied.com` (set via CNAME file)
<!-- END:build-deploy -->
