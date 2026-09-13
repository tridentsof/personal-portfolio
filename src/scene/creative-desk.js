import * as THREE from 'three';
import { synth } from '../audio/synth.js';

export class CreativeDeskScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.interactiveObjects = [];
    this.mouse = new THREE.Vector2();

    // Camera Focus Presets for each Section (Desktop / Landscape)
    this.cameraFocusPoints = {
      overview: { pos: new THREE.Vector3(3.2, 4.4, 7.8), target: new THREE.Vector3(-0.3, 0.6, 0.1), name: 'Overview' },
      about: { pos: new THREE.Vector3(-1.8, 2.6, 2.0), target: new THREE.Vector3(-2.6, 1.0, -0.6), name: 'About & Philosophy' },
      experience: { pos: new THREE.Vector3(1.5, 2.4, 2.4), target: new THREE.Vector3(1.7, 0.2, 0.4), name: 'FPT Work Experience' },
      certifications: { pos: new THREE.Vector3(0.0, 3.8, 2.2), target: new THREE.Vector3(0.0, 3.6, -3.0), name: 'Certifications (AZ-900 & AI)' },
      skills: { pos: new THREE.Vector3(0.0, 2.5, 2.5), target: new THREE.Vector3(0.0, 1.7, -0.9), name: 'Tech Stack & Tools' },
      contact: { pos: new THREE.Vector3(3.2, 2.7, 1.6), target: new THREE.Vector3(4.6, 1.55, -0.4), name: 'Contact & Radio' },
      piano: { pos: new THREE.Vector3(-0.3, 2.3, 2.3), target: new THREE.Vector3(-0.3, 0.2, 0.65), name: 'Custom Keyboard' }
    };

    // Camera Focus Presets optimized specifically for Portrait Mobile (9:16)
    this.cameraFocusPointsMobile = {
      overview: { pos: new THREE.Vector3(3.4, 5.2, 9.4), target: new THREE.Vector3(-0.1, 0.9, 0.1), name: 'Overview' },
      about: { pos: new THREE.Vector3(-1.8, 2.9, 2.6), target: new THREE.Vector3(-2.6, 1.1, -0.6), name: 'About & Philosophy' },
      experience: { pos: new THREE.Vector3(1.6, 2.8, 2.8), target: new THREE.Vector3(1.7, 0.3, 0.4), name: 'FPT Work Experience' },
      certifications: { pos: new THREE.Vector3(0.0, 4.2, 2.8), target: new THREE.Vector3(0.0, 3.6, -3.0), name: 'Certifications (AZ-900 & AI)' },
      skills: { pos: new THREE.Vector3(0.0, 2.9, 3.1), target: new THREE.Vector3(0.0, 1.7, -0.9), name: 'Tech Stack & Tools' },
      contact: { pos: new THREE.Vector3(3.4, 3.1, 2.1), target: new THREE.Vector3(4.6, 1.55, -0.4), name: 'Contact & Radio' },
      piano: { pos: new THREE.Vector3(-0.3, 2.6, 2.8), target: new THREE.Vector3(-0.3, 0.2, 0.65), name: 'Custom Keyboard' }
    };

    const aspect = window.innerWidth / window.innerHeight;
    this.isMobile = aspect < 1.0 || window.innerWidth < 768;

    this.activeSection = 'overview';
    const initPt = (this.isMobile && this.cameraFocusPointsMobile.overview) ? this.cameraFocusPointsMobile.overview : this.cameraFocusPoints.overview;
    this.targetCameraPos = initPt.pos.clone();
    this.currentCameraPos = initPt.pos.clone();
    this.lookAtTarget = initPt.target.clone();
    this.currentLookAt = initPt.target.clone();

    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();

    // Lighting Presets (Morning, Golden Hour, Warm Studio - Cozy Japandi Aesthetic)
    this.lightingPresets = {
      morning: {
        bg: 0xf0eae1,
        fog: 0xf0eae1,
        ambient: 0xfff8ee,
        ambientIntensity: 1.3,
        sun: 0xffeed0,
        sunIntensity: 2.8,
        fill: 0xf4e6d8,
        bounce: 0xf8e0c8
      },
      golden: {
        bg: 0xedd9c4,
        fog: 0xedd9c4,
        ambient: 0xffe4cb,
        ambientIntensity: 1.4,
        sun: 0xffaa5e,
        sunIntensity: 3.3,
        fill: 0xffd3a8,
        bounce: 0xffb87a
      },
      studio: {
        bg: 0xe5dacf,
        fog: 0xe5dacf,
        ambient: 0xf8eee0,
        ambientIntensity: 1.2,
        sun: 0xffe2b5,
        sunIntensity: 2.3,
        fill: 0xe0cbaf,
        bounce: 0xffd8a8
      }
    };
    this.activeLighting = 'morning';

    // Animation physics states
    this.pianoKeys = [];
    this.bonsaiWobble = 0;
    this.antennaWobble = 0;
    this.radioDialPulse = 0;

    this.init();
    this.buildLighting();
    this.buildArchitecture();         // Back wall & Scandinavian plank oak floor
    this.buildLeftSunlitWindow();      // Large studio window, sheer linen curtain & window sill
    this.buildVolumetricSunbeams();   // Soft volumetric sunlight shaft & drifting dust motes
    this.buildCredenzaRight();        // Rounded warm oak credenza & ceramic vessel
    this.buildDeskAndBentoMat();      // Blonde oak desk + Leather desk pad
    this.buildWallCertifications();   // 3 Modern floating wall frames (AZ-900, AI-103, AB-100)
    this.buildStudioDisplay();        // Frameless Studio Display + Desk Shelf Riser + Mac Studio pod
    this.buildAboutSection();         // Zen Bonsai in Hasami pot (freestanding)
    this.buildDeskLamp();             // Modern Arc Task Lamp (isolated at far back-left, separated from Bonsai)
    this.buildExperienceSection();    // Cognac leather portfolio binder + pen
    this.buildContactSection();       // Dieter Rams radio (on credenza) + coffee & sketchbook (on desk)
    this.buildKeyboardSection();      // Custom tactile mechanical keyboard (replaces piano)
    this.buildChairForeground();      // Scandinavian curved Wishbone armchair
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.lightingPresets.morning.bg);
    this.scene.fog = new THREE.Fog(this.lightingPresets.morning.fog, 18, 38);

    const aspect = window.innerWidth / window.innerHeight;
    this.isMobile = aspect < 1.0 || window.innerWidth < 768;
    const initialFov = this.isMobile ? 62 : 45;
    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 100);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.lookAtTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.container.appendChild(this.renderer.domElement);
  }

  buildLighting() {
    const config = this.lightingPresets[this.activeLighting];

    this.ambientLight = new THREE.AmbientLight(config.ambient, config.ambientIntensity);
    this.scene.add(this.ambientLight);

    // Directional Sunlight (Key Light)
    this.sunLight = new THREE.DirectionalLight(config.sun, config.sunIntensity);
    this.sunLight.position.set(-8, 14, 6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 30;
    const d = 7;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    // Cool Sky Window Fill
    this.fillLight = new THREE.DirectionalLight(config.fill, 0.85);
    this.fillLight.position.set(6, 6, 8);
    this.scene.add(this.fillLight);

    // Interior Bounce Light
    this.bounceLight = new THREE.PointLight(config.bounce, 0.9, 14);
    this.bounceLight.position.set(0, 4, -4);
    this.scene.add(this.bounceLight);

    // Wall Art Spotlights (Gallery illumination for wall certificates)
    this.gallerySpotlight = new THREE.SpotLight(0xfffaee, 2.6, 8, Math.PI / 3, 0.5, 1.2);
    this.gallerySpotlight.position.set(0, 6.2, -1.2);
    this.gallerySpotlight.target.position.set(0, 3.6, -3.0);
    this.scene.add(this.gallerySpotlight);
    this.scene.add(this.gallerySpotlight.target);

    // Interactive Desk Arc Lamp Spotlight
    this.deskLampSpotlight = new THREE.SpotLight(0xffeedd, 3.2, 6.5, Math.PI / 4, 0.4, 1.2);
    this.deskLampSpotlight.position.set(-3.15, 2.1, -1.3);
    this.deskLampSpotlight.target.position.set(-2.2, 0.05, -0.2);
    this.deskLampSpotlight.castShadow = true;
    this.scene.add(this.deskLampSpotlight);
    this.scene.add(this.deskLampSpotlight.target);
  }

  setLightingMode(mode) {
    if (!this.lightingPresets[mode]) return;
    this.activeLighting = mode;
    const cfg = this.lightingPresets[mode];

    this.scene.background.setHex(cfg.bg);
    this.scene.fog.color.setHex(cfg.fog);
    this.ambientLight.color.setHex(cfg.ambient);
    this.ambientLight.intensity = cfg.ambientIntensity;
    this.sunLight.color.setHex(cfg.sun);
    this.sunLight.intensity = cfg.sunIntensity;
    this.fillLight.color.setHex(cfg.fill);
    this.bounceLight.color.setHex(cfg.bounce);
  }

  createWoodFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm honey oak tone
    ctx.fillStyle = '#c99d69';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankW = 128;
    const plankH = 512;

    for (let x = 0; x < 1024; x += plankW) {
      for (let y = 0; y < 1024; y += plankH) {
        // Individual plank shade variation
        const shade = Math.sin(x * 12.3 + y * 7.1) * 14;
        const r = Math.min(255, Math.max(0, 204 + shade));
        const g = Math.min(255, Math.max(0, 160 + shade));
        const b = Math.min(255, Math.max(0, 110 + shade * 0.8));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

        // Subtle warm wood grain stripes
        ctx.fillStyle = 'rgba(95, 60, 25, 0.06)';
        for (let gIdx = 0; gIdx < 8; gIdx++) {
          const gx = x + 10 + gIdx * 14;
          ctx.fillRect(gx, y, 4, plankH);
        }

        // Plank bevel seams
        ctx.strokeStyle = '#7c5832';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x, y, plankW, plankH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.anisotropy = 8;
    return texture;
  }

  buildArchitecture() {
    // 1. Architectural Studio Back Wall (Soft warm oatmeal plaster)
    const wallGeo = new THREE.PlaneGeometry(38, 20);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xede6db,
      roughness: 0.92,
      metalness: 0.01
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5.2, -3.15);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // 2. Left Wall with Studio Window Opening
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-6.8, 5.2, 3.0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // 3. Warm Scandinavian Plank Oak Wood Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const woodTexture = this.createWoodFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.48,
      metalness: 0.06
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.6;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  // Large Sunlit Studio Window, Sheer Linen Curtain & Window Sill with Flora
  buildLeftSunlitWindow() {
    this.windowGroup = new THREE.Group();
    this.windowGroup.position.set(-6.6, 3.6, 0.4);
    this.windowGroup.rotation.y = Math.PI / 2;
    this.scene.add(this.windowGroup);

    // A. Window Outer & Inner Frame (Warm Matte Off-White)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ed, roughness: 0.45 });
    const winW = 7.4;
    const winH = 9.2;
    const winDepth = 0.22;

    // Outer Frame Box
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.22, winDepth), frameMat);
    topBar.position.set(0, winH * 0.5, 0);
    this.windowGroup.add(topBar);

    const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.22, winDepth), frameMat);
    bottomBar.position.set(0, -winH * 0.5, 0);
    this.windowGroup.add(bottomBar);

    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, winH, winDepth), frameMat);
    leftBar.position.set(-winW * 0.5, 0, 0);
    this.windowGroup.add(leftBar);

    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, winH, winDepth), frameMat);
    rightBar.position.set(winW * 0.5, 0, 0);
    this.windowGroup.add(rightBar);

    // Vertical & Horizontal Mullions
    const mullionV1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, winH, winDepth * 0.8), frameMat);
    mullionV1.position.set(-winW * 0.18, 0, 0);
    this.windowGroup.add(mullionV1);

    const mullionV2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, winH, winDepth * 0.8), frameMat);
    mullionV2.position.set(winW * 0.18, 0, 0);
    this.windowGroup.add(mullionV2);

    const transomH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.12, winDepth * 0.8), frameMat);
    transomH.position.set(0, winH * 0.15, 0);
    this.windowGroup.add(transomH);

    // B. Warm Sunlit Window Glass (Diffuse Glow)
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0xfffbee,
      transparent: true,
      opacity: 0.82
    });
    const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(winW - 0.2, winH - 0.2), glassMat);
    glassPane.position.z = -0.06;
    this.windowGroup.add(glassPane);

    // C. Soft Billowing Sheer Linen Curtain (Side of Window)
    this.curtainGroup = new THREE.Group();
    this.curtainGroup.position.set(winW * 0.42, 0, 0.25);
    this.windowGroup.add(this.curtainGroup);

    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    });

    // Elegant wavy folds using spline ribbon
    for (let f = 0; f < 5; f++) {
      const foldCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(f * 0.28, winH * 0.5, (f % 2 === 0 ? 0.08 : -0.08)),
        new THREE.Vector3(f * 0.28 + 0.04, winH * 0.1, (f % 2 === 0 ? -0.12 : 0.12)),
        new THREE.Vector3(f * 0.28 - 0.04, -winH * 0.2, (f % 2 === 0 ? 0.1 : -0.1)),
        new THREE.Vector3(f * 0.28 + 0.08, -winH * 0.5, 0)
      );
      const foldGeo = new THREE.TubeGeometry(foldCurve, 32, 0.16, 8, false);
      const foldMesh = new THREE.Mesh(foldGeo, curtainMat);
      this.curtainGroup.add(foldMesh);
    }

    // Curtain Rod (Brushed Aged Brass)
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, winW + 0.6, 16), rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, winH * 0.52, 0.28);
    this.windowGroup.add(rod);

    // D. Window Sill with Dried Floral Stalks & Ceramic Vase (Matching Honey Oak)
    const sillMat = new THREE.MeshStandardMaterial({ color: 0xc89b67, roughness: 0.52 });
    const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.6, 0.12, 0.75), sillMat);
    sill.position.set(0, -winH * 0.5 - 0.06, 0.25);
    sill.receiveShadow = true;
    this.windowGroup.add(sill);

    // Minimalist Hasami Sandstone Ceramic Vase on Sill
    const vaseMat = new THREE.MeshStandardMaterial({ color: 0xf0eae1, roughness: 0.85 });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.52, 24), vaseMat);
    vase.position.set(-winW * 0.22, -winH * 0.5 + 0.26, 0.25);
    vase.castShadow = true;
    this.windowGroup.add(vase);

    // Slender Dried Botanical Grass Stalks
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0xb59a7a, roughness: 0.82 });
    for (let s = 0; s < 7; s++) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.75 + s * 0.06, 8), stalkMat);
      stalk.position.set(
        -winW * 0.22 + (Math.random() - 0.5) * 0.08,
        -winH * 0.5 + 0.55 + s * 0.03,
        0.25 + (Math.random() - 0.5) * 0.08
      );
      stalk.rotation.z = (Math.random() - 0.5) * 0.25;
      stalk.rotation.x = (Math.random() - 0.5) * 0.25;
      this.windowGroup.add(stalk);
    }
  }

  // Soft Volumetric Sunbeam Shaft & Floating Dust Motes
  buildVolumetricSunbeams() {
    // A. Angled Volumetric Sunbeam Light Shaft pouring onto Desk
    const beamGeo = new THREE.PlaneGeometry(6.4, 9.5);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffedd2,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const sunbeam = new THREE.Mesh(beamGeo, beamMat);
    sunbeam.position.set(-2.8, 2.2, 1.0);
    sunbeam.rotation.x = Math.PI * 0.28;
    sunbeam.rotation.y = -Math.PI * 0.22;
    sunbeam.rotation.z = Math.PI * 0.12;
    this.scene.add(sunbeam);

    // B. Ambient Warm Sun Dust Motes (Floating particles dancing in light)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = -4.0 + Math.random() * 6.5;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.8;
      positions[i * 3 + 2] = -1.5 + Math.random() * 4.5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dustPoints = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xfff6dd,
        size: 0.045,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending
      })
    );
    this.scene.add(this.dustPoints);
  }

  // Warm Minimalist Oak Credenza / Sideboard on Right Side
  buildCredenzaRight() {
    this.credenzaGroup = new THREE.Group();
    this.credenzaGroup.position.set(5.1, -0.7, -0.6);
    this.credenzaGroup.rotation.y = -0.15;
    this.scene.add(this.credenzaGroup);

    const oakMat = new THREE.MeshStandardMaterial({
      color: 0xc89b67, // Matching Solid Honey Oak
      roughness: 0.52,
      metalness: 0.02
    });

    // Credenza Body with Soft Rounded Pill Corners
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 4.2), oakMat);
    body.position.y = 1.1;
    body.castShadow = true;
    body.receiveShadow = true;
    this.credenzaGroup.add(body);

    // Cylindrical Rounded End Caps for pill-shape silhouette
    const capGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24);
    const frontCap = new THREE.Mesh(capGeo, oakMat);
    frontCap.position.set(0, 1.1, 2.1);
    frontCap.castShadow = true;
    this.credenzaGroup.add(frontCap);

    const backCap = new THREE.Mesh(capGeo, oakMat);
    backCap.position.set(0, 1.1, -2.1);
    backCap.castShadow = true;
    this.credenzaGroup.add(backCap);

    // Sculptural Hasami Sandstone Ceramic Vessel on Credenza Top
    const vesselMat = new THREE.MeshStandardMaterial({ color: 0xf0eae1, roughness: 0.85 });
    const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.68, 24), vesselMat);
    vessel.position.set(-0.15, 2.55, 0.2);
    vessel.castShadow = true;
    this.credenzaGroup.add(vessel);
  }

  buildDeskAndBentoMat() {
    this.deskGroup = new THREE.Group();
    this.scene.add(this.deskGroup);

    // 1. Solid Honey Oak Desk Top with Soft Chamfered Edge
    const deskGeo = new THREE.BoxGeometry(9.4, 0.28, 5.4);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xc89b67, // Solid Honey Oak
      roughness: 0.52,
      metalness: 0.02
    });
    this.desk = new THREE.Mesh(deskGeo, deskMat);
    this.desk.position.set(0, -0.14, 0);
    this.desk.castShadow = true;
    this.desk.receiveShadow = true;
    this.deskGroup.add(this.desk);

    // Architectural Cylindrical Fluted Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2e2b28, roughness: 0.55, metalness: 0.25 });
    const legPositions = [
      [-4.2, -1.4, -2.2],
      [4.2, -1.4, -2.2],
      [-4.2, -1.4, 2.2],
      [4.2, -1.4, 2.2]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 24), legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      this.deskGroup.add(leg);
    });

    // 2. Bento Organization: Warm Camel Nubuck Saddle Leather Desk Pad
    const padGeo = new THREE.BoxGeometry(5.4, 0.025, 2.8);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xa0633c, // Warm Camel Nubuck Saddle Leather
      roughness: 0.68,
      metalness: 0.04
    });
    const deskPad = new THREE.Mesh(padGeo, padMat);
    deskPad.position.set(0, 0.012, 0.4);
    deskPad.receiveShadow = true;
    this.deskGroup.add(deskPad);

    // Stitched Border Perimeter on Desk Pad (Warm Linen Thread)
    const stitchBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(5.34, 0.027, 2.74)),
      new THREE.LineBasicMaterial({ color: 0xd4a574 })
    );
    stitchBorder.position.copy(deskPad.position);
    this.deskGroup.add(stitchBorder);
  }

  // 1. CERTIFICATIONS: 3 Modern Floating Acrylic Wall Frames (Wall Mounted)
  buildWallCertifications() {
    this.wallCertsGroup = new THREE.Group();
    this.wallCertsGroup.position.set(0, 3.6, -3.05);
    this.scene.add(this.wallCertsGroup);

    const certData = [
      {
        id: 'az-900',
        x: -2.2,
        title: 'Microsoft Certified: Azure Fundamentals',
        credentialId: 'A3522411055305AC',
        certNumber: 'C5AB27-0A7UE5',
        earnedDate: 'April 21, 2025',
        badgeLevel: 'FUNDAMENTALS',
        badgeColor: '#0078d4',
        type: 'Cloud Architecture'
      },
      {
        id: 'ai-103',
        x: 0.0,
        title: 'Microsoft Certified: Azure AI Engineer Associate',
        credentialId: 'B7819204918231FD',
        certNumber: 'D9EF12-4B2KC9',
        earnedDate: 'May 15, 2025',
        badgeLevel: 'ASSOCIATE',
        badgeColor: '#0078d4',
        type: 'Agentic AI & LLMs'
      },
      {
        id: 'gh-300',
        x: 2.2,
        title: 'GitHub Copilot',
        credentialId: '3A7C3643EFDBC868',
        certNumber: 'EC4D85-33E7EF',
        earnedDate: 'August 4, 2025',
        expiresDate: 'August 5, 2027',
        badgeType: 'github-copilot',
        badgeLevel: 'COPILOT',
        badgeColor: '#24292e',
        type: 'AI Pair Programming'
      }
    ];

    certData.forEach(cert => {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(cert.x, 0, 0);

      // A. Slim Anodized Black Architectural Frame
      const frameGeo = new THREE.BoxGeometry(1.7, 1.15, 0.03);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.28, metalness: 0.75 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      frameGroup.add(frame);

      // B. Fine Art White Cardstock Backing
      const paperGeo = new THREE.PlaneGeometry(1.58, 1.03);
      const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.z = 0.018;
      frameGroup.add(paper);

      // C. Exact 1-1 Microsoft Official Certificate Graphic Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 660;
      const ctx = canvas.getContext('2d');

      // 1. Crisp White Certificate Paper Base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 660);

      // Subtle Outer Paper Boundary
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 1020, 656);

      // 2. Official Microsoft Logo (4 Colored Squares + "Microsoft" Text)
      const msLogoX = 422;
      const msLogoY = 62;
      const sq = 15;
      const gap = 3;
      // Red square (top-left)
      ctx.fillStyle = '#f25022';
      ctx.fillRect(msLogoX, msLogoY, sq, sq);
      // Green square (top-right)
      ctx.fillStyle = '#7fba00';
      ctx.fillRect(msLogoX + sq + gap, msLogoY, sq, sq);
      // Blue square (bottom-left)
      ctx.fillStyle = '#00a4ef';
      ctx.fillRect(msLogoX, msLogoY + sq + gap, sq, sq);
      // Yellow square (bottom-right)
      ctx.fillStyle = '#ffb900';
      ctx.fillRect(msLogoX + sq + gap, msLogoY + sq + gap, sq, sq);

      // "Microsoft" typography
      ctx.fillStyle = '#737373';
      ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Microsoft', msLogoX + (sq * 2 + gap) + 14, msLogoY + 27);

      // 3. Recipient Name
      ctx.fillStyle = '#1b1b1b';
      ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đặng Phước Trí', 512, 192);

      // 4. Requirements Subtitle
      ctx.fillStyle = '#555555';
      ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Plus Jakarta Sans", sans-serif';
      ctx.fillText('has successfully passed all requirements for', 512, 234);

      // 5. Official Certificate Title (Bold)
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 27px -apple-system, BlinkMacSystemFont, "Segoe UI", "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cert.title, 512, 284);

      // 6. Bottom Left: Credential Metadata & Verification Pill
      ctx.textAlign = 'left';
      ctx.fillStyle = '#333333';
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(`Credential ID: ${cert.credentialId}`, 72, 420);
      ctx.fillText(`Certification number: ${cert.certNumber}`, 72, 448);
      ctx.fillText(`Earned on: ${cert.earnedDate}`, 72, 476);
      if (cert.expiresDate) {
        ctx.fillText(`Expires on: ${cert.expiresDate}`, 72, 504);
      }

      // Pill badge: [ ✓ Online Verifiable ]
      const pillX = 72, pillY = cert.expiresDate ? 536 : 526, pillW = 162, pillH = 32, pillR = 16;
      ctx.strokeStyle = '#0078d4';
      ctx.lineWidth = 1.6;
      ctx.fillStyle = 'rgba(0, 120, 212, 0.05)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();

      // Blue Checkmark Icon inside Pill
      ctx.strokeStyle = '#0078d4';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pillX + 16, pillY + 16);
      ctx.lineTo(pillX + 21, pillY + 21);
      ctx.lineTo(pillX + 28, pillY + 11);
      ctx.stroke();

      ctx.fillStyle = '#0078d4';
      ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Online Verifiable', pillX + 36, pillY + 20);

      // 7. Bottom Center: Official Badge (GitHub Copilot vs Microsoft Certified)
      if (cert.badgeType === 'github-copilot') {
        const bx = 512, by = 478;
        ctx.save();
        // GitHub Copilot Shield Geometry (Deep charcoal slate with chevron bottom)
        const sw = 108, sh = 122;
        const sx = bx - sw / 2, sy = by - 56;
        ctx.beginPath();
        ctx.moveTo(sx + 12, sy);
        ctx.lineTo(sx + sw - 12, sy);
        ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + 12);
        ctx.lineTo(sx + sw, sy + 76);
        ctx.lineTo(bx, sy + sh);
        ctx.lineTo(sx, sy + 76);
        ctx.lineTo(sx, sy + 12);
        ctx.quadraticCurveTo(sx, sy, sx + 12, sy);
        ctx.closePath();

        ctx.fillStyle = '#22272e'; // Dark slate charcoal
        ctx.fill();
        ctx.strokeStyle = '#444c56'; // Subtle border outline
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Invertocat head silhouette
        const gx = bx, gy = sy + 23;
        ctx.fillStyle = '#636e7b';
        ctx.beginPath();
        ctx.arc(gx, gy, 11, 0, Math.PI * 2);
        ctx.fill();
        // Cat ears
        ctx.beginPath();
        ctx.moveTo(gx - 7, gy - 6);
        ctx.lineTo(gx - 11, gy - 14);
        ctx.lineTo(gx - 2, gy - 10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(gx + 7, gy - 6);
        ctx.lineTo(gx + 11, gy - 14);
        ctx.lineTo(gx + 2, gy - 10);
        ctx.fill();

        // Bold White "GitHub" & "Copilot"
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('GitHub', bx, sy + 56);
        ctx.fillText('Copilot', bx, sy + 74);

        // Green "Certification Program"
        ctx.fillStyle = '#2ea44f';
        ctx.font = '600 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('Certification', bx, sy + 93);
        ctx.fillText('Program', bx, sy + 103);

        ctx.restore();
      } else {
        // Microsoft Certified Shield (Azure Fundamentals / AI Engineer)
        const bx = 512, by = 484;
        ctx.save();

        // Shield Dark Navy Outline & Upper Fill
        ctx.beginPath();
        ctx.moveTo(bx - 55, by - 62);
        ctx.lineTo(bx + 55, by - 62);
        ctx.lineTo(bx + 55, by + 12);
        ctx.quadraticCurveTo(bx + 55, by + 68, bx, by + 86);
        ctx.quadraticCurveTo(bx - 55, by + 68, bx - 55, by + 12);
        ctx.closePath();
        ctx.fillStyle = '#132742'; // Microsoft Navy
        ctx.fill();

        // Shield Lower Azure Blue Region
        ctx.beginPath();
        ctx.moveTo(bx - 51, by + 16);
        ctx.lineTo(bx + 51, by + 16);
        ctx.quadraticCurveTo(bx + 51, by + 64, bx, by + 82);
        ctx.quadraticCurveTo(bx - 51, by + 64, bx - 51, by + 16);
        ctx.closePath();
        ctx.fillStyle = '#0078d4'; // Azure Blue
        ctx.fill();

        // Shield Header Typography
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('Microsoft', bx, by - 43);
        ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('CERTIFIED', bx, by - 29);

        // White Ribbon / Banner across shield
        const rw = 130, rh = 28, rx = bx - rw / 2, ry = by - 14;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#132742';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(rx, ry, rw, rh, 6);
        } else {
          ctx.rect(rx, ry, rw, rh);
        }
        ctx.fill();
        ctx.stroke();

        // Ribbon Text
        ctx.fillStyle = '#132742';
        ctx.font = '800 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(cert.badgeLevel, bx, by + 5);

        // White 5-pointed Star in Lower Shield
        const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
          let rot = (Math.PI / 2) * 3;
          let x = cx;
          let y = cy;
          const step = Math.PI / spikes;
          ctx.beginPath();
          ctx.moveTo(cx, cy - outerRadius);
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(cx, cy - outerRadius);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };
        drawStar(bx, by + 48, 5, 12, 5.5);
        ctx.restore();
      }

      // 8. Bottom Right: Satya Nadella Signature & Full Name
      const sigX = 860, sigY = 472;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Flowing cursive "Satya N."
      ctx.moveTo(sigX - 60, sigY - 2);
      ctx.bezierCurveTo(sigX - 50, sigY - 25, sigX - 35, sigY - 28, sigX - 30, sigY - 10);
      ctx.bezierCurveTo(sigX - 28, sigY + 2, sigX - 42, sigY + 12, sigX - 52, sigY + 8);
      ctx.bezierCurveTo(sigX - 35, sigY + 6, sigX - 10, sigY - 18, sigX, sigY - 12);
      ctx.bezierCurveTo(sigX + 6, sigY - 6, sigX - 4, sigY + 6, sigX + 16, sigY + 2);
      ctx.bezierCurveTo(sigX + 28, sigY - 2, sigX + 38, sigY - 14, sigX + 48, sigY - 8);
      ctx.bezierCurveTo(sigX + 58, sigY - 2, sigX + 52, sigY + 8, sigX + 62, sigY + 2);
      // Crossbar on 't'
      ctx.moveTo(sigX - 38, sigY - 18);
      ctx.lineTo(sigX - 18, sigY - 16);
      ctx.stroke();

      // Printed name underneath
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333333';
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Satya Narayana Nadella', sigX, sigY + 38);

      const certTexture = new THREE.CanvasTexture(canvas);
      certTexture.anisotropy = 8;
      const certPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(1.56, 1.01),
        new THREE.MeshBasicMaterial({ map: certTexture })
      );
      certPlate.position.z = 0.02;
      frameGroup.add(certPlate);

      // D. Clear Floating Acrylic Glass Face
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.08,
        transmission: 0.65,
        reflectivity: 0.9
      });
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.1), glassMat);
      glass.position.z = 0.025;
      frameGroup.add(glass);

      // E. Brass Standoff Bolts in 4 Corners
      const standoffMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3, metalness: 0.85 });
      const offsets = [
        [-0.76, -0.48],
        [0.76, -0.48],
        [-0.76, 0.48],
        [0.76, 0.48]
      ];
      offsets.forEach(([sx, sy]) => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.04, 16), standoffMat);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(sx, sy, 0.035);
        frameGroup.add(bolt);
      });

      // Interactive Trigger on Frame
      frame.userData = {
        type: 'section-trigger',
        section: 'certifications',
        name: `Certificate: ${cert.title}`
      };
      this.interactiveObjects.push(frame);

      this.wallCertsGroup.add(frameGroup);
    });
  }

  // 2. TECH STACK: Frameless Studio Display & Desk Shelf Riser & Mac Studio
  buildStudioDisplay() {
    this.displayGroup = new THREE.Group();
    this.displayGroup.position.set(0, 0.02, -0.9);
    this.deskGroup.add(this.displayGroup);

    // A. Architectural Desk Shelf / Monitor Riser (Grovemade Style Solid Oak & Aluminum)
    const shelfGroup = new THREE.Group();
    this.displayGroup.add(shelfGroup);

    const shelfOakMat = new THREE.MeshStandardMaterial({
      color: 0xc89b67, // Matching Solid Honey Oak
      roughness: 0.52,
      metalness: 0.02
    });
    const shelfTop = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.05, 1.05), shelfOakMat);
    shelfTop.position.set(0, 0.28, 0);
    shelfTop.castShadow = true;
    shelfTop.receiveShadow = true;
    shelfGroup.add(shelfTop);

    // Oatmeal Wool Felt Mat inlay on top of shelf
    const feltMat = new THREE.MeshStandardMaterial({ color: 0xded6c9, roughness: 0.88 });
    const feltInlay = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.012, 0.95), feltMat);
    feltInlay.position.set(0, 0.31, 0);
    shelfGroup.add(feltInlay);

    // Warm Bronze Risers / Legs
    const riserMat = new THREE.MeshStandardMaterial({ color: 0x32302e, roughness: 0.45, metalness: 0.65 });
    const riserLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.9), riserMat);
    riserLeft.position.set(-1.95, 0.13, 0);
    riserLeft.castShadow = true;
    shelfGroup.add(riserLeft);

    const riserRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.9), riserMat);
    riserRight.position.set(1.95, 0.13, 0);
    riserRight.castShadow = true;
    shelfGroup.add(riserRight);

    // B. Warm Graphite & Brass L-Stand with Beveled Chamfers (Elevated on top of Shelf)
    const aluMat = new THREE.MeshStandardMaterial({ color: 0x32302e, roughness: 0.35, metalness: 0.7 });
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.8), aluMat);
    standBase.position.set(0, 0.32, 0.08);
    standBase.receiveShadow = true;
    this.displayGroup.add(standBase);

    const standArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.2, 0.08), aluMat);
    standArm.position.set(0, 0.95, -0.15);
    standArm.rotation.x = -0.06;
    standArm.castShadow = true;
    this.displayGroup.add(standArm);

    // C. Studio Display Enclosure (Elevated 16:10 Minimalist Screen)
    const monitorBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.3, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1f1d1b, roughness: 0.45, metalness: 0.5 })
    );
    monitorBody.position.set(0, 1.75, 0);
    monitorBody.castShadow = true;
    this.displayGroup.add(monitorBody);

    // Front Screen Glass Face
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 640;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.renderScreenContent();

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.anisotropy = 8;
    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTexture });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.48, 2.18), screenMat);
    screenMesh.position.set(0, 1.75, 0.045);
    this.displayGroup.add(screenMesh);

    // Interactive Trigger on Display
    monitorBody.userData = {
      type: 'section-trigger',
      section: 'skills',
      name: 'Studio Display & Desk Shelf (Tech Stack & Cloud DevOps)'
    };
    this.interactiveObjects.push(monitorBody);

    // D. Mac Studio Workstation Pod (Elevated beside display on shelf)
    const macGroup = new THREE.Group();
    macGroup.position.set(1.5, 0.31, 0.0);
    this.displayGroup.add(macGroup);

    const macMat = new THREE.MeshStandardMaterial({ color: 0x2e2c2a, roughness: 0.35, metalness: 0.75 });
    const macBody = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.36, 0.68), macMat);
    macBody.position.set(0, 0.18, 0);
    macBody.castShadow = true;
    macBody.receiveShadow = true;
    macGroup.add(macBody);

    // Breathing Warm Amber LED on Front
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffe2b5 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), ledMat);
    led.position.set(0.24, 0.08, 0.345);
    macGroup.add(led);

    // Interactive Trigger on Mac Studio
    macBody.userData = {
      type: 'section-trigger',
      section: 'skills',
      name: 'Mac Studio Workstation Pod'
    };
    this.interactiveObjects.push(macBody);
  }

  renderScreenContent() {
    const ctx = this.screenCtx;
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, 1024, 640);

    // Top Title Bar
    ctx.fillStyle = '#2b2723';
    ctx.fillRect(0, 0, 1024, 48);

    // Window Dots (Soft Muted Tones)
    const dots = ['#d96e57', '#d9a752', '#69ab6e'];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(32 + i * 22, 24, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    ctx.fillStyle = '#9e9185';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText('trident-core-runtime :: ASP.NET Core & Azure OpenAI Cloud Engine', 140, 30);

    // Terminal Code Lines (Warm Amber, Sage & Terracotta palette)
    const lines = [
      { text: '// TRIDENT CLOUD INFRASTRUCTURE & ARCHITECTURE', color: '#968374' },
      { text: 'builder.Services.AddAzureOpenAIClient(endpoint, new DefaultAzureCredential());', color: '#8bbd8c' },
      { text: 'builder.Services.AddSingleton<IAgentOrchestrator, AutonomousAgentCluster>();', color: '#e5b567' },
      { text: 'app.MapGrpcService<MortgageHighVolumeProcessor>(); // FPT PVS Home Closing', color: '#d97d64' },
      { text: 'app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => true });', color: '#dfcca8' },
      { text: 'var container = new DockerEngine("ghcr.io/trident/insurance-online:latest");', color: '#d0a27d' },
      { text: '[OK] Kubernetes Cluster AZ-900: 12 pods healthy | CPU: 18% | Memory: 42%', color: '#8bbd8c' },
      { text: '[LIVE] Status: ALL PRODUCTION SERVICES HEALTHY • PORT 443', color: '#00d26a' }
    ];

    lines.forEach((line, idx) => {
      ctx.fillStyle = line.color;
      ctx.font = '500 17px "JetBrains Mono", monospace';
      ctx.fillText(line.text, 44, 110 + idx * 48);
    });

    if (this.screenTexture) this.screenTexture.needsUpdate = true;
  }

  // 3. ABOUT & PHILOSOPHY: Zen Bonsai in Hasami Ceramic Pot (Freestanding & Unobstructed)
  buildAboutSection() {
    this.aboutGroup = new THREE.Group();
    this.aboutGroup.position.set(-2.6, 0.02, -0.6);
    this.deskGroup.add(this.aboutGroup);

    // A. Minimalist Hasami Sandstone Ceramic Pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf0eae1, roughness: 0.85 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.36, 0.42, 28), potMat);
    pot.position.set(0, 0.21, 0);
    pot.castShadow = true;
    pot.receiveShadow = true;
    this.aboutGroup.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41, 0.41, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0x2e231c, roughness: 0.9 })
    );
    soil.position.set(0, 0.41, 0);
    this.aboutGroup.add(soil);

    // B. Graceful Curved Bonsai Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5e4538, roughness: 0.8 });
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 16), trunkMat);
    t1.position.set(0, 0.7, 0);
    t1.rotation.z = 0.22;
    t1.castShadow = true;
    this.aboutGroup.add(t1);

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 16), trunkMat);
    t2.position.set(0.12, 1.15, 0);
    t2.rotation.z = -0.25;
    t2.castShadow = true;
    this.aboutGroup.add(t2);

    // Tiered Zen Cloud Foliage Tufts (Deep Forest Moss Green)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x324823, roughness: 0.78 });
    const tufts = [
      { x: -0.16, y: 1.18, z: 0.06, r: 0.28 },
      { x: 0.26, y: 1.42, z: 0.04, r: 0.32 },
      { x: 0.06, y: 1.62, z: -0.05, r: 0.26 },
      { x: -0.28, y: 1.38, z: -0.08, r: 0.22 }
    ];
    tufts.forEach(t => {
      const tuft = new THREE.Mesh(new THREE.DodecahedronGeometry(t.r, 1), leafMat);
      tuft.position.set(t.x, t.y, t.z);
      tuft.castShadow = true;
      this.aboutGroup.add(tuft);
    });

    // Interactive Trigger
    pot.userData = {
      type: 'section-trigger',
      section: 'about',
      name: 'Software Engineering Philosophy & Background'
    };
    this.interactiveObjects.push(pot);
  }

  // Modern Arc Task Lamp (Positioned cleanly at far back-left corner, isolated from Bonsai)
  buildDeskLamp() {
    this.lampGroup = new THREE.Group();
    this.lampGroup.position.set(-4.0, 0.02, -1.9);
    this.deskGroup.add(this.lampGroup);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 });
    const darkAlu = new THREE.MeshStandardMaterial({ color: 0x2e2926, roughness: 0.45, metalness: 0.5 });

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 24), darkAlu);
    lampBase.position.y = 0.02;
    lampBase.receiveShadow = true;
    this.lampGroup.add(lampBase);

    // Slender Graceful Curve Arm arcing toward desk corner
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0, 2.0, 0),
      new THREE.Vector3(0.5, 2.4, 0.4),
      new THREE.Vector3(0.85, 2.1, 0.6)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.022, 12, false);
    const lampArm = new THREE.Mesh(tubeGeo, darkAlu);
    lampArm.castShadow = true;
    this.lampGroup.add(lampArm);

    // Brass Shade Collar & Bell Shade
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 24, 1, true), brassMat);
    shade.position.set(0.85, 2.0, 0.6);
    shade.rotation.z = -Math.PI / 6;
    shade.castShadow = true;
    this.lampGroup.add(shade);

    shade.userData = {
      type: 'section-trigger',
      section: 'about',
      name: 'Studio Task Lamp'
    };
    this.interactiveObjects.push(shade);
  }

  // 4. WORK EXPERIENCE: Architect's Cognac Leather Portfolio Binder & Pen
  buildExperienceSection() {
    this.expGroup = new THREE.Group();
    this.expGroup.position.set(1.7, 0.03, 0.45);
    this.expGroup.rotation.y = -0.12; // Gentle organic slant
    this.deskGroup.add(this.expGroup);

    // A. Cognac Saddle Leather Binder
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x824422, // Rich Cognac Brown
      roughness: 0.52,
      metalness: 0.06
    });
    const binder = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 1.8), leatherMat);
    binder.position.set(0, 0.03, 0);
    binder.castShadow = true;
    binder.receiveShadow = true;
    this.expGroup.add(binder);

    // Stitched Border Line
    const stitch = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.36, 0.062, 1.76)),
      new THREE.LineBasicMaterial({ color: 0xb5784a })
    );
    stitch.position.copy(binder.position);
    this.expGroup.add(stitch);

    // Inner Cream Cotton Paper Layer
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.04, 1.68),
      new THREE.MeshStandardMaterial({ color: 0xfcf8f2, roughness: 0.85 })
    );
    paper.position.set(0.04, 0.05, 0);
    this.expGroup.add(paper);

    // Polished Brass Binder Clip
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.28, metalness: 0.9 });
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.12), brassMat);
    clip.position.set(0, 0.08, -0.78);
    clip.castShadow = true;
    this.expGroup.add(clip);

    // Embossed "FPT ARCHIVE" Canvas Graphic
    const coverCanvas = document.createElement('canvas');
    coverCanvas.width = 512;
    coverCanvas.height = 512;
    const ctx = coverCanvas.getContext('2d');
    ctx.fillStyle = '#824422';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#dfab68';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FPT ARCHIVE', 256, 220);

    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('PVS MORTGAGE & NS INSURANCE', 256, 260);

    ctx.font = 'italic 18px "Instrument Serif", serif';
    ctx.fillText('Trident • Visual Design Systems', 256, 310);

    const coverTexture = new THREE.CanvasTexture(coverCanvas);
    const coverPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.55 })
    );
    coverPlate.rotation.x = -Math.PI / 2;
    coverPlate.position.set(0.04, 0.075, 0.08);
    this.expGroup.add(coverPlate);

    // Milled Aluminum Drafting Pen resting beside
    const penMat = new THREE.MeshStandardMaterial({ color: 0x3a3c42, roughness: 0.25, metalness: 0.85 });
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 16), penMat);
    pen.rotation.x = Math.PI / 2;
    pen.rotation.z = 0.08;
    pen.position.set(0.85, 0.03, 0);
    pen.castShadow = true;
    this.expGroup.add(pen);

    // Interactive Trigger
    binder.userData = {
      type: 'section-trigger',
      section: 'experience',
      name: 'FPT Experience Portfolio Binder'
    };
    this.interactiveObjects.push(binder);
  }

  // 5. CONTACT & NETWORK: Nostalgic Dieter Rams / Braun Heritage Radio (on Credenza) + Coffee & Sketchbook (on Desk)
  buildContactSection() {
    this.contactGroup = new THREE.Group();
    // Positioned gracefully on the Credenza on the right!
    this.contactGroup.position.set(4.6, 1.52, -0.4);
    this.contactGroup.rotation.y = -0.32;
    this.scene.add(this.contactGroup);

    // A. Dieter Rams / Braun Heritage Radio (Warm Toasted Ivory Enclosure)
    const radioMat = new THREE.MeshStandardMaterial({
      color: 0xf3eee5, // Warm Toasted Ivory
      roughness: 0.55,
      metalness: 0.05
    });
    const radioBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.62, 0.46), radioMat);
    radioBody.position.set(0, 0.31, 0);
    radioBody.castShadow = true;
    radioBody.receiveShadow = true;
    this.contactGroup.add(radioBody);

    // B. Natural Woven Linen Fabric Speaker Grille (Left Side)
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0xd6cbb9, roughness: 0.9, metalness: 0.05 });
    const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32), grilleMat);
    grille.rotation.x = Math.PI / 2;
    grille.position.set(-0.24, 0.32, 0.235);
    this.contactGroup.add(grille);

    // C. Brushed Aged Brass Tuning Dial (Right Side)
    const brassDialMat = new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 });
    this.tuningKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), brassDialMat);
    this.tuningKnob.rotation.x = Math.PI / 2;
    this.tuningKnob.position.set(0.25, 0.38, 0.24);
    this.tuningKnob.castShadow = true;
    this.contactGroup.add(this.tuningKnob);

    // Glowing Amber Needle Line on Dial
    const amberNeedle = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.12, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xffa500 })
    );
    amberNeedle.position.set(0, 0, 0.03);
    this.tuningKnob.add(amberNeedle);

    // Frequency Tuner Scale Glass Display
    const scaleMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.3 });
    const scalePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.09), scaleMat);
    scalePlate.position.set(0.25, 0.2, 0.235);
    this.contactGroup.add(scalePlate);

    // "ONLINE 108.4 MHz" Indicator LED (Warm Amber Glow)
    this.radioLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffa500 })
    );
    this.radioLed.position.set(0.4, 0.2, 0.24);
    this.contactGroup.add(this.radioLed);

    // D. Slender Angled Telescopic Brass Antenna
    this.antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 1.1, 16), brassDialMat);
    this.antenna.position.set(-0.38, 0.95, -0.15);
    this.antenna.rotation.z = -0.32;
    this.antenna.rotation.x = -0.15;
    this.antenna.castShadow = true;
    this.contactGroup.add(this.antenna);

    // Interactive Trigger on Radio
    radioBody.userData = {
      type: 'section-trigger',
      section: 'contact',
      name: 'Braun Heritage Radio & Studio Intercom'
    };
    this.interactiveObjects.push(radioBody);

    // E. On-Desk Station: Coffee Mug & Open Architect Sketchbook (Right-Front Desk Area)
    const deskStationGroup = new THREE.Group();
    deskStationGroup.position.set(2.4, 0.02, 0.65);
    this.deskGroup.add(deskStationGroup);

    // Hasami Ceramic Coffee Mug on Walnut Coaster
    const coasterMat = new THREE.MeshStandardMaterial({ color: 0x4a3423, roughness: 0.65 });
    const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 24), coasterMat);
    coaster.position.set(0.45, 0.012, -0.35);
    coaster.receiveShadow = true;
    deskStationGroup.add(coaster);

    const mugMat = new THREE.MeshStandardMaterial({ color: 0xf0eae1, roughness: 0.82 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.36, 24), mugMat);
    mug.position.set(0.45, 0.19, -0.35);
    mug.castShadow = true;
    deskStationGroup.add(mug);

    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.17, 24),
      new THREE.MeshStandardMaterial({ color: 0x221308, roughness: 0.15 })
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.set(0.45, 0.34, -0.35);
    deskStationGroup.add(coffee);

    // Coffee Steam Drift
    const steamGeo = new THREE.BufferGeometry();
    const count = 35;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0.45 + (Math.random() - 0.5) * 0.12;
      positions[i * 3 + 1] = 0.38 + Math.random() * 0.6;
      positions[i * 3 + 2] = -0.35 + (Math.random() - 0.5) * 0.12;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.steamPoints = new THREE.Points(
      steamGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.28 })
    );
    deskStationGroup.add(this.steamPoints);

    // Open Architect Sketchbook with Hand-Drawn Diagrams (Waxed Tan Leather Cover)
    const bookCover = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.025, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x935c39, roughness: 0.65 })
    );
    bookCover.position.set(-0.25, 0.012, 0.1);
    bookCover.rotation.y = 0.08;
    bookCover.castShadow = true;
    deskStationGroup.add(bookCover);

    const bookPaper = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.03, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.85 })
    );
    bookPaper.position.set(-0.25, 0.025, 0.1);
    bookPaper.rotation.y = 0.08;
    deskStationGroup.add(bookPaper);

    // Brushed Brass Fountain Pen resting on sketchbook
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 })
    );
    pen.rotation.x = Math.PI / 2;
    pen.rotation.z = 0.32;
    pen.position.set(-0.15, 0.05, 0.15);
    pen.castShadow = true;
    deskStationGroup.add(pen);
  }

  // 6. KEYBOARD & CRAFT: Custom 65%/75% Tactile Mechanical Keyboard (Replaces Piano)
  buildKeyboardSection() {
    this.synthGroup = new THREE.Group();
    // Positioned cleanly on the leather desk pad directly in front of the monitor
    this.synthGroup.position.set(-0.3, 0.026, 0.65);
    this.deskGroup.add(this.synthGroup);

    // A. CNC Milled Solid Aluminum Enclosure (Warm Cream Anodized)
    const caseMat = new THREE.MeshStandardMaterial({
      color: 0xebe4d5, // Warm Cream Anodized Aluminum
      roughness: 0.38,
      metalness: 0.55
    });
    const keyboardCase = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.05, 0.88), caseMat);
    keyboardCase.position.set(0, 0.025, 0);
    keyboardCase.castShadow = true;
    keyboardCase.receiveShadow = true;
    this.synthGroup.add(keyboardCase);

    // Brass Weight Bar Accent on Back Edge
    const brassWeight = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.015, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 })
    );
    brassWeight.position.set(0, 0.052, -0.38);
    this.synthGroup.add(brassWeight);

    // Knurled Brass Rotary Volume Knob (Top Right)
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.035, 24),
      new THREE.MeshStandardMaterial({ color: 0xbfa054, roughness: 0.35, metalness: 0.85 })
    );
    knob.position.set(0.98, 0.065, -0.28);
    knob.castShadow = true;
    this.synthGroup.add(knob);

    // B. Warm Retro PBT Mechanical Keycaps Layout (Cream, Chestnut & Terracotta)
    const creamKeyMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ec, roughness: 0.42 });
    const slateKeyMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.45 }); // Warm Chestnut Brown
    const accentKeyMat = new THREE.MeshStandardMaterial({ color: 0xc45d3c, roughness: 0.4 }); // Muted Terracotta Accent

    this.pianoKeys = []; // Keep populated for keyboard physics and events
    const rowConfigs = [
      // Row 0: Numbers / Esc
      { count: 12, startX: -0.96, z: -0.26, keyW: 0.125, isNumber: true },
      // Row 1: QWERTY
      { count: 12, startX: -0.94, z: -0.11, keyW: 0.125 },
      // Row 2: ASDF
      { count: 11, startX: -0.92, z: 0.04, keyW: 0.13 },
      // Row 3: Spacebar row
      { count: 7, startX: -0.88, z: 0.19, keyW: 0.13, isBottom: true }
    ];

    let keyCounter = 0;
    rowConfigs.forEach((row, rIdx) => {
      for (let c = 0; c < row.count; c++) {
        const pivot = new THREE.Group();
        let keyWidth = row.keyW;
        let isAccent = false;
        let isModifier = false;

        // Special keys
        if (rIdx === 0 && c === 0) isAccent = true; // Esc
        if (rIdx === 2 && c === row.count - 1) isAccent = true; // Enter
        if (c === 0 || c === row.count - 1) isModifier = true; // Modifiers

        // Spacebar
        if (row.isBottom && c === 3) {
          keyWidth = 0.62; // Wide spacebar
        }

        const currentX = row.startX + c * (row.keyW + 0.025);
        pivot.position.set(currentX, 0.05, row.z);

        const keyMat = isAccent ? accentKeyMat : (isModifier ? slateKeyMat : creamKeyMat);
        const keyMesh = new THREE.Mesh(
          new THREE.BoxGeometry(keyWidth - 0.018, 0.028, 0.11),
          keyMat
        );
        keyMesh.position.set(0, 0.014, 0);
        keyMesh.castShadow = true;
        pivot.add(keyMesh);
        this.synthGroup.add(pivot);

        const keyIndex = keyCounter++;
        const pitch = 0.85 + (c / row.count) * 0.45;

        keyMesh.userData = {
          type: 'piano-key',
          index: keyIndex,
          isBlack: isModifier,
          name: `Key ${keyIndex + 1}`
        };
        this.interactiveObjects.push(keyMesh);

        this.pianoKeys.push({
          pivot,
          index: keyIndex,
          isBlack: isModifier,
          pitch,
          targetRotX: 0,
          currentRotX: 0
        });
      }
    });

    // Interactive Trigger for Keyboard Enclosure
    keyboardCase.userData = {
      type: 'section-trigger',
      section: 'piano',
      name: 'Custom Mechanical Keyboard'
    };
    this.interactiveObjects.push(keyboardCase);
  }

  // Masterclass Architectural 3D Chair (/3dviz-pro-max):
  // Scandinavian Compass Lounge Armchair (Solid Honey Oak, Cognac Saddle Leather & Aged Brass)
  buildChairForeground() {
    const chairGroup = new THREE.Group();
    // Position chair in foreground with generous clearance from desk front edge (z = 2.70)
    chairGroup.position.set(0.65, -2.6, 3.65);
    chairGroup.rotation.y = -0.36; // Angled 21° to display front cushion, side compass frame and sculpted backrest
    this.scene.add(chairGroup);

    // High-End Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xc49560, // Solid Scandinavian Honey Oak
      roughness: 0.46,
      metalness: 0.04
    });

    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: 0x8a5a2e, // Smoked Oak Accent
      roughness: 0.50,
      metalness: 0.03
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x8b451e, // Hand-rubbed Cognac Saddle Leather
      roughness: 0.52,
      metalness: 0.05
    });

    const leatherTuftMat = new THREE.MeshStandardMaterial({
      color: 0x622c10, // Deep shadow cognac tone for piping welt and tufting
      roughness: 0.65
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4b065, // Aged Scandinavian Satin Brass
      roughness: 0.28,
      metalness: 0.88
    });

    // Helper: Construct structural member with pinpoint mathematical end-to-end alignment
    const createStrut = (p1, p2, rTop, rBot, mat) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const geo = new THREE.CylinderGeometry(rTop, rBot, len, 16);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // ------------------------------------------------------------------------
    // 1. Side Compass Assemblies (Inverted V-Frames with Aged Brass Ferrules)
    // ------------------------------------------------------------------------
    [-1, 1].forEach(side => {
      // Front Leg
      const pFrontFoot = new THREE.Vector3(side * 0.48, 0.0, 0.36);
      const pSeatFront = new THREE.Vector3(side * 0.45, 1.62, 0.26);
      const frontDir = new THREE.Vector3().subVectors(pSeatFront, pFrontFoot).normalize();
      const pFrontFerrule = pFrontFoot.clone().add(frontDir.clone().multiplyScalar(0.08));

      chairGroup.add(createStrut(pFrontFoot, pFrontFerrule, 0.026, 0.024, brassMat));
      chairGroup.add(createStrut(pFrontFerrule, pSeatFront, 0.036, 0.026, woodMat));

      // Rear Leg
      const pRearFoot = new THREE.Vector3(side * 0.48, 0.0, -0.42);
      const pSeatRear = new THREE.Vector3(side * 0.45, 1.62, -0.26);
      const rearDir = new THREE.Vector3().subVectors(pSeatRear, pRearFoot).normalize();
      const pRearFerrule = pRearFoot.clone().add(rearDir.clone().multiplyScalar(0.08));

      chairGroup.add(createStrut(pRearFoot, pRearFerrule, 0.026, 0.024, brassMat));
      chairGroup.add(createStrut(pRearFerrule, pSeatRear, 0.036, 0.026, woodMat));

      // Upright Backrest Stile (Continuing from rear leg joint to backrest yoke)
      const pStileTop = new THREE.Vector3(side * 0.41, 2.62, -0.40);
      chairGroup.add(createStrut(pSeatRear, pStileTop, 0.032, 0.038, woodMat));

      // Armrest Vertical Support Strut (Rising from front leg joint to armrest)
      const pArmFront = new THREE.Vector3(side * 0.45, 2.06, 0.26);
      chairGroup.add(createStrut(pSeatFront, pArmFront, 0.028, 0.034, woodMat));

      // Sculpted Armrest Paddle (Solid Honey Oak with ergonomic chamfers)
      const paddleGeo = new THREE.BoxGeometry(0.12, 0.034, 0.72);
      const paddle = new THREE.Mesh(paddleGeo, woodMat);
      paddle.position.set(side * 0.45, 2.08, 0.02);
      paddle.rotation.x = 0.04;
      paddle.castShadow = true;
      chairGroup.add(paddle);

      // Flush Inset Satin Brass Fastener Disc at Front Arm Joint
      const brassDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.038, 16), brassMat);
      brassDisc.position.set(side * 0.45, 2.08, 0.26);
      chairGroup.add(brassDisc);
    });

    // ------------------------------------------------------------------------
    // 2. Structural Cross Stretchers (Lower Rungs with Precision Mortise Fit)
    // ------------------------------------------------------------------------
    // Front cross stretcher
    chairGroup.add(createStrut(
      new THREE.Vector3(-0.47, 0.46, 0.33),
      new THREE.Vector3(0.47, 0.46, 0.33),
      0.016, 0.016, woodMat
    ));

    // Rear cross stretcher
    chairGroup.add(createStrut(
      new THREE.Vector3(-0.47, 0.52, -0.37),
      new THREE.Vector3(0.47, 0.52, -0.37),
      0.016, 0.016, woodMat
    ));

    // Left & Right side stretchers
    [-1, 1].forEach(side => {
      chairGroup.add(createStrut(
        new THREE.Vector3(side * 0.47, 0.49, 0.33),
        new THREE.Vector3(side * 0.47, 0.49, -0.37),
        0.016, 0.016, woodMat
      ));
    });

    // ------------------------------------------------------------------------
    // 3. Solid Oak Seat Frame (Apron Perimeter)
    // ------------------------------------------------------------------------
    const seatFrameGroup = new THREE.Group();
    seatFrameGroup.position.set(0, 1.58, 0);
    chairGroup.add(seatFrameGroup);

    // Front rail
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.05), woodMat);
    railFront.position.set(0, 0, 0.26);
    railFront.castShadow = true;
    seatFrameGroup.add(railFront);

    // Rear rail
    const railBack = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.05), woodMat);
    railBack.position.set(0, 0, -0.26);
    railBack.castShadow = true;
    seatFrameGroup.add(railBack);

    // Left & Right side rails
    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.52), woodMat);
    railLeft.position.set(-0.43, 0, 0);
    railLeft.castShadow = true;
    seatFrameGroup.add(railLeft);

    const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.52), woodMat);
    railRight.position.set(0.43, 0, 0);
    railRight.castShadow = true;
    seatFrameGroup.add(railRight);

    // Solid base sub-panel under cushion
    const basePanel = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.02, 0.48), woodDarkMat);
    basePanel.position.set(0, -0.04, 0);
    seatFrameGroup.add(basePanel);

    // ------------------------------------------------------------------------
    // 4. Ergonomic Cognac Saddle Leather Seat Cushion with French Welt
    // ------------------------------------------------------------------------
    const sw = 0.40, sd = 0.25, sr = 0.07;
    const seatShape = new THREE.Shape();
    seatShape.moveTo(-sw + sr, -sd);
    seatShape.lineTo(sw - sr, -sd);
    seatShape.quadraticCurveTo(sw, -sd, sw, -sd + sr);
    seatShape.lineTo(sw, sd - sr);
    seatShape.quadraticCurveTo(sw, sd, sw - sr, sd);
    seatShape.lineTo(-sw + sr, sd);
    seatShape.quadraticCurveTo(-sw, sd, -sw, sd - sr);
    seatShape.lineTo(-sw, -sd + sr);
    seatShape.quadraticCurveTo(-sw, -sd, -sw + sr, -sd);

    const cushionGeo = new THREE.ExtrudeGeometry(seatShape, {
      depth: 0.10,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.024,
      bevelThickness: 0.022
    });

    const seatCushion = new THREE.Mesh(cushionGeo, leatherMat);
    seatCushion.rotation.x = -Math.PI / 2;
    seatCushion.position.set(0, 1.58, 0);
    seatCushion.castShadow = true;
    seatCushion.receiveShadow = true;
    chairGroup.add(seatCushion);

    // Tailored Saddle-Stitched Perimeter Welt (Contoured Tube hugging cushion boundary)
    const weltPoints = [
      new THREE.Vector3(-sw + sr, 1.63, sd),
      new THREE.Vector3(sw - sr,  1.63, sd),
      new THREE.Vector3(sw,       1.63, sd - sr),
      new THREE.Vector3(sw,       1.63, -sd + sr),
      new THREE.Vector3(sw - sr,  1.63, -sd),
      new THREE.Vector3(-sw + sr, 1.63, -sd),
      new THREE.Vector3(-sw,      1.63, -sd + sr),
      new THREE.Vector3(-sw,      1.63, sd - sr)
    ];
    const weltCurve = new THREE.CatmullRomCurve3(weltPoints, true, 'centripetal', 0.2);
    const weltGeo = new THREE.TubeGeometry(weltCurve, 48, 0.010, 10, true);
    const weltMesh = new THREE.Mesh(weltGeo, leatherTuftMat);
    chairGroup.add(weltMesh);

    // 4 Leather Tufting Buttons on Seat Surface
    const tuftPositions = [
      [-0.18, 0.10],
      [0.18,  0.10],
      [-0.18, -0.10],
      [0.18,  -0.10]
    ];
    tuftPositions.forEach(([tx, tz]) => {
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.012, 12), leatherTuftMat);
      button.position.set(tx, 1.722, tz);
      chairGroup.add(button);
    });

    // ------------------------------------------------------------------------
    // 5. Sculpted Bentwood Backrest Yoke & Upholstered Lumbar Support
    // ------------------------------------------------------------------------
    // Sculpted Continuous Bentwood Yoke (CatmullRom Spline passing precisely through stiles)
    const backrestCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.45, 2.12, -0.06), // Left armrest junction
      new THREE.Vector3(-0.44, 2.45, -0.28), // Left shoulder curve
      new THREE.Vector3(-0.41, 2.62, -0.40), // Left stile top junction
      new THREE.Vector3(0.0,   2.66, -0.44), // Center crest
      new THREE.Vector3(0.41,  2.62, -0.40), // Right stile top junction
      new THREE.Vector3(0.44,  2.45, -0.28), // Right shoulder curve
      new THREE.Vector3(0.45,  2.12, -0.06)  // Right armrest junction
    ]);
    const topRailGeo = new THREE.TubeGeometry(backrestCurve, 48, 0.036, 16, false);
    const topRailMesh = new THREE.Mesh(topRailGeo, woodMat);
    topRailMesh.castShadow = true;
    chairGroup.add(topRailMesh);

    // Horizontal Rear Support Rails for Lumbar Cushion
    [2.15, 2.32].forEach(ry => {
      chairGroup.add(createStrut(
        new THREE.Vector3(-0.42, ry, -0.36),
        new THREE.Vector3(0.42, ry, -0.36),
        0.014, 0.014, woodDarkMat
      ));
    });

    // Upholstered Leather Lumbar Cushion Inlay
    const lumbarPadGeo = new THREE.BoxGeometry(0.64, 0.28, 0.06);
    const lumbarPad = new THREE.Mesh(lumbarPadGeo, leatherMat);
    lumbarPad.position.set(0, 2.22, -0.34);
    lumbarPad.rotation.x = -0.16;
    lumbarPad.castShadow = true;
    chairGroup.add(lumbarPad);

    // Decorative Leather Welt on Lumbar Cushion
    const lumbarWeltGeo = new THREE.BoxGeometry(0.65, 0.29, 0.01);
    const lumbarWelt = new THREE.Mesh(lumbarWeltGeo, leatherTuftMat);
    lumbarWelt.position.set(0, 2.22, -0.37);
    lumbarWelt.rotation.x = -0.16;
    chairGroup.add(lumbarWelt);

    // Register chair as interactive object in the studio
    chairGroup.userData = {
      type: 'chair',
      name: 'Ghế Kiến Trúc Bắc Âu (Solid Honey Oak & Da Bò Cognac)'
    };
    this.interactiveObjects.push(chairGroup);
  }

  // Focus Camera on specific Section smoothly (Adaptive for Mobile / Desktop)
  focusSection(sectionName) {
    if (this.cameraFocusPoints[sectionName]) {
      this.activeSection = sectionName;
      const pt = (this.isMobile && this.cameraFocusPointsMobile && this.cameraFocusPointsMobile[sectionName])
        ? this.cameraFocusPointsMobile[sectionName]
        : this.cameraFocusPoints[sectionName];
      this.targetCameraPos.copy(pt.pos);
      this.lookAtTarget.copy(pt.target);
      return pt;
    }
    return null;
  }

  // Cycle viewpoints using navigation arrows or swipe gestures
  switchAngle(dir = 1) {
    const keys = Object.keys(this.cameraFocusPoints);
    let currentIndex = keys.indexOf(this.activeSection);
    if (currentIndex === -1) currentIndex = 0;
    const nextIndex = (currentIndex + dir + keys.length) % keys.length;
    const nextKey = keys[nextIndex];
    return this.focusSection(nextKey);
  }

  // Get screen anchor coordinates for HUD pins
  getScreenAnchors() {
    return {
      certifications: this.toScreenPos(new THREE.Vector3(0.0, 3.8, -3.0)), // Wall frames
      skills: this.toScreenPos(new THREE.Vector3(0.0, 2.55, -0.9)),        // Studio Display on Desk Shelf
      about: this.toScreenPos(new THREE.Vector3(-2.6, 1.3, -0.8)),         // Bonsai
      experience: this.toScreenPos(new THREE.Vector3(1.7, 0.35, 0.45)),    // Leather portfolio
      contact: this.toScreenPos(new THREE.Vector3(4.6, 1.95, -0.4)),       // Braun radio on credenza
      piano: this.toScreenPos(new THREE.Vector3(-0.3, 0.25, 0.65))         // Custom tactile mechanical keyboard
    };
  }

  toScreenPos(worldPos) {
    const v = worldPos.clone();
    v.project(this.camera);
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
    const visible = v.z < 1.0;
    return { x, y, visible };
  }

  setupEvents() {
    this.onPointerMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Gentle mouse breathing parallax around active camera focus point (desktop only)
      if (!this.isMobile) {
        const pt = this.cameraFocusPoints[this.activeSection] || this.cameraFocusPoints.overview;
        this.targetCameraPos.x = pt.pos.x + this.mouse.x * 0.25;
        this.targetCameraPos.y = pt.pos.y + this.mouse.y * 0.18;
      }

      // If hovering over HTML UI or if drawer is open, keep default cursor and don't raycast
      const target = e.target;
      if (document.querySelector('.drawer-modal.active') || (target && target.closest && (
        target.closest('.top-bar') ||
        target.closest('.bottom-bar') ||
        target.closest('.drawer-modal') ||
        target.closest('.drawer-backdrop') ||
        target.closest('.manifesto-popover') ||
        target.closest('button') ||
        target.closest('a')
      ))) {
        this.container.style.cursor = 'default';
        return;
      }

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      this.container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    this.onPointerDown = (e) => {
      // 1. If click target is inside ANY HTML UI element, ignore 3D raycasting
      const target = e.target;
      if (target && target.closest && (
        target.closest('.top-bar') ||
        target.closest('.bottom-bar') ||
        target.closest('.drawer-modal') ||
        target.closest('.drawer-backdrop') ||
        target.closest('.manifesto-popover') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input')
      )) {
        return;
      }

      // 2. If drawer modal is active/open, do not trigger background 3D interactions
      if (document.querySelector('.drawer-modal.active')) {
        return;
      }

      // 3. Only accept clicks intended for the 3D canvas viewport
      if (target && target !== this.renderer.domElement && target !== this.container && !this.container.contains(target)) {
        return;
      }

      if (e.clientX !== undefined && e.clientY !== undefined) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      if (intersects.length > 0) {
        this.triggerInteraction(intersects[0].object);
      }
    };

    this.onResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      this.isMobile = aspect < 1.0 || window.innerWidth < 768;
      this.camera.aspect = aspect;
      this.camera.fov = this.isMobile ? 62 : 45;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Refresh camera target based on new mobile state
      const pt = (this.isMobile && this.cameraFocusPointsMobile && this.cameraFocusPointsMobile[this.activeSection])
        ? this.cameraFocusPointsMobile[this.activeSection]
        : this.cameraFocusPoints[this.activeSection];
      if (pt) {
        this.targetCameraPos.copy(pt.pos);
        this.lookAtTarget.copy(pt.target);
      }
    };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerdown', this.onPointerDown);

    // Touch Swipe Gesture for switching angles seamlessly on mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      // Don't trigger scene swipe if tapping/swiping inside open modal, drawer or controls
      const target = e.target;
      if (target && target.closest && (target.closest('.drawer-modal') || target.closest('.manifesto-popover') || target.closest('.top-bar') || target.closest('.bottom-bar'))) {
        return;
      }

      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const duration = Date.now() - touchStartTime;

        // Valid swipe: distance > 45px, mostly horizontal, under 500ms
        if (duration < 500 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
          if (deltaX < 0) {
            // Swipe Left -> Next Perspective
            this.switchAngle(1);
          } else {
            // Swipe Right -> Previous Perspective
            this.switchAngle(-1);
          }
          if (navigator.vibrate) {
            try { navigator.vibrate(15); } catch (_) {}
          }
          window.dispatchEvent(new CustomEvent('trident-cam-switch', {
            detail: { section: this.activeSection }
          }));
        }
      }
    }, { passive: true });
  }

  triggerInteraction(object) {
    let current = object;
    let data = current ? current.userData : null;
    // Walk up ancestor chain to find interactive node
    while (current && (!data || !data.type)) {
      current = current.parent;
      if (current) data = current.userData;
    }
    if (!data || !data.type) return;

    if (data.type === 'piano-key') {
      const k = this.pianoKeys.find(key => key.index === data.index);
      if (k) {
        k.targetRotX = 0.16;
        synth.playMechanicalThock(k.pitch || 1.0);
        window.dispatchEvent(new CustomEvent('trident-interaction', {
          detail: { message: `Tactile Keycap #${data.index + 1} bottom-out`, icon: 'keyboard' }
        }));
      }
    } else if (data.type === 'section-trigger') {
      const section = data.section;
      let icon = 'sparkle';

      if (section === 'about') {
        icon = 'craft';
        synth.playTactileClick(850);
        this.bonsaiWobble = 0.3;
        if (this.deskLampSpotlight) {
          this.deskLampSpotlight.intensity = this.deskLampSpotlight.intensity > 1 ? 0 : 3.2;
        }
      } else if (section === 'experience') {
        icon = 'folder';
        synth.playFolderOpen();
      } else if (section === 'certifications') {
        icon = 'award';
        synth.playHologramPulse();
      } else if (section === 'skills') {
        icon = 'display';
        synth.playTactileClick(1300);
        this.renderScreenContent();
      } else if (section === 'contact') {
        icon = 'radio';
        synth.playRadioTune();
        this.antennaWobble = 0.35;
        this.radioDialPulse = 1.0;
        if (this.tuningKnob) this.tuningKnob.rotation.z += 0.45;
      } else if (section === 'piano') {
        icon = 'keyboard';
        if (this.pianoKeys[0]) {
          this.pianoKeys[0].targetRotX = 0.16;
          synth.playMechanicalThock(1.0);
        }
      }

      this.focusSection(section);
      window.dispatchEvent(new CustomEvent('trident-open-drawer', { detail: { tab: `tab-${section}` } }));
      window.dispatchEvent(new CustomEvent('trident-interaction', {
        detail: { message: `Focus: ${data.name}`, icon: icon }
      }));
    } else if (data.type === 'chair') {
      synth.playTactileClick(650);
      window.dispatchEvent(new CustomEvent('trident-interaction', {
        detail: { message: 'Ghế Kiến Trúc Bắc Âu (Solid Honey Oak & Da Bò Cognac)', icon: 'craft' }
      }));
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth Camera Focus Lerping (Damped spring glide)
    this.currentCameraPos.lerp(this.targetCameraPos, 0.05);
    this.currentLookAt.lerp(this.lookAtTarget, 0.05);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.currentLookAt);

    // Piano key spring physics
    this.pianoKeys.forEach(k => {
      k.currentRotX += (k.targetRotX - k.currentRotX) * 0.35;
      k.pivot.rotation.x = k.currentRotX;
      k.targetRotX *= 0.65;
    });

    // Antenna wobble physics on Radio
    if (this.antennaWobble > 0.001 && this.antenna) {
      this.antenna.rotation.x = -0.15 + Math.sin(time * 28) * this.antennaWobble;
      this.antennaWobble *= 0.93;
    }

    // Radio LED breathing pulse
    if (this.radioLed) {
      const pulse = 0.5 + Math.sin(time * 3.5) * 0.4;
      this.radioLed.material.color.setRGB(0, 0.8 * pulse + 0.2, 0.4 * pulse);
    }

    // Bonsai wobble
    if (this.bonsaiWobble > 0.001 && this.aboutGroup) {
      this.aboutGroup.rotation.z = Math.sin(time * 18) * this.bonsaiWobble;
      this.bonsaiWobble *= 0.92;
    } else if (this.aboutGroup) {
      this.aboutGroup.rotation.z = 0;
    }

    // Coffee Steam drifting
    if (this.steamPoints) {
      const pos = this.steamPoints.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += delta * 0.22;
        if (pos[i] > 1.05) pos[i] = 0.42;
      }
      this.steamPoints.geometry.attributes.position.needsUpdate = true;
    }

    // Ambient Sun Dust Motes drifting in sunlight shaft
    if (this.dustPoints) {
      const pos = this.dustPoints.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 0.09;
        if (pos[i] < 0.2) pos[i] = 4.2;
      }
      this.dustPoints.geometry.attributes.position.needsUpdate = true;
    }

    // Sheer Linen Curtain subtle gentle flutter
    if (this.curtainGroup) {
      this.curtainGroup.rotation.y = Math.sin(time * 0.8) * 0.025;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
