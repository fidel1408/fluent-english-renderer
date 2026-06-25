# Fluent English Renderer

A Node.js/TypeScript API that renders Fluent English lesson slides as 1280×720 PNG images.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check — returns plain text |
| GET | `/api/healthz` | Returns `{"status":"ok"}` |
| POST | `/api/render-slide` | Renders a slide, returns PNG |

## Local development

```bash
npm install
npm run dev
# Server starts on http://localhost:3000
```

Test it:

```bash
curl http://localhost:3000/api/healthz
# {"status":"ok"}

curl -X POST http://localhost:3000/api/render-slide \
  -H "Content-Type: application/json" \
  -d '{
    "main_title": "Get a Cart",
    "main_title_words": ["Get", "a", "Cart"],
    "main_title_ipa": ["/get/", "/ə/", "/kɑːrt/"],
    "background_image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1280",
    "layout_type": "story_4_bubbles",
    "speech_bubbles": [
      {
        "number": 1,
        "text": "Do you want a cart or a basket?",
        "words": ["Do", "you", "want", "a", "cart", "or", "a", "basket?"],
        "ipa": ["/du/", "/ju/", "/wɑːnt/", "/ə/", "/kɑːrt/", "/ɔːr/", "/ə/", "/ˈbæskɪt/"],
        "highlight_words": ["cart", "basket"],
        "position": "top-left"
      }
    ]
  }' --output slide.png
```

## Project structure

```
fluent-english-renderer/
├── src/
│   ├── index.ts              Entry point — starts Express server
│   ├── app.ts                Express app setup
│   ├── lib/
│   │   └── logger.ts         Pino logger
│   └── routes/
│       ├── index.ts          Route registry
│       ├── health.ts         GET /api/healthz
│       └── render-slide.ts   POST /api/render-slide (full renderer)
├── fluent_english_logo.png   Logo shown at top-left of every slide
├── package.json
├── tsconfig.json
└── .gitignore
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | — | Set to `production` to disable pretty logs |
| `LOG_LEVEL` | `info` | Pino log level |

## Build

```bash
npm run build   # compiles TypeScript → dist/
npm run start   # runs dist/index.js
```

---

## Deploy to Render.com

1. Push this folder to a **new GitHub repository** (just the `standalone/` contents, not the whole Replit monorepo).

2. Go to [render.com](https://render.com) → **New → Web Service**.

3. Connect your GitHub repo.

4. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | **Runtime** | Node |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm run start` |
   | **Instance Type** | Free (or Starter for always-on) |

5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`

6. Click **Create Web Service**.

7. Your API will be live at:
   ```
   https://YOUR-APP-NAME.onrender.com/api/render-slide
   ```

> **Note:** Free Render instances spin down after inactivity. Upgrade to Starter ($7/mo) for always-on uptime.

---

## Deploy to Railway

1. Push this folder to a **new GitHub repository**.

2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.

3. Select your repo. Railway auto-detects Node.js.

4. Railway will automatically:
   - Run `npm install && npm run build`
   - Run `npm run start`
   - Assign a public URL

5. Add an environment variable:
   - `NODE_ENV` = `production`

6. Your API will be live at:
   ```
   https://YOUR-APP-NAME.up.railway.app/api/render-slide
   ```

> Railway's free tier gives $5/month of compute — enough for light usage.

---

## Request format for POST /api/render-slide

```json
{
  "lesson_id": "001",
  "topic": "At the Supermarket",
  "slide_number": 2,
  "slide_type": "story",
  "main_title": "Get a Cart",
  "main_title_words": ["Get", "a", "Cart"],
  "main_title_ipa": ["/get/", "/ə/", "/kɑːrt/"],
  "background_image_url": "https://... or Google Drive sharing link",
  "layout_type": "story_4_bubbles",
  "speech_bubbles": [
    {
      "number": 1,
      "text": "Do you want a cart or a basket?",
      "words": ["Do", "you", "want", "a", "cart", "or", "a", "basket?"],
      "ipa": ["/du/", "/ju/", "/wɑːnt/", "/ə/", "/kɑːrt/", "/ɔːr/", "/ə/", "/ˈbæskɪt/"],
      "highlight_words": ["cart", "basket"],
      "position": "top-left"
    }
  ]
}
```

**Positions:** `top-left`, `top-right`, `bottom-left`, `bottom-right`

Returns: `image/png` — 1280×720 pixels

---

## Logo

Place `fluent_english_logo.png` in the project root (next to `package.json`).  
If the file is missing, the renderer gracefully falls back to plain text "Fluent English" — no crash.

## Google Drive background images

Sharing links like `https://drive.google.com/file/d/FILE_ID/view` are automatically converted to direct download URLs. No manual conversion needed.
