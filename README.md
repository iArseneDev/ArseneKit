# ArseneKit

ArseneKit is a growing collection of free, browser-based tools built by [iArseneDev](https://github.com/iArseneDev). Each tool has its own route and page metadata. The site is built with Next.js and React and exported as static files for Cloudflare Pages.

## Tools

- **Image Converter** — /image-converter/ converts browser-supported images to PNG, JPG, or WebP, with optional resizing. Image processing happens locally in the browser; files are not uploaded.
- **Live Code Editor** — /live-code-editor/ provides HTML, CSS, and JavaScript tabs, CodeMirror syntax highlighting, a sandboxed live preview, and standalone HTML download.

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

## Deploy to Cloudflare Pages

Connect the repository to Cloudflare Pages and set:

- **Build command:** pnpm build
- **Build output directory:** out
- **Root directory:** / (the repository root)

Every tool page is statically generated at its own path, so links can point directly to a tool.

## Project structure

- app/components/theme-toggle.js — shared theme control
- app/image-converter/ — image conversion page and browser-side logic
- app/live-code-editor/ — CodeMirror editor page
- app/globals.css — shared and responsive platform styles
- public/archive/ — previous editor source, marked noindex
