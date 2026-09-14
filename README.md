# Adding SUDEX AI to your site

Two pieces: the **widget** (drops into your HTML) and the **backend proxy**
(holds your API key and talks to Anthropic). You need both — the widget
alone has nothing to call.

## 1. Deploy the backend

```
cd server-example
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # from console.anthropic.com
node server.js
```

This runs locally on `http://localhost:3000/api/sudex-chat` for testing.
For your live site, deploy `server-example/` to any Node host — Render,
Railway, Fly.io, a VPS — and set `ANTHROPIC_API_KEY` as an environment
variable there (never commit it to code). In `server.js`, tighten the CORS
line from `origin: "*"` to your actual domain once it's live.

If you'd rather use serverless functions (Vercel/Netlify/Cloudflare
Workers) instead of a standalone server, the `/api/sudex-chat` handler
logic in `server.js` drops into any of those with minor adapting — say the
word if you want that version instead.

## 2. Add the widget to your HTML

In the page where you want the chat to appear:

```html
<div id="sudex-ai"></div>
<script
  src="sudex-widget.js"
  data-endpoint="https://your-backend-domain.com/api/sudex-chat"
></script>
```

- `data-endpoint` — the URL of your deployed backend from step 1.
- `data-mount` (optional) — set this if you want the widget in an element
  with a different id than `sudex-ai`.

That's it. The widget is self-contained (styles, fonts, and behavior all
load from the one script) and will render a full chat panel wherever the
`<div>` sits on the page.

## Files

- `sudex-widget.js` — the chat UI, vanilla JS, no build step.
- `server-example/server.js` — Express backend that proxies to Anthropic.
- `server-example/package.json` — its dependencies.

## Notes

- Chat history lives in memory only and resets on page refresh (no
  localStorage is used).
- Cost: each message is a real API call billed to your Anthropic account.
  Consider adding rate limiting or auth to the backend before going live
  publicly.
