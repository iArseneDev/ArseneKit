# ArseneKit

ArseneKit is a growing collection of free, browser-based tools built by [iArseneDev](https://github.com/iArseneDev). Each tool has its own route and page metadata. The site uses Next.js and React and is statically exported for deployment on Vercel.

## Tools

- **Image Converter** — /image-converter/ converts browser-supported images to PNG, JPG, or WebP, with optional resizing. Image processing happens locally in the browser; files are not uploaded.
- **Live Code Editor** — /live-code-editor/ provides HTML, CSS, and JavaScript tabs, CodeMirror syntax highlighting, a sandboxed live preview, and standalone HTML download.
- **JSON Formatter & Validator** — /json-formatter/ formats, minifies, validates, and optionally sorts JSON in the browser.

The platform supports light and dark themes. It follows the visitor's system preference by default and remembers a manual choice in local storage.

## Requirements

- Node.js 20.9 or newer
- pnpm 11

## Run locally

    pnpm install
    pnpm dev

Open the local URL printed by Next.js, usually http://localhost:3000.

## Build for production

    pnpm build

Next.js creates the static site in the out directory.

## Deploy to Vercel

Import the repository into Vercel. vercel.json selects Vercel’s “Other” preset so Vercel serves Next.js’s static export directly, while still installing dependencies with pnpm and running the production build.

- **Install command:** pnpm install --frozen-lockfile
- **Build command:** pnpm build
- **Output directory:** out, set in vercel.json
- **Root directory:** the repository root

Each tool is generated as its own static page, so visitors can link directly to it.
The sitemap is generated at `/sitemap.xml`. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production origin if it differs from `https://arsenekit.vercel.app`.

## Project structure

- app/components/theme-toggle.js — shared theme control
- app/image-converter/ — image conversion page and browser-side logic
- app/live-code-editor/ — CodeMirror editor page
- app/json-formatter/ — JSON formatting and validation page
- app/globals.css — shared and responsive platform styles
- public/archive/ — previous editor source, marked noindex
