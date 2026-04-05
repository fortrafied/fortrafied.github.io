@AGENTS.md

# Fortrafied — DLP Testing & Validation Platform

## What This Project Is

Fortrafied is a privacy-first, client-side DLP (Data Loss Prevention) testing and validation website. All data processing happens in the browser — no data is ever sent to or stored on a server. It's designed as a comprehensive alternative to dlptest.com, covering multiple exfiltration channels and data states.

**Live site:** [fortrafied.com](https://fortrafied.com)
**Hosting:** GitHub Pages (static export from this repo)

## Tech Stack

- **Next.js 15.1.10** with `output: 'export'` (static site generation only)
- **React 19** / **TypeScript 5.7.3**
- **jszip** — parsing OOXML documents (DOCX/XLSX/PPTX)
- **pdfjs-dist** — PDF text extraction
- **Pure CSS** — all styles in `app/globals.css`, dark theme, no Tailwind or CSS-in-JS
- **No backend, no API routes, no SSR** — everything is static HTML/JS/CSS

## Project Layout

```
app/
├── layout.tsx                      # Root layout (Navbar + Footer)
├── page.tsx                        # Home page
├── globals.css                     # All project styles (~500 lines, dark theme)
│
├── components/
│   ├── Navbar.tsx                  # Sticky nav, mobile hamburger (client)
│   ├── Footer.tsx                  # 3-column footer, disclaimer (server)
│   ├── PageHeader.tsx              # Reusable gradient page header (server)
│   └── PostTestForm.tsx            # Shared HTTP/HTTPS POST form (client)
│
├── lib/
│   ├── classifiers.ts              # 21 builtin classifiers + localStorage helpers
│   ├── email-parser.ts             # Email header & auth analysis (SPF/DKIM/DMARC)
│   └── file-parser.ts              # Multi-format parser (DOCX/XLSX/PPTX/PDF/HTML/TXT)
│
├── data-classifier/                # Text & file sensitive-data classifier
├── regex-tester/                   # Live regex testing with 16 DLP presets
├── hash-generator/                 # MD5/SHA-1/SHA-256 file hashing
├── classification-builder/         # Custom classifier creator (localStorage)
├── email-analyzer/                 # Email header security analysis
├── prompt-builder/                 # DLP prompt scaffolder (visual + source preview)
├── sample-data/                    # Synthetic sample data downloads
├── http-post/                      # HTTP POST exfiltration test
├── https-post/                     # HTTPS POST exfiltration test
├── email-test/                     # SMTP/email exfiltration test
├── ftp-test/                       # FTP upload exfiltration test
├── clipboard-test/                 # Clipboard copy/paste detection test
├── print-test/                     # Print/screenshot detection test
├── dp-solution/                    # DP solution composer (coming soon)
└── faq/                            # FAQ accordion
```

## File Conventions

Every route follows this pattern:

- `app/<route>/page.tsx` — **Server component**. Exports `metadata` and renders `PageHeader` + the client component. Keep minimal.
- `app/<route>/<Name>Client.tsx` — **Client component** (`'use client'`). All interactivity, state, and browser APIs live here. Named with `Client` suffix.

Shared logic goes in `app/lib/`. Shared UI goes in `app/components/`.

## Styling

All styles live in `app/globals.css`. No CSS modules, no Tailwind, no styled-components.

Design tokens: dark background `#0a0e17`, text `#e0e0e0`, accent cyan `#4fc3f7`. Responsive at 768px breakpoint. CSS Grid with `auto-fill` for card layouts.

When adding new pages, use the existing CSS classes before creating new ones. Check `globals.css` for available `.card`, `.btn-*`, `.form-*`, `.info-box`, `.warning-box` classes.

## Key Patterns

**Client-side only processing:** No fetch calls to external APIs for core functionality. File parsing, regex matching, hashing, and classification all happen in the browser via Web Crypto API, DOMParser, JSZip, and pdfjs-dist.

**Classifier system** (`app/lib/classifiers.ts`):
- 21 builtin classifiers covering PII, PCI, PHI, Financial, Network, and Credentials
- Custom classifiers stored in `localStorage` under key `fortrafied_custom_classifiers`
- Two pattern types: `regex` and `dictionary` (newline-separated keywords converted to word-boundary regex)
- Severity levels: Low, Medium, High, Critical
- Color-coded by category: red, orange, blue, green, purple

**File parser** (`app/lib/file-parser.ts`):
- Unified `parseFile()` entry point handles DOCX, XLSX, PPTX, PDF, TXT, HTML
- OOXML formats parsed via JSZip + XML DOM
- PDF parsed via dynamic import of pdfjs-dist
- HTML files checked for Vera encryption markers (`<meta name="veradocs">`) with metadata extraction
- Returns text content + document properties + classification labels

**Shared form component** (`PostTestForm.tsx`):
- Reused by `/http-post` and `/https-post` routes
- Supports text entry, file upload (drag-and-drop), content-type selection
- Preset data samples (SSN, CCN, PII, PHI, Financial)

## Build & Deployment

```bash
npm run dev          # Dev server with Turbo
npm run build        # Static export to /out/
```

GitHub Actions (`.github/workflows/nextjs.yml`) builds on push to `main`, runs `npm ci && next build`, and deploys the `/out/` directory to GitHub Pages. The `/out/` directory is git-ignored — it's rebuilt fresh each deploy.

`basePath` is set dynamically via `process.env.PAGES_BASE_PATH` (injected by the GitHub Actions pages setup step).

## Static Export Constraints

Because this is `output: 'export'` for GitHub Pages:

- **No API routes** — no `app/api/` directory
- **No server-side rendering** — no `getServerSideProps`, no dynamic server functions
- **No dynamic routes** requiring server resolution (e.g., `[slug]` with `generateStaticParams` is fine, but runtime-only params are not)
- **All data** must be static, build-time, or client-side fetched
- **Some Next.js features are unsupported** — always check `node_modules/next/dist/docs/` before using unfamiliar APIs

## localStorage Usage

Custom classifiers persist via localStorage. Always guard with `typeof window !== 'undefined'` for SSR compatibility during build. Key: `fortrafied_custom_classifiers`.

## Known History & Decisions

- **Migrated from static HTML:** Originally 14+ static HTML pages, converted to Next.js React components. The CSS in `globals.css` was carried over from the static site.
- **K.I.S.S. principle:** Deliberately no component libraries, no extra UI frameworks. Plain React + existing CSS handles everything.
- **Parallel development:** Multiple features were built concurrently using parallel AI agents during initial setup.
- **package-lock.json is required:** Must be committed for GitHub Actions CI to work (`npm ci` needs it).

## Planned / Coming Soon

- `/dp-solution` — Interactive DLP product/feature matrix (Solution Composer)
- Policy generator and policy builder pages
- External JS integration for advanced sample generation and solution composer logic
- Enhanced prompt builder with full component content for Fortra Endpoint DLP and Cloud DLP platforms
