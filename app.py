"""Flask app serving the cosmic login UI preview.

The /cosmic-login route serves the React build when available, with a
fallback to the legacy Flask template for development.
When the real login is ready, pass enable_real_auth=True along with
login_action_url / google_login_url (see templates/login_cosmic.html).

/api/cosmic-fact returns a random celestial object (image + short fact)
pulled live from the Wikipedia REST API, with offline fallbacks.
"""

import json
import random
import re
from pathlib import Path
import urllib.parse
import urllib.request

from flask import Flask, abort, jsonify, render_template, send_from_directory

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

WIKI_OBJECTS = [
    # planets & moons
    "Jupiter", "Saturn", "Mars", "Neptune", "Uranus", "Venus",
    "Mercury (planet)", "Pluto", "Europa (moon)", "Titan (moon)",
    "Enceladus", "Io (moon)", "Ganymede (moon)", "Triton (moon)",
    # stars
    "Betelgeuse", "Sirius", "Vega", "Rigel", "Antares", "Polaris",
    "Aldebaran", "Proxima Centauri", "Alpha Centauri", "UY Scuti",
    # galaxies
    "Andromeda Galaxy", "Whirlpool Galaxy", "Sombrero Galaxy",
    "Pinwheel Galaxy", "Triangulum Galaxy", "Messier 87", "Milky Way",
    # nebulae & deep sky
    "Orion Nebula", "Crab Nebula", "Carina Nebula", "Helix Nebula",
    "Eagle Nebula", "Horsehead Nebula", "Ring Nebula", "Pillars of Creation",
    # exotic objects & events
    "Black hole", "Neutron star", "Pulsar", "Quasar", "Supernova",
    "Halley's Comet", "Olympus Mons", "Great Red Spot", "Rings of Saturn",
    # exoplanets
    "Kepler-452b", "TRAPPIST-1", "55 Cancri e", "HD 189733 b",
]

FALLBACK_FACTS = [
    {
        "title": "Betelgeuse",
        "type": "Red supergiant star",
        "extract": ("Betelgeuse is a red supergiant in Orion, roughly 760 times "
                    "wider than the Sun. If it sat at the centre of our solar "
                    "system, its surface would reach past the asteroid belt."),
        "image": None,
        "url": "https://en.wikipedia.org/wiki/Betelgeuse",
    },
    {
        "title": "Andromeda Galaxy",
        "type": "Spiral galaxy",
        "extract": ("The Andromeda Galaxy is the nearest major galaxy to the "
                    "Milky Way and is on a collision course with it — the two "
                    "are expected to merge in about 4.5 billion years."),
        "image": None,
        "url": "https://en.wikipedia.org/wiki/Andromeda_Galaxy",
    },
    {
        "title": "Neutron star",
        "type": "Stellar remnant",
        "extract": ("A neutron star packs more mass than the Sun into a sphere "
                    "about 20 km across. A single teaspoon of its material "
                    "would weigh around a billion tonnes on Earth."),
        "image": None,
        "url": "https://en.wikipedia.org/wiki/Neutron_star",
    },
]


def _trim_extract(text, limit=320):
    """Trim to the last full sentence under the limit."""
    if len(text) <= limit:
        return text
    cut = text[:limit]
    dot = cut.rfind(". ")
    return (cut[: dot + 1]) if dot > 80 else cut.rsplit(" ", 1)[0] + "…"


def _fetch_wiki_summary(title):
    slug = urllib.parse.quote(title.replace(" ", "_"))
    req = urllib.request.Request(
        f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}",
        headers={"User-Agent": "CosmicLoginDemo/1.0 (educational UI demo)"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.load(resp)


@app.route("/api/cosmic-fact")
def cosmic_fact():
    for title in random.sample(WIKI_OBJECTS, k=min(4, len(WIKI_OBJECTS))):
        try:
            data = _fetch_wiki_summary(title)
        except Exception:
            continue
        extract = data.get("extract")
        thumb = (data.get("thumbnail") or {}).get("source")
        if not extract or not thumb:
            continue
        # ask for a sharper thumbnail; Wikimedia only serves fixed widths,
        # and rejects widths larger than the original image
        image = thumb
        orig_width = (data.get("originalimage") or {}).get("width", 0)
        for width in (960, 500, 330):
            if width <= orig_width:
                image = re.sub(r"/(\d+)px-", f"/{width}px-", thumb)
                break
        return jsonify({
            "title": data.get("title", title),
            "type": (data.get("description") or "Celestial object").capitalize(),
            "extract": _trim_extract(extract),
            "image": image,
            "url": data.get("content_urls", {}).get("desktop", {}).get("page",
                   f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"),
            "source": "wikipedia",
        })
    fact = dict(random.choice(FALLBACK_FACTS))
    fact["source"] = "fallback"
    return jsonify(fact)


def _serve_frontend_index():
    index_path = DIST_DIR / "index.html"
    if index_path.exists():
        return send_from_directory(DIST_DIR, "index.html")
    return render_template(
        "login_cosmic.html",
        # Flip to True later and provide the two URLs below to plug in
        # the real Flask login + Google OAuth without touching the UI.
        enable_real_auth=False,
        login_action_url=None,
        google_login_url=None,
    )


@app.route("/assets/<path:filename>")
def frontend_assets(filename):
    asset_path = DIST_DIR / "assets" / filename
    if not asset_path.exists():
        abort(404)
    return send_from_directory(DIST_DIR / "assets", filename)


@app.route("/")
def index():
    return _serve_frontend_index()


@app.route("/cosmic-login")
def cosmic_login():
    return _serve_frontend_index()


if __name__ == "__main__":
    import os
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
