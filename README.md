# XPath Extractor Pro 🔍

A production-grade **QA Automation Tool** that extracts all unique XPath selectors from any webpage URL — similar to Chrome DevTools, SelectorsHub, and ChroPath.

![XPath Extractor Pro](https://img.shields.io/badge/XPath-Extractor%20Pro-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Playwright](https://img.shields.io/badge/Playwright-1.60-green?style=for-the-badge&logo=playwright)
![Express](https://img.shields.io/badge/Express-5-gray?style=for-the-badge&logo=express)

---

## Features

- ⚡ **JS-Rendered Pages** — Playwright handles dynamic SPAs, waits for full render
- 🎯 **7 XPath Strategies** per element — Absolute, Relative, ID, Name, Class, Text, Contains-Text
- ✅ **Uniqueness Validation** — every XPath tested against the live DOM (✅ Unique / ⚠️ Multiple / ❌ Invalid)
- 📋 **Element Definition View** — syntax-highlighted HTML tag + attribute pills alongside every XPath
- 🔍 **XPath Test Console** — enter any XPath and see live match count
- 📸 **Screenshot Highlight** — captures the page and highlights matched element in red
- 🏷️ **Filter by Tag** — Links, Buttons, Inputs, Forms, Tables, Images, Divs…
- 📤 **Export** — CSV, JSON, TXT
- 🕒 **Scan History** — recent scans on the homepage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Vanilla CSS |
| Backend | Node.js, Express 5, TypeScript |
| Scraping | Playwright (headless Chromium) |
| Fonts | Inter + JetBrains Mono |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/Lakshya1726/XPathPro.git
cd XPathPro
```

### 2. Start the Backend

```bash
cd backend
npm install
npx playwright install chromium
npm run start
# 🚀 API running at http://localhost:4000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# ✓ Ready at http://localhost:3000
```

### 4. Open the app

Navigate to **http://localhost:3000**, enter any URL (e.g. `https://google.com`), and click **Extract XPaths**.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/extract` | Extract all XPaths from a URL |
| `POST` | `/api/test-xpath` | Test an XPath against a live page |
| `POST` | `/api/screenshot` | Screenshot with element highlighted |
| `GET` | `/api/history` | Recent scan history |

### Extract Request

```json
POST /api/extract
{ "url": "https://google.com" }
```

### Extract Response

```json
{
  "url": "https://google.com",
  "totalElements": 156,
  "uniqueCount": 148,
  "multipleCount": 6,
  "entries": [
    {
      "tag": "a",
      "text": "Gmail",
      "id": "",
      "className": "gb_x",
      "bestXpath": "//a[contains(text(),'Gmail')]",
      "absoluteXpath": "/html/body/div[1]/div[1]/a[1]",
      "uniqueStatus": "unique",
      "matchCount": 1
    }
  ]
}
```

---

## Project Structure

```
XPathPro/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── types.ts              # Shared types
│   │   ├── routes/
│   │   │   ├── extract.ts        # POST /api/extract
│   │   │   ├── screenshot.ts     # POST /api/screenshot
│   │   │   ├── test-xpath.ts     # POST /api/test-xpath
│   │   │   └── history.ts        # GET/DELETE /api/history
│   │   └── services/
│   │       ├── browser.ts        # Playwright singleton
│   │       ├── xpath.ts          # 7-strategy XPath engine
│   │       └── history.ts        # In-memory history
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── globals.css           # Dark DevTools design system
    │   ├── layout.tsx
    │   ├── page.tsx              # Landing page
    │   └── results/page.tsx      # Results page
    ├── components/
    │   ├── XPathTable.tsx        # Searchable/sortable table
    │   ├── ElementInspector.tsx  # DevTools-style inspector
    │   ├── FilterBar.tsx         # Tag filter chips
    │   ├── XPathConsole.tsx      # Live XPath tester
    │   ├── StatsBar.tsx          # Animated stats
    │   └── ExportMenu.tsx        # CSV/JSON/TXT export
    └── lib/
        ├── api.ts                # API client
        ├── export.ts             # Export utilities
        └── types.ts              # TypeScript types
```

---

## License

MIT © [Lakshya1726](https://github.com/Lakshya1726)
