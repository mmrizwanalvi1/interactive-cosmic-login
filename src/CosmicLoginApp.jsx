import React, { useEffect } from "react";
import { initCosmicLogin } from "../static/js/cosmic-login.js";
import "../static/css/cosmic-login.css";
import gmailIcon from "../static/assets/icons/gmail.svg";

export default function CosmicLoginApp() {
  useEffect(() => {
    initCosmicLogin();
  }, []);

  return (
    <main className="cosmic-login-page" id="cosmicPage">
      <canvas
        className="universe-canvas"
        id="universeCanvas"
        aria-label="Animated 3D universe background"
        role="img"
      />

      <div
        className="cosmic-tooltip"
        id="cosmicTooltip"
        role="tooltip"
        aria-hidden="true"
      />

      <div className="scene-hud" id="sceneHud" aria-live="polite">
        <span className="scene-hud-label">Sector</span>
        <span className="scene-hud-name" id="sceneName" />
        <span className="scene-hud-coords" id="sceneCoords" />
      </div>

      <button
        className="nav-toggle"
        id="navToggle"
        type="button"
        aria-label="Show celestial navigator"
        title="Search destinations"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="currentColor"
          >
            i
          </text>
        </svg>
      </button>

      <div
        className="cosmic-search"
        id="cosmicSearch"
        aria-label="Celestial destination search"
        aria-hidden="true"
      >
        <div className="search-panel">
          <div className="search-kicker">Navigator</div>
          <div className="search-field">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M16.5 16.5 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              id="searchInput"
              placeholder="Andromeda, Earth, Sirius…"
              autoComplete="off"
              spellCheck="false"
              role="combobox"
              aria-expanded="false"
              aria-controls="searchResults"
              aria-label="Search celestial objects"
            />
          </div>
          <div className="quick-destinations" aria-label="Featured celestial destinations">
            <button type="button" data-search-target="Andromeda Galaxy">
              Andromeda
            </button>
            <button type="button" data-search-target="Milky Way">
              Milky Way
            </button>
            <button type="button" data-search-target="Earth">
              Earth
            </button>
          </div>
        </div>
        <ul className="search-results" id="searchResults" role="listbox" hidden />
      </div>

      <section className="login-panel" id="loginPanel" aria-label="Login">
        <button
          className="panel-minimize"
          id="minimizeLogin"
          type="button"
          aria-label="Hide login panel"
          title="Hide login panel"
        >
          &#8212;
        </button>

        <div className="login-brand">
          <button
            type="button"
            className="brand-orb"
            id="factToggle"
            aria-expanded="false"
            aria-controls="factCard"
            aria-label="Show a cosmic fun fact"
            title="Reveal a cosmic fun fact"
          />
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey</p>
          <p className="orb-hint" aria-hidden="true">
            tap the planet for a cosmic fact
          </p>
        </div>

        <aside
          className="fact-card is-loading"
          id="factCard"
          aria-label="Cosmic fun fact"
          aria-hidden="true"
        >
          <div className="fact-image-wrap">
            <img id="factImage" alt="" hidden />
            <span className="fact-badge" id="factBadge">
              Wikipedia
            </span>
          </div>
          <div className="fact-body">
            <h2 id="factTitle">Scanning deep space…</h2>
            <p className="fact-type" id="factType" />
            <p className="fact-text" id="factText" />
            <a
              className="fact-link"
              id="factLink"
              href="#"
              target="_blank"
              rel="noopener"
              hidden
            >
              Read more on Wikipedia →
            </a>
          </div>
        </aside>

        <form className="login-form" id="dummyLoginForm" noValidate>
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="primary-login-btn">
            Login
          </button>
        </form>

        <div className="divider" aria-hidden="true">
          <span>or</span>
        </div>

        <button type="button" className="gmail-login-btn" id="gmailLoginBtn">
          <img src={gmailIcon} alt="" width="20" height="20" />
          Continue with Gmail
        </button>

        <p className="demo-note" id="demoMessage" aria-live="polite">
          Cosmic interface demo
        </p>
      </section>

      <button className="restore-login-btn" id="restoreLoginBtn" type="button" hidden>
        <span className="restore-orb" aria-hidden="true" />
        Show Login
      </button>

      <p className="explore-hint" id="exploreHint" aria-hidden="true">
        Drag to orbit &nbsp;&middot;&nbsp; scroll to fly in / out
        &nbsp;&middot;&nbsp; click a planet to visit it
      </p>
    </main>
  );
}
