/* ==========================================================================
   Cosmic Login — 3D universe (Three.js) + panel interactions + fact card.

   Scene selection:
   - first ever visit  -> the Milky Way with Earth's solar system
   - later refreshes   -> a random scene (Sol system or a fictional sector)

   UI-only: no authentication logic lives here. Dummy form handlers are
   isolated in bindLoginControls() so the real Flask login can replace them.
   ========================================================================== */

import * as THREE from "three";

const CosmicLogin = {
  /* ------------------------------------------------------------------ */
  config: {
    camera: {
      fov: 55,
      near: 0.1,
      far: 40000,
      radius: 190, // starting distance from the system centre
      minRadius: 7, // close enough to fill the view with a planet
      maxRadius: 12000, // far beyond the galaxy, into the deep field
    },

    visitedKey: "cosmicLoginVisited",

    solScene: {
      kind: "sol",
      name: "Milky Way · Sol System",
      coords: "Orion Arm · 26,000 ly from core",
      starTint: "#d0ebff",
      nebulaColors: ["#5f3dc4", "#228be6", "#f06595"],
    },

    // stylised — relative sizes/orbits compressed so everything stays visible
    solSystem: [
      {
        name: "Mercury",
        type: "Rocky Planet",
        dist: "57.9 million km from Sun",
        orbit: 26,
        size: 1.7,
        palette: ["#d9d2c5", "#9a8f80", "#3a352e"],
      },
      {
        name: "Venus",
        type: "Rocky Planet",
        dist: "108.2 million km from Sun",
        orbit: 36,
        size: 2.7,
        palette: ["#ffe8b0", "#e3b04b", "#6b4a1b"],
      },
      {
        name: "Earth",
        type: "Our Home World",
        dist: "149.6 million km from Sun",
        orbit: 48,
        size: 2.9,
        terran: true,
        moon: true,
        palette: ["#a5d8ff", "#1864ab", "#0b3d2e"],
      },
      {
        name: "Mars",
        type: "Rocky Planet",
        dist: "227.9 million km from Sun",
        orbit: 60,
        size: 2.2,
        palette: ["#ffb38a", "#c1440e", "#4a1c06"],
      },
      {
        name: "Jupiter",
        type: "Gas Giant",
        dist: "778.5 million km from Sun",
        orbit: 88,
        size: 9.0,
        palette: ["#f3d9b1", "#c88b3a", "#5b3a1a"],
      },
      {
        name: "Saturn",
        type: "Gas Giant",
        dist: "1.43 billion km from Sun",
        orbit: 112,
        size: 7.6,
        ring: true,
        palette: ["#f7e7b6", "#d8b56a", "#6b5527"],
      },
      {
        name: "Uranus",
        type: "Ice Giant",
        dist: "2.87 billion km from Sun",
        orbit: 134,
        size: 4.6,
        ring: true,
        palette: ["#d0f4f7", "#7fd4dd", "#1d6a73"],
      },
      {
        name: "Neptune",
        type: "Ice Giant",
        dist: "4.5 billion km from Sun",
        orbit: 154,
        size: 4.4,
        palette: ["#9bb8ff", "#2e5cb8", "#122a66"],
      },
    ],

    fictionalScenes: [
      {
        kind: "fiction",
        name: "Purple Nebula",
        starTint: "#d0bfff",
        nebulaColors: ["#5f3dc4", "#f06595", "#228be6"],
        planetBias: "cool",
        sun: "#d0bfff",
      },
      {
        kind: "fiction",
        name: "Golden Dust Belt",
        starTint: "#ffe8cc",
        nebulaColors: ["#ff922b", "#ffd43b", "#845ef7"],
        planetBias: "warm",
        sun: "#ffd43b",
      },
      {
        kind: "fiction",
        name: "Blue Deep Field",
        starTint: "#d0ebff",
        nebulaColors: ["#1864ab", "#15aabf", "#364fc7"],
        planetBias: "icy",
        sun: "#a5d8ff",
      },
      {
        kind: "fiction",
        name: "Crimson Expanse",
        starTint: "#ffe3e3",
        nebulaColors: ["#c2255c", "#862e9c", "#0b7285"],
        planetBias: "volcanic",
        sun: "#ffa8a8",
      },
    ],

    planetNames: [
      "Aurelia",
      "Nyx-7",
      "Orion Prime",
      "Vespera",
      "Kepler-442b",
      "Eos",
      "Thalassa",
      "Nova Terra",
    ],

    planetTypes: {
      cool: ["Ice Giant", "Ocean World", "Twilight Terran"],
      warm: ["Gas Giant", "Desert World", "Amber Terran"],
      icy: ["Glacial World", "Ice Giant", "Frozen Dwarf"],
      volcanic: ["Volcanic World", "Molten Core", "Iron Dwarf"],
    },

    planetPalettes: {
      cool: [
        ["#a5d8ff", "#5f3dc4", "#0d1030"],
        ["#91a7ff", "#4263eb", "#101436"],
        ["#b197fc", "#7048e8", "#170f33"],
      ],
      warm: [
        ["#ffe066", "#ff922b", "#3b1502"],
        ["#ffc078", "#e8590c", "#2e0d02"],
        ["#ffd8a8", "#d9480f", "#33120a"],
      ],
      icy: [
        ["#e3fafc", "#15aabf", "#072a33"],
        ["#d0ebff", "#1864ab", "#06192e"],
        ["#c5f6fa", "#0b7285", "#04222a"],
      ],
      volcanic: [
        ["#ffc9c9", "#c2255c", "#2b0712"],
        ["#ff8787", "#e03131", "#300404"],
        ["#faa2c1", "#862e9c", "#1d0a26"],
      ],
    },

    starNames: [
      "Sirius",
      "Canopus",
      "Arcturus",
      "Vega",
      "Capella",
      "Rigel",
      "Procyon",
      "Betelgeuse",
      "Altair",
      "Aldebaran",
      "Antares",
      "Spica",
      "Pollux",
      "Fomalhaut",
    ],

    starFacts: {
      Sirius: ["Main Sequence Star", "8.6 light years"],
      Canopus: ["Bright Giant", "310 light years"],
      Arcturus: ["Red Giant", "36.7 light years"],
      Vega: ["Main Sequence Star", "25 light years"],
      Capella: ["Giant Star", "43 light years"],
      Rigel: ["Blue Supergiant", "860 light years"],
      Procyon: ["Subgiant", "11.5 light years"],
      Betelgeuse: ["Red Supergiant", "548 light years"],
      Altair: ["Main Sequence Star", "16.7 light years"],
      Aldebaran: ["Red Giant", "65 light years"],
      Antares: ["Red Supergiant", "550 light years"],
      Spica: ["Binary Star System", "250 light years"],
      Pollux: ["Red Giant", "34 light years"],
      Fomalhaut: ["Main Sequence Star", "25 light years"],
    },
  },

  /* ------------------------------------------------------------------ */
  state: {
    rng: Math.random,
    scene_: null, // active scene descriptor (solScene or a preset)
    isMobile: false,
    reducedMotion: false,
    factOpen: false,

    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    raycaster: null,
    pointerNDC: new THREE.Vector2(),
    hoverables: [],
    hovered: null,
    focusObj: null,
    starUniforms: null,
    planets: [],
    comets: [],
    nebulae: [],
    galaxies: [],
    belt: null,
    searchExtras: [],
    searchIndex: [],
    searchMatches: [],
    searchActive: 0,

    // camera rig (spherical orbit around lookTarget, all eased)
    theta: 0,
    thetaTarget: 0,
    phi: Math.PI / 2,
    phiTarget: Math.PI / 2,
    radius: 190,
    radiusTarget: 190,
    lookTarget: new THREE.Vector3(),
    lookGoal: new THREE.Vector3(),
    parallax: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },

    dragging: false,
    moved: 0,
    pointerOnCanvas: false,
    dragStart: { x: 0, y: 0, theta: 0, phi: 0 },

    demoTimer: null,
    el: {},
  },

  /* ------------------------------------------------------------------ */
  init() {
    const s = this.state;
    s.el = {
      page: document.getElementById("cosmicPage"),
      canvas: document.getElementById("universeCanvas"),
      tooltip: document.getElementById("cosmicTooltip"),
      panel: document.getElementById("loginPanel"),
      minimize: document.getElementById("minimizeLogin"),
      restore: document.getElementById("restoreLoginBtn"),
      form: document.getElementById("dummyLoginForm"),
      gmail: document.getElementById("gmailLoginBtn"),
      demoNote: document.getElementById("demoMessage"),
      sceneName: document.getElementById("sceneName"),
      sceneCoords: document.getElementById("sceneCoords"),
      factCard: document.getElementById("factCard"),
      factImage: document.getElementById("factImage"),
      factTitle: document.getElementById("factTitle"),
      factType: document.getElementById("factType"),
      factText: document.getElementById("factText"),
      factLink: document.getElementById("factLink"),
      factBadge: document.getElementById("factBadge"),
      factToggle: document.getElementById("factToggle"),
      navToggle: document.getElementById("navToggle"),
      search: document.getElementById("cosmicSearch"),
      searchInput: document.getElementById("searchInput"),
      searchResults: document.getElementById("searchResults"),
    };

    s.isMobile = window.matchMedia("(max-width: 768px)").matches;
    s.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    s.rng = this.makeRng(Date.now() + Math.random() * 1e6);
    s.scene_ = this.chooseScene();

    this.setupRenderer();
    this.buildUniverse();
    this.buildSearchIndex();
    this.styleBrandOrb();
    this.bindLoginControls();
    this.bindSearchToggle();
    this.bindUniverseInteraction();
    this.bindSearch();

    s.clock = new THREE.Clock();
    this.animate();
  },

  chooseScene() {
    const c = this.config;
    let visited = false;
    try {
      visited = localStorage.getItem(c.visitedKey) === "1";
      localStorage.setItem(c.visitedKey, "1");
    } catch (e) {
      /* storage blocked — always show home */
    }

    if (!visited) return c.solScene;
    // returning visitor: anywhere in the universe, home included
    return this.pick([c.solScene, ...c.fictionalScenes]);
  },

  /* ---------------------------------------------------------- helpers */
  makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  rand(min, max) {
    return min + this.state.rng() * (max - min);
  },
  pick(arr) {
    return arr[Math.floor(this.state.rng() * arr.length)];
  },

  randomDirection() {
    const u = this.rand(-1, 1);
    const t = this.rand(0, Math.PI * 2);
    const r = Math.sqrt(1 - u * u);
    return new THREE.Vector3(r * Math.cos(t), u, r * Math.sin(t));
  },

  /* ------------------------------------------------------ three setup */
  setupRenderer() {
    const s = this.state,
      c = this.config.camera;

    s.renderer = new THREE.WebGLRenderer({
      canvas: s.el.canvas,
      antialias: true,
      alpha: true,
    });
    s.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, s.isMobile ? 1.5 : 2),
    );
    s.renderer.setSize(window.innerWidth, window.innerHeight);
    s.renderer.outputColorSpace = THREE.SRGBColorSpace;

    s.scene = new THREE.Scene();
    s.scene.fog = new THREE.FogExp2(0x03040a, 0.00008);

    s.camera = new THREE.PerspectiveCamera(
      c.fov,
      window.innerWidth / window.innerHeight,
      c.near,
      c.far,
    );

    s.theta = s.thetaTarget = this.rand(0, Math.PI * 2);
    s.phi = s.phiTarget = this.rand(Math.PI * 0.34, Math.PI * 0.55);
    s.radius = s.radiusTarget = c.radius * this.rand(0.92, 1.1);

    s.raycaster = new THREE.Raycaster();

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        s.isMobile = window.matchMedia("(max-width: 768px)").matches;
        s.camera.aspect = window.innerWidth / window.innerHeight;
        s.camera.updateProjectionMatrix();
        s.renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    });
  },

  buildUniverse() {
    const s = this.state,
      scene = s.scene_;

    if (scene.kind === "sol") {
      this.createSun();
      this.createSolarSystem();
      this.createMilkyWay();
      this.createAndromeda();
      s.el.sceneCoords.textContent = scene.coords;
    } else {
      this.createFictionalLights(scene);
      this.createFictionalPlanets(scene);
      this.createFictionalGalaxy(scene);
      this.createAndromeda();
      const dec = Math.round(this.rand(-90, 90));
      s.el.sceneCoords.textContent =
        "RA " +
        this.rand(0, 24).toFixed(1) +
        "h · DEC " +
        (dec >= 0 ? "+" : "") +
        dec +
        "°";
    }

    this.createDeepField();
    this.createStarfield();
    this.createNamedStars();
    this.createNebula();
    if (!s.reducedMotion) this.createComets();

    s.el.sceneName.textContent = scene.name;
  },

  /* ---------------------------------------------------------- the Sun */
  createSun() {
    const s = this.state;

    // light radiates from the centre of the system
    s.scene.add(new THREE.PointLight(0xfff2cc, 3.2, 0, 0));
    s.scene.add(new THREE.AmbientLight(0x404a66, 0.45));

    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.makeGlowTexture("#fff7d6", "#ffd43b"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    core.scale.setScalar(42);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.makeGlowTexture("#ffd43b", "transparent"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      }),
    );
    halo.scale.setScalar(150);
    s.scene.add(core, halo);

    // invisible sphere so the Sun is hoverable / clickable
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(14, 16, 16),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    proxy.userData = {
      name: "Sun",
      type: "G-type Main Sequence Star",
      meta: "Distance: 0 km — you are here",
      kind: "star",
      focusDist: 130,
    };
    s.scene.add(proxy);
    s.hoverables.push(proxy);
  },

  createFictionalLights(scene) {
    const s = this.state;
    const sunDir = this.randomDirection().multiplyScalar(this.rand(260, 380));

    const key = new THREE.DirectionalLight(new THREE.Color(scene.sun), 2.6);
    key.position.copy(sunDir);
    s.scene.add(key);
    s.scene.add(new THREE.AmbientLight(0x404a66, 0.55));

    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunDir);
    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.makeGlowTexture("#ffffff", scene.sun),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    core.scale.setScalar(90);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.makeGlowTexture(scene.sun, "transparent"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      }),
    );
    halo.scale.setScalar(220);
    sunGroup.add(core, halo);
    s.scene.add(sunGroup);
  },

  /* --------------------------------------------------- the Sol system */
  createSolarSystem() {
    const s = this.state;

    this.config.solSystem.forEach((p) => {
      // faint orbit line in the ecliptic
      const segs = 128,
        pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit),
        );
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: 0xf8f9fa,
          transparent: true,
          opacity: 0.06,
        }),
      );
      s.scene.add(line);

      // pivot at the Sun; the planet group hangs off it at orbit distance
      const pivot = new THREE.Group();
      pivot.rotation.y = this.rand(0, Math.PI * 2);
      pivot.rotation.x = this.rand(-0.03, 0.03);
      s.scene.add(pivot);

      const group = new THREE.Group();
      group.position.set(p.orbit, 0, 0);
      pivot.add(group);

      const tex = p.terran
        ? this.makeTerranTexture()
        : this.makePlanetTexture(p.palette);
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 48, 48),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.92,
          metalness: 0.05,
          bumpMap: tex,
          bumpScale: 0.3,
        }),
      );
      body.rotation.z = this.rand(-0.35, 0.35);
      body.userData = {
        name: p.name,
        type: p.type,
        meta: "Distance: " + p.dist,
        kind: "planet",
        focusDist: p.size * 5 + 4,
      };
      group.add(body);

      group.add(
        this.makeAtmosphere(p.size, p.palette[0], p.terran ? 0.95 : 0.8),
      );

      if (p.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(p.size * 1.5, p.size * 2.5, 96),
          new THREE.MeshBasicMaterial({
            map: this.makeRingTexture(p.palette[0]),
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            opacity: 0.85,
          }),
        );
        ring.rotation.x = Math.PI / 2 + this.rand(-0.3, 0.3);
        group.add(ring);
      }

      let moonPivot = null;
      const subPivots = [];
      if (p.moon) {
        moonPivot = new THREE.Group();
        moonPivot.rotation.x = 0.15;
        group.add(moonPivot);
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(0.75, 24, 24),
          new THREE.MeshStandardMaterial({
            map: this.makePlanetTexture(["#e9ecef", "#adb5bd", "#343a40"]),
            roughness: 1,
            metalness: 0,
          }),
        );
        moon.position.set(p.size + 2.6, 0, 0);
        moon.userData = {
          name: "Moon",
          type: "Earth's Natural Satellite",
          meta: "Distance: 384,400 km from Earth",
          kind: "planet",
          focusDist: 9,
        };
        moonPivot.add(moon);
        s.hoverables.push(moon);

        // playful hypothetical submoons circling the Moon
        [
          { name: "Luna Minor", size: 0.26, orbit: 1.7, speed: 1.4, tilt: 0.4 },
          { name: "Selene", size: 0.18, orbit: 2.3, speed: 0.9, tilt: -0.3 },
        ].forEach((sm) => {
          const subPivot = new THREE.Group();
          subPivot.position.copy(moon.position);
          subPivot.rotation.x = sm.tilt;
          subPivot.rotation.y = this.rand(0, Math.PI * 2);
          moonPivot.add(subPivot);
          const sub = new THREE.Mesh(
            new THREE.SphereGeometry(sm.size, 16, 16),
            new THREE.MeshStandardMaterial({
              map: this.makePlanetTexture(["#ced4da", "#868e96", "#212529"]),
              roughness: 1,
              metalness: 0,
            }),
          );
          sub.position.set(sm.orbit, 0, 0);
          sub.userData = {
            name: sm.name,
            type: "Hypothetical Submoon",
            meta: "The real Moon has no submoons — artistic license",
            kind: "planet",
            focusDist: 5,
          };
          subPivot.add(sub);
          s.hoverables.push(sub);
          subPivots.push({ pivot: subPivot, speed: sm.speed });
        });
      }

      s.hoverables.push(body);
      s.planets.push({
        pivot,
        body,
        moonPivot,
        subPivots,
        bob: null,
        // gentle Kepler-flavoured speeds: inner planets orbit faster
        orbitSpeed: 0.5 / Math.pow(p.orbit, 0.95),
        spin: this.rand(0.04, 0.1),
      });
    });

    // asteroid belt between Mars and Jupiter
    const beltCount = s.isMobile ? 350 : 700;
    const pos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i++) {
      const a = this.rand(0, Math.PI * 2);
      const r = this.rand(68, 78);
      pos.set([Math.cos(a) * r, this.rand(-1.6, 1.6), Math.sin(a) * r], i * 3);
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const belt = new THREE.Points(
      beltGeo,
      new THREE.PointsMaterial({
        size: 1.1,
        map: this.makeStarSpriteTexture(),
        color: 0xbfae9c,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    s.scene.add(belt);
    s.belt = belt;
  },

  /* ------------------------------------------------ fictional planets */
  createFictionalPlanets(scene) {
    const s = this.state,
      c = this.config;
    const count = Math.round(this.rand(3, 5));
    const names = c.planetNames
      .slice()
      .sort(() => s.rng() - 0.5)
      .slice(0, count);
    const palettes = c.planetPalettes[scene.planetBias];
    const types = c.planetTypes[scene.planetBias];

    names.forEach((name, i) => {
      const size = this.rand(4, 11);
      const palette = this.pick(palettes);
      const type = this.pick(types);
      const sector =
        String.fromCharCode(65 + Math.floor(s.rng() * 26)) +
        String.fromCharCode(65 + Math.floor(s.rng() * 26)) +
        "-" +
        Math.floor(this.rand(10, 99));

      const group = new THREE.Group();
      const angle = (i / count) * Math.PI * 2 + this.rand(-0.5, 0.5);
      const dist = this.rand(45, 160);
      group.position.set(
        Math.cos(angle) * dist,
        this.rand(-38, 38),
        Math.sin(angle) * dist,
      );

      const tex = this.makePlanetTexture(palette);
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(size, 48, 48),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.92,
          metalness: 0.05,
          bumpMap: tex,
          bumpScale: 0.35,
        }),
      );
      body.rotation.z = this.rand(-0.4, 0.4);
      body.userData = {
        name,
        type,
        meta: "Synthetic sector: " + sector,
        kind: "planet",
        focusDist: size * 5 + 4,
      };
      group.add(body);

      group.add(this.makeAtmosphere(size, palette[0], 0.85));

      if (s.rng() < 0.5) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.5, size * 2.6, 96),
          new THREE.MeshBasicMaterial({
            map: this.makeRingTexture(palette[0]),
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            opacity: 0.85,
          }),
        );
        ring.rotation.x = Math.PI / 2 + this.rand(-0.35, 0.35);
        ring.rotation.y = this.rand(-0.3, 0.3);
        group.add(ring);
      }

      s.scene.add(group);
      s.hoverables.push(body);
      s.planets.push({
        pivot: group,
        body,
        moonPivot: null,
        orbitSpeed: 0,
        spin: this.rand(0.03, 0.12) * (s.rng() < 0.5 ? 1 : -1),
        bob: {
          group,
          amp: this.rand(1, 3),
          phase: this.rand(0, Math.PI * 2),
          baseY: group.position.y,
        },
      });
    });
  },

  makeAtmosphere(radius, color, strength) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.12, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uStrength: { value: strength },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDir = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uStrength;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.6);
            gl_FragColor = vec4(uColor, fres * uStrength);
          }`,
      }),
    );
  },

  /* ------------------------------------------------------ the Milky Way */
  createMilkyWay() {
    const s = this.state;
    const count = s.isMobile ? 4500 : 9500;
    const radius = 1750;

    const group = this.makeGalaxyPointCloud({
      count,
      radius,
      branches: 4,
      spin: 1.25,
      coreColor: "#ffe3bf",
      armColorA: "#d0ebff",
      armColorB: "#b197fc",
      pointSize: 7,
      discOpacity: 0.16,
      bulgeScale: 780,
    });

    // position the disc so the Sol system sits inside an outer arm —
    // zooming out reveals we live in the Milky Way
    group.position.set(-1150, -140, 620);
    group.rotation.set(-0.32, this.rand(0, Math.PI * 2), 0.16);
    s.scene.add(group);
    s.galaxies.push({ group, speed: 0.0035 });

    // searchable (but not hoverable — it fills half the sky) home galaxy
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(1, 4, 4),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    proxy.userData = {
      name: "Milky Way",
      type: "Barred Spiral Galaxy",
      meta: "Our home galaxy — 100,000 light years across",
      kind: "galaxy",
      focusDist: 3000,
    };
    group.add(proxy);
    s.searchExtras.push(proxy);
  },

  /* --------------------------------------------- the Andromeda Galaxy */
  createAndromeda() {
    const s = this.state;
    const count = s.isMobile ? 4600 : 10800;
    const radius = 1080;
    const branches = 2; // M31's tightly-wound two-arm structure
    const spin = 1.9;

    const core = new THREE.Color("#ffb38a"); // warm reddish bulge
    const arms = new THREE.Color("#9ec5ff"); // young blue arm stars

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = Math.pow(s.rng(), 1.4) * radius;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const curl = (r / radius) * spin * Math.PI * 2 * 0.55;
      const spread = 1 - (r / radius) * 0.72;
      const rx = (s.rng() - 0.5) * spread * radius * 0.08;
      const ry = (s.rng() - 0.5) * spread * radius * 0.02;
      const rz = (s.rng() - 0.5) * spread * radius * 0.08;
      pos.set(
        [
          Math.cos(branch + curl) * r + rx,
          ry,
          Math.sin(branch + curl) * r + rz,
        ],
        i * 3,
      );
      // reddish core -> bluish arms gradient
      const t = Math.min(1, (r / radius) * 1.5);
      const c = core.clone().lerp(arms, t);
      c.multiplyScalar(this.rand(0.45, 1));
      col.set([c.r, c.g, c.b], i * 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 5.2,
        map: this.makeStarSpriteTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        fog: false,
      }),
    );
    points.renderOrder = 1;

    const group = new THREE.Group();
    group.add(points);

    const dustVeil = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2.25, radius * 2.25),
      new THREE.MeshBasicMaterial({
        map: this.makeAndromedaDustTexture(),
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    dustVeil.rotation.x = -Math.PI / 2;
    dustVeil.renderOrder = 5;
    group.add(dustVeil);

    // smoky, clumped dust lanes tracing the spiral, slightly inside the arms
    const dustCount = s.isMobile ? 2100 : 5200;
    const dpos = new Float32Array(dustCount * 3);
    const dcol = new Float32Array(dustCount * 3);
    const dustInner = new THREE.Color("#1d0f0b");
    const dustOuter = new THREE.Color("#8a4c32");
    for (let i = 0; i < dustCount; i++) {
      const r = (0.16 + Math.pow(s.rng(), 1.16) * 0.78) * radius;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const lane = i % 4;
      const laneOffset = [-0.18, -0.08, 0.08, 0.18][lane];
      const curl = (r / radius) * spin * Math.PI * 2 * 0.55 + laneOffset;
      const midLane = 1 - Math.abs(r / radius - 0.52) * 1.6;
      const spread = Math.max(0.26, 1 - (r / radius) * 0.58);
      dpos.set(
        [
          Math.cos(branch + curl) * r +
            (s.rng() - 0.5) * radius * 0.045 * spread,
          (s.rng() - 0.5) * 18,
          Math.sin(branch + curl) * r +
            (s.rng() - 0.5) * radius * 0.045 * spread,
        ],
        i * 3,
      );
      const dc = dustInner.clone().lerp(dustOuter, Math.max(0, midLane));
      dc.multiplyScalar(this.rand(0.52, 0.95));
      dcol.set([dc.r, dc.g, dc.b], i * 3);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dcol, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        size: 19,
        map: this.makeDustSpriteTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: true,
        fog: false,
      }),
    );
    dust.renderOrder = 6;
    group.add(dust);

    const fineDustCount = s.isMobile ? 1300 : 3200;
    const fpos = new Float32Array(fineDustCount * 3);
    for (let i = 0; i < fineDustCount; i++) {
      const r = (0.24 + Math.pow(s.rng(), 0.95) * 0.7) * radius;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const curl =
        (r / radius) * spin * Math.PI * 2 * 0.55 + this.rand(-0.24, 0.24);
      fpos.set(
        [
          Math.cos(branch + curl) * r + (s.rng() - 0.5) * radius * 0.16,
          (s.rng() - 0.5) * 24,
          Math.sin(branch + curl) * r + (s.rng() - 0.5) * radius * 0.16,
        ],
        i * 3,
      );
    }
    const fineDustGeo = new THREE.BufferGeometry();
    fineDustGeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
    const fineDust = new THREE.Points(
      fineDustGeo,
      new THREE.PointsMaterial({
        size: 5.8,
        map: this.makeDustSpriteTexture(),
        color: 0x5f3526,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: true,
        fog: false,
      }),
    );
    fineDust.renderOrder = 7;
    group.add(fineDust);

    // glowing reddish core + soft bluish disc
    const bulge = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.makeGlowTexture("#ffd0a8", "transparent"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.82,
        fog: false,
      }),
    );
    bulge.scale.setScalar(470);
    bulge.renderOrder = 2;
    group.add(bulge);

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.94, 80),
      new THREE.MeshBasicMaterial({
        map: this.makeGlowTexture("#9ec5ff", "transparent"),
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.renderOrder = 0;
    group.add(disc);

    // invisible proxy so Andromeda is hoverable / clickable
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.55, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    proxy.userData = {
      name: "Andromeda Galaxy",
      type: "Spiral Galaxy (M31)",
      meta: "Distance: 2.5 million light years",
      kind: "galaxy",
      focusDist: 2150,
      view: { theta: -0.72, phi: 1.02, radius: 2150, mobileRadius: 2650 },
    };
    group.add(proxy);
    s.hoverables.push(proxy);

    group.position.set(5200, 1400, -5600);
    group.rotation.set(-0.9, 0.5, 0.35); // the famous near-edge-on tilt
    s.scene.add(group);
    s.galaxies.push({ group, speed: 0.0016 });
  },

  createFictionalGalaxy(scene) {
    const s = this.state;
    const group = this.makeGalaxyPointCloud({
      count: s.isMobile ? 2200 : 4500,
      radius: this.rand(70, 110),
      branches: 3 + Math.floor(this.rand(0, 3)),
      spin: this.rand(0.9, 1.6) * (s.rng() < 0.5 ? 1 : -1),
      coreColor: this.pick(scene.nebulaColors),
      armColorA: "#f8f9fa",
      armColorB: this.pick(scene.nebulaColors),
      pointSize: 1.6,
      discOpacity: 0,
      bulgeScale: 0,
    });
    group.position.copy(
      this.randomDirection().multiplyScalar(this.rand(230, 380)),
    );
    group.rotation.set(
      this.rand(0, Math.PI),
      this.rand(0, Math.PI),
      this.rand(-0.4, 0.4),
    );
    s.scene.add(group);
    s.galaxies.push({ group, speed: this.rand(0.008, 0.02) });
  },

  makeGalaxyPointCloud(opts) {
    const s = this.state;
    const inner = new THREE.Color(opts.coreColor);
    const armA = new THREE.Color(opts.armColorA);
    const armB = new THREE.Color(opts.armColorB);

    const pos = new Float32Array(opts.count * 3);
    const col = new Float32Array(opts.count * 3);

    for (let i = 0; i < opts.count; i++) {
      const r = Math.pow(s.rng(), 1.45) * opts.radius;
      const branch = ((i % opts.branches) / opts.branches) * Math.PI * 2;
      const curl = (r / opts.radius) * opts.spin * Math.PI * 2 * 0.55;
      const spread = 1 - (r / opts.radius) * 0.7;
      const rx = (s.rng() - 0.5) * spread * opts.radius * 0.075;
      const ry = (s.rng() - 0.5) * spread * opts.radius * 0.024;
      const rz = (s.rng() - 0.5) * spread * opts.radius * 0.075;
      pos.set(
        [
          Math.cos(branch + curl) * r + rx,
          ry,
          Math.sin(branch + curl) * r + rz,
        ],
        i * 3,
      );
      const t = r / opts.radius;
      const c = inner
        .clone()
        .lerp(s.rng() < 0.85 ? armA : armB, Math.min(1, t * 1.4));
      c.multiplyScalar(this.rand(0.5, 1));
      col.set([c.r, c.g, c.b], i * 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: opts.pointSize,
        map: this.makeStarSpriteTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        fog: false,
      }),
    );

    const group = new THREE.Group();
    group.add(points);

    if (opts.discOpacity > 0) {
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(opts.radius * 0.92, 64),
        new THREE.MeshBasicMaterial({
          map: this.makeGlowTexture("#9bb0d9", "transparent"),
          transparent: true,
          opacity: opts.discOpacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          fog: false,
        }),
      );
      disc.rotation.x = -Math.PI / 2;
      group.add(disc);
    }

    if (opts.bulgeScale > 0) {
      const bulge = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.makeGlowTexture("#ffe8cc", "transparent"),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.75,
          fog: false,
        }),
      );
      bulge.scale.setScalar(opts.bulgeScale);
      group.add(bulge);
    }

    return group;
  },

  /* ----------------------------------- deep field: distant galaxies */
  createDeepField() {
    const s = this.state;
    const count = s.isMobile ? 28 : 60;
    const spiralTexs = [
      this.makeDistantGalaxyTexture("#d0ebff"),
      this.makeDistantGalaxyTexture("#ffe8cc"),
      this.makeDistantGalaxyTexture("#e5dbff"),
    ];
    const tints = ["#f8f9fa", "#ffd8a8", "#a5d8ff", "#d0bfff", "#ffc9c9"];

    for (let i = 0; i < count; i++) {
      const isSpiral = s.rng() < 0.6;
      const tint = this.pick(tints);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: isSpiral
            ? this.pick(spiralTexs)
            : this.makeGlowTexture(tint, "transparent"),
          color: new THREE.Color(tint),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: this.rand(0.25, 0.7),
          rotation: this.rand(0, Math.PI * 2),
          fog: false,
        }),
      );
      sprite.position.copy(
        this.randomDirection().multiplyScalar(this.rand(4500, 11000)),
      );
      const sc = this.rand(120, 520);
      sprite.scale.set(
        sc,
        sc * (isSpiral ? this.rand(0.35, 1) : this.rand(0.55, 1)),
        1,
      );
      s.scene.add(sprite);
    }
  },

  makeDistantGalaxyTexture(armColor) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d");

    // soft core
    const core = ctx.createRadialGradient(64, 64, 0, 64, 64, 22);
    core.addColorStop(0, "rgba(255,244,222,0.9)");
    core.addColorStop(1, "rgba(255,244,222,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, 128, 128);

    // two spiral arms as fading dabs along a curl
    ctx.fillStyle = armColor;
    for (let arm = 0; arm < 2; arm++) {
      const phase = arm * Math.PI;
      for (let i = 0; i < 46; i++) {
        const t = (i / 46) * 2.4 * Math.PI;
        const r = 5 + t * 7.5;
        const x = 64 + r * Math.cos(t + phase);
        const y = 64 + r * Math.sin(t + phase) * 0.62;
        ctx.globalAlpha = 0.32 * (1 - i / 52);
        ctx.beginPath();
        ctx.arc(x, y, 2.6 * (1 - i / 70), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  /* --------------------------------------------------------- textures */
  makeGlowTexture(innerColor, outerColor) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(
      0,
      innerColor === "transparent" ? "rgba(255,255,255,0)" : innerColor,
    );
    g.addColorStop(
      0.25,
      innerColor === "transparent" ? "rgba(255,255,255,0)" : innerColor,
    );
    if (outerColor !== "transparent") g.addColorStop(0.5, outerColor);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  makeDustSpriteTexture() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 96;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, "rgba(21,10,7,0.9)");
    g.addColorStop(0.36, "rgba(42,20,13,0.62)");
    g.addColorStop(0.72, "rgba(75,40,26,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);

    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 34; i++) {
      ctx.globalAlpha = this.rand(0.05, 0.16);
      ctx.beginPath();
      ctx.arc(
        this.rand(8, 88),
        this.rand(8, 88),
        this.rand(2, 9),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  makeAndromedaDustTexture() {
    const size = 768;
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d");
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    ctx.shadowBlur = 0;
    for (let i = 0; i < 920; i++) {
      const angle = this.rand(0, Math.PI * 2);
      const r = Math.pow(this.rand(0, 1), 0.64) * 360;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.42;
      const fade = 1 - Math.min(1, r / 390);
      ctx.globalAlpha = this.rand(0.015, 0.09) * fade;
      ctx.fillStyle = this.rand(0, 1) < 0.7 ? "#21100a" : "#7a452e";
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        this.rand(1.5, 10),
        this.rand(0.8, 4),
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  makeStarSpriteTexture() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  },

  makePlanetTexture(palette) {
    const [hi, mid, dark] = palette;
    const W = 512,
      H = 256;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");

    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, dark);
    base.addColorStop(0.28, mid);
    base.addColorStop(0.55, hi);
    base.addColorStop(0.78, mid);
    base.addColorStop(1, dark);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    const bands = 7 + Math.floor(this.rand(0, 9));
    for (let b = 0; b < bands; b++) {
      const y = this.rand(0, H);
      const h = this.rand(4, 26);
      const amp = this.rand(2, 9);
      const freq = this.rand(1.5, 4.5);
      const phase = this.rand(0, Math.PI * 2);
      ctx.fillStyle = this.state.rng() < 0.5 ? hi : dark;
      ctx.globalAlpha = this.rand(0.05, 0.22);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const yy = y + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      for (let x = W; x >= 0; x -= 8) {
        const yy =
          y + h + Math.sin((x / W) * Math.PI * 2 * freq + phase + 0.6) * amp;
        ctx.lineTo(x, yy);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    const spots = 2 + Math.floor(this.rand(0, 4));
    for (let i = 0; i < spots; i++) {
      const x = this.rand(0, W),
        y = this.rand(H * 0.2, H * 0.8);
      const r = this.rand(8, 26);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hi);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = this.rand(0.12, 0.3);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = this.state.rng() < 0.5 ? "#000" : "#fff";
      ctx.fillRect(this.rand(0, W), this.rand(0, H), 1.4, 1.4);
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  },

  makeTerranTexture() {
    const W = 512,
      H = 256;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");

    // deep ocean base
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, "#0b3d6b");
    base.addColorStop(0.5, "#1864ab");
    base.addColorStop(1, "#0b3d6b");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // continents: clusters of irregular blobs
    const continents = 6 + Math.floor(this.rand(0, 4));
    for (let i = 0; i < continents; i++) {
      const cx = this.rand(0, W),
        cy = this.rand(H * 0.18, H * 0.82);
      const blobs = 8 + Math.floor(this.rand(0, 10));
      for (let b = 0; b < blobs; b++) {
        const x = cx + this.rand(-46, 46);
        const y = cy + this.rand(-26, 26);
        const r = this.rand(6, 22);
        ctx.fillStyle = this.state.rng() < 0.7 ? "#2b8a3e" : "#a98146";
        ctx.globalAlpha = this.rand(0.5, 0.9);
        ctx.beginPath();
        ctx.ellipse(
          x,
          y,
          r * this.rand(1, 1.8),
          r,
          this.rand(0, Math.PI),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // polar ice caps
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#f1f3f5";
    ctx.fillRect(0, 0, W, 14);
    ctx.fillRect(0, H - 14, W, 14);

    // soft cloud streaks
    for (let i = 0; i < 26; i++) {
      const x = this.rand(0, W),
        y = this.rand(0, H);
      const r = this.rand(10, 34);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = this.rand(0.2, 0.5);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        r * 2.2,
        r * 0.55,
        this.rand(-0.3, 0.3),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  },

  makeRingTexture(color) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d");
    for (let r = 70; r < 128; r += 2) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = this.rand(0.02, 0.5) * (1 - (r - 70) / 80);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    return new THREE.CanvasTexture(cv);
  },

  /* -------------------------------------------------------- starfield */
  createStarfield() {
    const s = this.state;
    const count = s.isMobile ? 1800 : 3800;
    const tint = new THREE.Color(s.scene_.starTint);

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const dir = this.randomDirection().multiplyScalar(this.rand(500, 4800));
      pos.set([dir.x, dir.y, dir.z], i * 3);
      const c = new THREE.Color(0xffffff).lerp(tint, this.rand(0, 0.8));
      c.multiplyScalar(this.rand(0.5, 1));
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = this.rand(1.4, 5);
      phase[i] = this.rand(0, Math.PI * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

    s.starUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: s.starUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = 0.72 + 0.42 * sin(uTime * 1.7 + aPhase);
          gl_PointSize = aSize * tw * uPixelRatio * (520.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          float a = pow(smoothstep(0.5, 0.0, d), 1.7);
          gl_FragColor = vec4(vColor, a);
        }`,
    });

    s.scene.add(new THREE.Points(geo, mat));
  },

  createNamedStars() {
    const s = this.state,
      c = this.config;
    const count = Math.round(this.rand(10, c.starNames.length));
    const names = c.starNames
      .slice()
      .sort(() => s.rng() - 0.5)
      .slice(0, count);
    const tints = ["#ffffff", "#d0ebff", "#fff3bf", "#ffe3e3", "#e5dbff"];

    names.forEach((name) => {
      const [type, distance] = c.starFacts[name];
      const tint = this.pick(tints);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.makeGlowTexture("#ffffff", tint),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      );
      sprite.position.copy(
        this.randomDirection().multiplyScalar(this.rand(280, 900)),
      );
      sprite.scale.setScalar(this.rand(9, 18));
      sprite.userData = {
        name,
        type,
        meta: "Distance: " + distance,
        kind: "star",
        focusDist: 90,
      };
      s.scene.add(sprite);
      s.hoverables.push(sprite);
    });
  },

  /* ----------------------------------------------------------- nebula */
  createNebula() {
    const s = this.state;
    const count = s.isMobile ? 6 : 12;

    for (let i = 0; i < count; i++) {
      const color = this.pick(s.scene_.nebulaColors);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.makeGlowTexture(color, "transparent"),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: this.rand(0.03, 0.1),
          rotation: this.rand(0, Math.PI * 2),
        }),
      );
      sprite.position.copy(
        this.randomDirection().multiplyScalar(this.rand(550, 1100)),
      );
      sprite.scale.setScalar(this.rand(220, 620));
      s.scene.add(sprite);
      s.nebulae.push({
        sprite,
        drift: this.rand(0.002, 0.01) * (s.rng() < 0.5 ? 1 : -1),
      });
    }
  },

  /* ----------------------------------------------------------- comets */
  createComets() {
    const s = this.state;
    const count = Math.round(this.rand(4, 8));
    const headTex = this.makeStarSpriteTexture();

    for (let i = 0; i < count; i++) {
      const dir = this.randomDirection();
      const start = this.randomDirection().multiplyScalar(this.rand(200, 420));
      const length = this.rand(400, 760);

      const head = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: headTex,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      );
      head.scale.setScalar(3.4);

      const trailGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
      const trail = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({
          color: 0xf8f9fa,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

      s.scene.add(head, trail);
      s.comets.push({
        head,
        trail,
        dir,
        start,
        length,
        speed: this.rand(40, 110),
        offset: this.rand(0, length),
        tail: this.rand(18, 40),
      });
    }
  },

  /* ------------------------------------------------------- brand orb */
  styleBrandOrb() {
    const s = this.state,
      orb = s.el.factToggle;
    if (!orb) return;

    let palette, hasRing;
    if (s.scene_.kind === "sol") {
      const planet = this.pick(this.config.solSystem);
      palette = planet.palette;
      hasRing = !!planet.ring;
    } else {
      palette = this.pick(this.config.planetPalettes[s.scene_.planetBias]);
      hasRing = s.rng() < 0.5;
    }

    const [hi, mid, dark] = palette;
    orb.style.background = `radial-gradient(circle at 32% 28%, ${hi} 0%, ${mid} 45%, ${dark} 100%)`;
    orb.style.boxShadow = `0 0 24px ${mid}cc, 0 0 64px ${mid}55, inset -6px -8px 16px rgba(0, 0, 0, 0.45)`;
    if (hasRing) orb.classList.add("has-ring");
  },

  toggleFactCard(open) {
    const s = this.state;
    s.factOpen = open === undefined ? !s.factOpen : open;
    s.el.factCard.classList.toggle("is-open", s.factOpen);
    s.el.factCard.setAttribute("aria-hidden", s.factOpen ? "false" : "true");
    s.el.factToggle.setAttribute(
      "aria-expanded",
      s.factOpen ? "true" : "false",
    );
    s.el.panel.classList.toggle("fact-open", s.factOpen);
    if (s.factOpen) this.loadCosmicFact();
  },

  /* ----------------------------------------------------- login controls */
  bindLoginControls() {
    const s = this.state;

    if (s.el.factToggle) {
      s.el.factToggle.addEventListener("click", () => this.toggleFactCard());
    }

    if (s.el.form) {
      s.el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.showDemoMessage(
          "Demo only — real Flask login can be connected later.",
        );
      });
    }
    if (s.el.gmail) {
      s.el.gmail.addEventListener("click", () => {
        this.showDemoMessage(
          "Gmail login placeholder — OAuth not connected yet.",
        );
      });
    }
    s.el.minimize.addEventListener("click", () => this.setPanelHidden(true));
    s.el.restore.addEventListener("click", () => this.setPanelHidden(false));
  },

  setPanelHidden(hidden) {
    const s = this.state;
    s.el.panel.classList.toggle("is-hidden", hidden);
    s.el.panel.setAttribute("aria-hidden", hidden ? "true" : "false");
    s.el.restore.hidden = !hidden;
    s.el.page.classList.toggle("explore-mode", hidden);

    if (hidden) {
      s.el.restore.focus();
    } else {
      // glide home; refresh the fact if the card is open
      s.focusObj = null;
      s.lookGoal.set(0, 0, 0);
      s.radiusTarget = this.config.camera.radius;
      s.el.minimize.focus();
      if (s.factOpen) this.loadCosmicFact();
    }
  },

  showDemoMessage(text) {
    const note = this.state.el.demoNote;
    if (!note) return;
    clearTimeout(this.state.demoTimer);
    note.textContent = text;
    note.classList.remove("is-flash");
    void note.offsetWidth;
    note.classList.add("is-flash");
    this.state.demoTimer = setTimeout(() => {
      note.textContent = "Cosmic interface demo";
      note.classList.remove("is-flash");
    }, 4000);
  },

  /* ----------------------------------------------------- fact card */
  async loadCosmicFact() {
    const el = this.state.el;
    el.factCard.classList.add("is-loading");
    el.factTitle.textContent = "Scanning deep space…";
    el.factType.textContent = "";
    el.factText.textContent = "";
    el.factLink.hidden = true;
    el.factImage.hidden = true;

    try {
      const resp = await fetch("/api/cosmic-fact", { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const fact = await resp.json();

      el.factTitle.textContent = fact.title;
      el.factType.textContent = fact.type || "";
      el.factText.textContent = fact.extract;
      el.factLink.href = fact.url;
      el.factLink.hidden = false;
      el.factBadge.textContent =
        fact.source === "wikipedia" ? "Wikipedia" : "Archive";

      if (fact.image) {
        el.factImage.onload = () => {
          el.factImage.hidden = false;
          el.factCard.classList.remove("is-loading");
        };
        el.factImage.onerror = () => el.factCard.classList.remove("is-loading");
        el.factImage.src = fact.image;
        el.factImage.alt = fact.title;
      } else {
        el.factCard.classList.remove("is-loading");
      }
    } catch (err) {
      el.factTitle.textContent = "Deep space link offline";
      el.factText.textContent =
        "Couldn't reach Wikipedia right now — the universe will still be here on your next visit.";
      el.factCard.classList.remove("is-loading");
    }
  },

  /* ------------------------------------------- camera + interaction */
  bindUniverseInteraction() {
    const s = this.state,
      canvas = s.el.canvas,
      cam = this.config.camera;

    window.addEventListener(
      "pointermove",
      (e) => {
        s.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        s.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        s.pointerNDC.set(s.mouse.x, -s.mouse.y);
        // only hover-pick when the pointer is actually over the canvas
        s.pointerOnCanvas = e.target === canvas;

        if (s.dragging) {
          const dx = e.clientX - s.dragStart.x;
          const dy = e.clientY - s.dragStart.y;
          s.moved = Math.max(s.moved, Math.abs(dx) + Math.abs(dy));
          s.thetaTarget = s.dragStart.theta - dx * 0.005;
          s.phiTarget = THREE.MathUtils.clamp(
            s.dragStart.phi - dy * 0.004,
            0.18,
            Math.PI - 0.18,
          );
        }
      },
      { passive: true },
    );

    canvas.addEventListener("pointerdown", (e) => {
      s.dragging = true;
      s.moved = 0;
      s.dragStart = {
        x: e.clientX,
        y: e.clientY,
        theta: s.thetaTarget,
        phi: s.phiTarget,
      };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    });

    const endDrag = (e) => {
      if (!s.dragging) return;
      s.dragging = false;
      canvas.classList.remove("dragging");
      if (s.moved < 6 && e.type === "pointerup") this.handleClick();
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    // fly from inside the system all the way out past the galaxies
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = Math.exp(e.deltaY * 0.0014);
        s.radiusTarget = THREE.MathUtils.clamp(
          s.radiusTarget * factor,
          cam.minRadius,
          cam.maxRadius,
        );
      },
      { passive: false },
    );
  },

  handleClick() {
    const s = this.state;
    s.raycaster.setFromCamera(s.pointerNDC, s.camera);
    const hits = s.raycaster.intersectObjects(s.hoverables, false);

    if (hits.length) {
      this.flyToObject(hits[0].object);
    } else {
      s.focusObj = null;
      s.lookGoal.set(0, 0, 0);
      s.radiusTarget = THREE.MathUtils.clamp(
        s.radiusTarget,
        130,
        this.config.camera.maxRadius,
      );
    }
  },

  flyToObject(obj) {
    const s = this.state;
    s.focusObj = obj; // lookGoal follows it while it orbits
    const view = obj.userData.view;
    s.radiusTarget =
      (view && s.isMobile && view.mobileRadius) ||
      (view && view.radius) ||
      obj.userData.focusDist ||
      70;
    if (view) {
      s.thetaTarget = view.theta;
      s.phiTarget = view.phi;
    } else if (obj.userData.kind === "galaxy") {
      // settle slightly above the disc for a cinematic three-quarter view
      s.phiTarget = 0.95;
    }
  },

  /* ------------------------------------------------------ search */
  buildSearchIndex() {
    const s = this.state;
    const seen = new Set();
    s.searchIndex = [...s.hoverables, ...s.searchExtras]
      .filter((o) => {
        const n = o.userData.name;
        if (!n || seen.has(n)) return false;
        seen.add(n);
        return true;
      })
      .map((o) => ({
        obj: o,
        name: o.userData.name,
        type: o.userData.type || "",
      }));
  },

  bindSearchToggle() {
    const s = this.state;
    const toggle = s.el.navToggle;
    const search = s.el.search;

    if (toggle) {
      toggle.addEventListener("click", () => {
        search.classList.toggle("is-open");
        search.setAttribute(
          "aria-hidden",
          search.classList.contains("is-open") ? "false" : "true",
        );
        if (search.classList.contains("is-open")) {
          s.el.searchInput.focus();
        }
      });
    }

    // close search when clicking outside
    document.addEventListener("pointerdown", (e) => {
      if (search && !search.contains(e.target) && !toggle?.contains(e.target)) {
        search.classList.remove("is-open");
        search.setAttribute("aria-hidden", "true");
      }
    });
  },

  bindSearch() {
    const s = this.state;
    const input = s.el.searchInput;

    input.addEventListener("input", () =>
      this.renderSearchResults(input.value),
    );
    input.addEventListener("focus", () =>
      this.renderSearchResults(input.value),
    );

    this.syncQuickDestinations();
    s.el.search.querySelectorAll("[data-search-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.getAttribute("data-search-target");
        const item = this.findSearchItem(target);
        if (item) this.selectSearchResult(item);
      });
    });

    input.addEventListener("keydown", (e) => {
      const n = s.searchMatches.length;
      if (e.key === "ArrowDown" && n) {
        e.preventDefault();
        s.searchActive = (s.searchActive + 1) % n;
        this.highlightSearchActive();
      } else if (e.key === "ArrowUp" && n) {
        e.preventDefault();
        s.searchActive = (s.searchActive - 1 + n) % n;
        this.highlightSearchActive();
      } else if (e.key === "Enter" && n) {
        e.preventDefault();
        this.selectSearchResult(s.searchMatches[s.searchActive]);
      } else if (e.key === "Escape") {
        this.closeSearchResults();
        input.blur();
      }
    });

    // close results when clicking outside search area (but not outside toggle)
    input.addEventListener("blur", () => {
      setTimeout(() => this.closeSearchResults(), 50);
    });
  },

  findSearchItem(name) {
    const key = name.trim().toLowerCase();
    return (
      this.state.searchIndex.find((it) => it.name.toLowerCase() === key) ||
      this.state.searchIndex.find((it) => it.name.toLowerCase().includes(key))
    );
  },

  syncQuickDestinations() {
    const buttons = [
      ...this.state.el.search.querySelectorAll("[data-search-target]"),
    ];
    const preferred = ["Andromeda Galaxy", "Milky Way", "Earth"];
    const chosen = [];
    const used = new Set();

    preferred.forEach((name) => {
      const item = this.findSearchItem(name);
      if (item && !used.has(item.name)) {
        chosen.push(item);
        used.add(item.name);
      }
    });

    this.state.searchIndex.forEach((item) => {
      if (chosen.length >= buttons.length || used.has(item.name)) return;
      chosen.push(item);
      used.add(item.name);
    });

    buttons.forEach((button, index) => {
      const item = chosen[index];
      if (!item) {
        button.hidden = true;
        return;
      }
      button.hidden = false;
      button.dataset.searchTarget = item.name;
      button.textContent =
        item.name === "Andromeda Galaxy" ? "Andromeda" : item.name;
    });
  },

  renderSearchResults(query) {
    const s = this.state,
      list = s.el.searchResults;
    const q = query.trim().toLowerCase();

    s.searchMatches = s.searchIndex
      .filter(
        (it) =>
          !q ||
          it.name.toLowerCase().includes(q) ||
          it.type.toLowerCase().includes(q),
      )
      .slice(0, 8);
    s.searchActive = 0;

    list.innerHTML = "";
    if (!s.searchMatches.length) {
      const li = document.createElement("li");
      li.className = "sr-empty";
      li.textContent = "Nothing out there matches…";
      list.appendChild(li);
    } else {
      s.searchMatches.forEach((it, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        if (i === 0) li.classList.add("is-active");

        const main = document.createElement("span");
        main.className = "search-result-main";

        const name = document.createElement("span");
        name.className = "sr-name";
        if (q) {
          const idx = it.name.toLowerCase().indexOf(q);
          if (idx >= 0) {
            name.append(it.name.slice(0, idx));
            const mark = document.createElement("mark");
            mark.textContent = it.name.slice(idx, idx + q.length);
            name.append(mark, it.name.slice(idx + q.length));
          } else {
            name.textContent = it.name;
          }
        } else {
          name.textContent = it.name;
        }

        const type = document.createElement("span");
        type.className = "sr-type";
        type.textContent = it.type;

        const action = document.createElement("span");
        action.className = "sr-action";
        action.textContent = "View";

        main.append(name, type);
        li.append(main, action);
        li.addEventListener("pointerenter", () => {
          s.searchActive = i;
          this.highlightSearchActive();
        });
        li.addEventListener("click", () => this.selectSearchResult(it));
        list.appendChild(li);
      });
    }

    list.hidden = false;
    s.el.searchInput.setAttribute("aria-expanded", "true");
  },

  highlightSearchActive() {
    const s = this.state;
    [...s.el.searchResults.children].forEach((li, i) =>
      li.classList.toggle("is-active", i === s.searchActive),
    );
  },

  closeSearchResults() {
    const s = this.state;
    s.el.searchResults.hidden = true;
    s.el.searchInput.setAttribute("aria-expanded", "false");
  },

  selectSearchResult(item) {
    const s = this.state;
    s.el.searchInput.value = item.name;
    this.closeSearchResults();
    s.el.searchInput.blur();
    s.el.search.classList.remove("is-open");
    s.el.search.setAttribute("aria-hidden", "true");

    // clear the stage so the destination is unobstructed
    if (!s.el.panel.classList.contains("is-hidden")) this.setPanelHidden(true);
    this.flyToObject(item.obj);
  },

  updateHover() {
    const s = this.state;
    if (s.dragging) return;
    if (!s.pointerOnCanvas) {
      if (s.hovered) {
        s.hovered = null;
        this.hideTooltip();
        s.el.canvas.style.cursor = "";
      }
      return;
    }
    s.raycaster.setFromCamera(s.pointerNDC, s.camera);
    const hits = s.raycaster.intersectObjects(s.hoverables, false);
    const obj = hits.length ? hits[0].object : null;

    if (obj !== s.hovered) {
      s.hovered = obj;
      if (obj) {
        this.showTooltip(obj.userData);
        s.el.canvas.style.cursor = "pointer";
      } else {
        this.hideTooltip();
        s.el.canvas.style.cursor = "";
      }
    }
    if (s.hovered) this.moveTooltipToPointer();
  },

  showTooltip(data) {
    const tip = this.state.el.tooltip;
    tip.innerHTML =
      '<span class="tt-name"></span>' +
      '<span class="tt-meta tt-type"></span>' +
      '<span class="tt-meta tt-extra"></span>';
    tip.querySelector(".tt-name").textContent = data.name || "Unknown";
    tip.querySelector(".tt-type").textContent =
      "Type: " + (data.type || "Celestial Object");
    tip.querySelector(".tt-extra").textContent = data.meta || "";
    tip.classList.add("is-visible");
    tip.setAttribute("aria-hidden", "false");
  },

  moveTooltipToPointer() {
    const s = this.state,
      tip = s.el.tooltip;
    const px = ((s.mouse.x + 1) / 2) * window.innerWidth;
    const py = ((s.mouse.y + 1) / 2) * window.innerHeight;
    const pad = 18;
    const rect = tip.getBoundingClientRect();
    let x = px + pad,
      y = py + pad;
    if (x + rect.width > window.innerWidth - 12) x = px - rect.width - pad;
    if (y + rect.height > window.innerHeight - 12) y = py - rect.height - pad;
    tip.style.transform = "translate(" + x + "px, " + y + "px)";
  },

  hideTooltip() {
    const tip = this.state.el.tooltip;
    tip.classList.remove("is-visible");
    tip.setAttribute("aria-hidden", "true");
  },

  /* ------------------------------------------------------ render loop */
  animate() {
    const s = this.state;
    const tick = () => {
      const dt = Math.min(s.clock.getDelta(), 0.05);
      const t = s.clock.elapsedTime;
      const motion = s.reducedMotion ? 0 : 1;

      if (s.starUniforms) s.starUniforms.uTime.value = t * motion;
      if (!s.dragging) s.thetaTarget += dt * 0.012 * motion;

      // keep the camera target glued to a focused (orbiting) object
      if (s.focusObj) s.focusObj.getWorldPosition(s.lookGoal);

      const ease = 1 - Math.pow(0.0018, dt);
      s.theta += (s.thetaTarget - s.theta) * ease;
      s.phi += (s.phiTarget - s.phi) * ease;
      s.radius += (s.radiusTarget - s.radius) * ease;
      s.lookTarget.lerp(s.lookGoal, ease * 0.8);

      const px = s.parallax;
      px.x += (s.mouse.x * 0.05 * motion - px.x) * 0.04;
      px.y += (s.mouse.y * 0.04 * motion - px.y) * 0.04;

      const theta = s.theta + px.x;
      const phi = THREE.MathUtils.clamp(s.phi + px.y, 0.15, Math.PI - 0.15);
      s.camera.position.set(
        s.lookTarget.x + s.radius * Math.sin(phi) * Math.cos(theta),
        s.lookTarget.y + s.radius * Math.cos(phi),
        s.lookTarget.z + s.radius * Math.sin(phi) * Math.sin(theta),
      );
      s.camera.lookAt(s.lookTarget);

      // planets: orbit (sol), float (fictional), spin, carry their moons
      s.planets.forEach((p) => {
        if (p.orbitSpeed) p.pivot.rotation.y += p.orbitSpeed * dt * motion;
        p.body.rotation.y += p.spin * dt * motion;
        if (p.moonPivot) p.moonPivot.rotation.y += 0.35 * dt * motion;
        if (p.subPivots) {
          p.subPivots.forEach((sp) => {
            sp.pivot.rotation.y += sp.speed * dt * motion;
          });
        }
        if (p.bob) {
          p.bob.group.position.y =
            p.bob.baseY + Math.sin(t * 0.5 + p.bob.phase) * p.bob.amp * motion;
        }
      });
      if (s.belt) s.belt.rotation.y += 0.004 * dt * motion;

      s.galaxies.forEach((g) => {
        g.group.rotation.y += g.speed * dt * motion;
      });
      s.nebulae.forEach((n) => {
        n.sprite.material.rotation += n.drift * dt * motion;
      });

      s.comets.forEach((cm) => {
        cm.offset = (cm.offset + cm.speed * dt) % cm.length;
        const headPos = cm.start.clone().addScaledVector(cm.dir, cm.offset);
        cm.head.position.copy(headPos);
        const tailPos = headPos.clone().addScaledVector(cm.dir, -cm.tail);
        cm.trail.geometry.setFromPoints([headPos, tailPos]);
        const edge = Math.min(cm.offset, cm.length - cm.offset) / 60;
        const a = THREE.MathUtils.clamp(edge, 0, 1);
        cm.head.material.opacity = a;
        cm.trail.material.opacity = a * 0.55;
      });

      this.updateHover();
      s.renderer.render(s.scene, s.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};

export function initCosmicLogin() {
  CosmicLogin.init();
}

export { CosmicLogin };
