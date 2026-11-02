# interactive-cosmic-login

A cinematic, interactive **cosmic login page**: a full 3D universe rendered with Three.js behind a floating login panel, with a Wikipedia-powered cosmic fun-fact card and a celestial destination navigator.

Built with Flask (Python) for serving + a live fact API, and vanilla ES modules / Three.js for the front-end.

## Features

- **3D universe background (Three.js)**
  - First visit: the Milky Way with Earth's solar system (all 8 planets, Earth's moon, Saturn/Uranus rings).
  - Later refreshes: a random scene — the Sol system or a procedurally generated fictional sector.
  - Drag to orbit, scroll to fly in/out (radius 7–12,000 units), click a planet to fly to it.
- **Celestial navigator** — searchable destination panel ("Andromeda", "Earth", "Sirius"…), with quick-destination chips, keyboard navigation, and fly-to on select.
- **Scene HUD** — displays the name and coordinates of the current randomly generated sector.
- **Cosmic fun-fact card** — tap the planet orb on the login panel to fetch a random celestial object (title, type, image, short fact) from the Wikipedia REST API via `/api/cosmic-fact`, with offline fallback facts.
- **Login panel** — minimize/restore, username + password form, "Continue with Gmail" button.
  - Currently **UI-only**: no authentication is performed. Dummy handlers are isolated in `bindLoginControls()` so the real Flask login can drop in without touching the UI.
- **Responsive + accessible** — `aria-live` HUD, tooltip roles, combobox/listbox semantics on the search, works on touch.

## Quick start

```bash
python3 app.py
# open http://localhost:5000/cosmic-login
```

- Port comes from the `PORT` env var (default `5000`); `debug=True` when run directly.
- No pip/npm install required — Three.js is loaded from the jsDelivr CDN via an import map.

## Routes

| Route             | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `/`               | Redirects to `/cosmic-login`                                       |
| `/cosmic-login`   | The cosmic login page (Jinja template, UI-only by default)         |
| `/api/cosmic-fact`| JSON: random celestial object `{title, type, extract, image, url, source}` fetched live from the Wikipedia REST API; falls back to built-in facts when offline or when Wikimedia has no thumbnail. |

## Plugging in real auth

`templates/login_cosmic.html` is already conditional. In `app.py`, render with:

```python
render_template(
    "login_cosmic.html",
    enable_real_auth=True,
    login_action_url="/login",          # real Flask POST route (with CSRF)
    google_login_url="/auth/google",    # Google OAuth start URL
)
```

This swaps the dummy form for a real POST (with `csrf_token()`) and the Gmail button for a link to your OAuth flow.

## Project structure

```
app.py                          # Flask app: page route + /api/cosmic-fact
templates/login_cosmic.html     # Page markup (Jinja, conditional real-auth)
static/css/cosmic-login.css     # Panel, HUD, search, fact-card styling
static/js/cosmic-login.js       # Three.js scene + all panel interactions
static/assets/icons/gmail.svg   # Gmail icon
more/3D-Earth-main.zip          # Reference material (3D Earth sample)
dist/                           # Build output copy
```

## How the fact API works

`/api/cosmic-fact` samples up to 4 random titles from a curated list of ~50 celestial objects (planets, moons, stars, galaxies, nebulae, exoplanets, etc.), requests the Wikipedia REST summary for each, and returns the first one with both an extract and a thumbnail. The thumbnail URL is rewritten to a sharper fixed width (960/500/330 px, bounded by the original image width) and the extract is trimmed to the last full sentence under 320 chars. If all lookups fail, one of three built-in fallback facts is returned.

## Notes

- The demo is intentionally UI-only: submitting the form or clicking "Continue with Gmail" just shows a demo message.
- Relative planet sizes/orbits are stylized (compressed) so the whole system stays visible on screen.
Interactive cosmic login screen with a React + Three.js frontend.

## What changed

- The login UI now lives in a Vite/React app under `src/`.
- The existing Three.js universe logic still powers the scene.
- The Flask app still provides the `/api/cosmic-fact` endpoint for the Wikipedia-backed fact card.

## Run it

```bash
npm install
npm run dev
```

If you want the backend fact endpoint available locally, run the Flask app in a second terminal as well:

```bash
python app.py
```

## Build

```bash
npm run build
```
