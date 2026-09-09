# Vyapar Sathi

Demo-first rural business advisory and financial-planning web application for a hackathon presentation.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL shown by Vite (normally `http://localhost:5173`). Use **Judge Demo** on the landing screen for the full two-minute walkthrough.

## Build for deployment

```powershell
npm.cmd run build
npm.cmd run preview
```

The deployable static site is created in `dist/`. It can be uploaded to any static hosting service.

## Design notes

- The app is fully functional without an AI API key; its advisor is deterministic and rule-based.
- `VITE_AI_API_KEY` is intentionally not read by the browser implementation. Connect a real provider through a server-side proxy before production use.
- Local market values are intentionally labelled as demo estimates.
- Scheme information is structured in `src/data.ts` and sourced from the provided NSFDC official information. Verify official rules before use.
