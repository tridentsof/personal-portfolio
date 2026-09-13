import * as THREE from 'three';
import { synth } from '../audio/synth.js';

export class CreativeDeskScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.interactiveObjects = [];
    this.mouse = new THREE.Vector2();

    // Camera Focus Presets for each Section
    this.cameraFocusPoints = {
      overview: { pos: new THREE.Vector3(3.2, 4.4, 7.8), target: new THREE.Vector3(-0.3, 0.6, 0.1), name: 'Overview' },
      about: { pos: new THREE.Vector3(-1.8, 2.6, 2.0), target: new THREE.Vector3(-2.6, 1.0, -0.6), name: 'About & Philosophy' },
      experience: { pos: new THREE.Vector3(1.5, 2.4, 2.4), target: new THREE.Vector3(1.7, 0.2, 0.4), name: 'FPT Work Experience' },
      certifications: { pos: new THREE.Vector3(0.0, 3.8, 2.2), target: new THREE.Vector3(0.0, 3.6, -3.0), name: 'Certifications (AZ-900 & AI)' },
      skills: { pos: new THREE.Vector3(0.0, 2.5, 2.5), target: new THREE.Vector3(0.0, 1.7, -0.9), name: 'Tech Stack & Tools' },
      contact: { pos: new THREE.Vector3(3.2, 2.7, 1.6), target: new THREE.Vector3(4.6, 1.55, -0.4), name: 'Contact & Radio' },
      piano: { pos: new THREE.Vector3(-0.3, 2.3, 2.3), target: new THREE.Vector3(-0.3, 0.2, 0.65), name: 'Custom Keyboard' }
    };

    this.activeSection = 'overview';
    this.targetCameraPos = this.cameraFocusPoints.overview.pos.clone();
    this.currentCameraPos = this.cameraFocusPoints.overview.pos.clone();
    this.lookAtTarget = this.cameraFocusPoints.overview.target.clone();
    this.currentLookAt = this.cameraFocusPoints.overview.target.clone();

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
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
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
        title: 'AZ-900',
        subtitle: 'MICROSOFT AZURE FUNDAMENTAL',
        badgeColor: 0x0078d4, // Azure Blue
        type: 'Cloud Architecture'
      },
      {
        id: 'ai-103',
        x: 0.0,
        title: 'AI-103',
        subtitle: 'DEVELOP AI APPS & AGENTS',
        badgeColor: 0x7928ca, // AI Purple
        type: 'Agentic AI & LLMs'
      },
      {
        id: 'ab-100',
        x: 2.2,
        title: 'AB-100 / GB-300',
        subtitle: 'SOLUTIONS ARCHITECT & COPILOT',
        badgeColor: 0x107c41, // Copilot / Solutions Green
        type: 'Autonomous Systems'
      }
    ];

    certData.forEach(cert => {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(cert.x, 0, 0);

      // A. Slim Anodized Black Frame
      const frameGeo = new THREE.BoxGeometry(1.7, 1.15, 0.03);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.3, metalness: 0.7 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      frameGroup.add(frame);

      // B. Fine Art Cardstock Inside
      const paperGeo = new THREE.PlaneGeometry(1.58, 1.03);
      const paperMat = new THREE.MeshStandardMaterial({ color: 0xfbf9f5, roughness: 0.85 });
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.z = 0.018;
      frameGroup.add(paper);

      // C. Technical Certificate Canvas Graphic Texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 340;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#faf7f2';
      ctx.fillRect(0, 0, 512, 340);

      // Double Geometric Border
      ctx.strokeStyle = '#d4c5b3';
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, 476, 304);
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(26, 26, 460, 288);

      // Certificate Header
      ctx.fillStyle = '#1e242b';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cert.title, 256, 75);

      ctx.fillStyle = '#7a6e60';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText(cert.subtitle, 256, 105);

      // Ribbon / Technical Badge
      ctx.fillStyle = cert.id === 'az-900' ? '#0078d4' : (cert.id === 'ai-103' ? '#7928ca' : '#107c41');
      ctx.beginPath();
      ctx.arc(256, 170, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓', 256, 176);

      // Recipient
      ctx.fillStyle = '#222222';
      ctx.font = 'italic 16px "Instrument Serif", serif';
      ctx.fillText('Awarded to Trident (Đặng Phước Trí)', 256, 238);

      // Bottom Metadata
      ctx.fillStyle = '#9e9182';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText(`VERIFIED CREDENTIAL • ${cert.type.toUpperCase()}`, 256, 275);

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
      { text: '✓ Kubernetes Cluster AZ-900: 12 pods healthy | CPU: 18% | Memory: 42%', color: '#8bbd8c' },
      { text: '✓ Status: ALL PRODUCTION SERVICES HEALTHY • LISTENING ON PORT 443', color: '#00d26a' }
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

  buildChairForeground() {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0.35, -2.6, 2.6);
    chairGroup.rotation.y = -0.22;
    this.scene.add(chairGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xc89b67, roughness: 0.52 });
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xe3d2b6, roughness: 0.88 });

    // 1. Steam-bent Continuous Curved Backrest & Armrest
    const backCurve = new THREE.TorusGeometry(0.88, 0.045, 16, 32, Math.PI * 0.95);
    const backrest = new THREE.Mesh(backCurve, woodMat);
    backrest.position.set(0, 1.85, 0);
    backrest.rotation.x = Math.PI / 2;
    backrest.castShadow = true;
    chairGroup.add(backrest);

    // 2. Wishbone Y-Splat Spine Support
    const spineStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 12), woodMat);
    spineStem.position.set(0, 1.42, -0.85);
    spineStem.castShadow = true;
    chairGroup.add(spineStem);

    const branchLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12), woodMat);
    branchLeft.position.set(-0.1, 1.68, -0.85);
    branchLeft.rotation.z = 0.35;
    chairGroup.add(branchLeft);

    const branchRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12), woodMat);
    branchRight.position.set(0.1, 1.68, -0.85);
    branchRight.rotation.z = -0.35;
    chairGroup.add(branchRight);

    // 3. Side Armrest Downward Supports
    const armLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 12), woodMat);
    armLeft.position.set(-0.85, 1.5, 0.2);
    armLeft.castShadow = true;
    chairGroup.add(armLeft);

    const armRight = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 12), woodMat);
    armRight.position.set(0.85, 1.5, 0.2);
    armRight.castShadow = true;
    chairGroup.add(armRight);

    // 4. Woven Paper Cord Seat Frame
    const seatGeo = new THREE.CylinderGeometry(0.82, 0.78, 0.08, 28);
    const seatMesh = new THREE.Mesh(seatGeo, cordMat);
    seatMesh.position.set(0, 1.18, 0.05);
    seatMesh.castShadow = true;
    seatMesh.receiveShadow = true;
    chairGroup.add(seatMesh);

    // 5. Tapered Splayed Wood Legs
    const legPositions = [
      [-0.65, 0.58, -0.55],
      [0.65, 0.58, -0.55],
      [-0.68, 0.58, 0.62],
      [0.68, 0.58, 0.62]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 1.2, 16), woodMat);
      leg.position.set(lx, ly, lz);
      leg.rotation.z = lx > 0 ? -0.06 : 0.06;
      leg.rotation.x = lz > 0 ? 0.06 : -0.06;
      leg.castShadow = true;
      chairGroup.add(leg);
    });

    // Horizontal Stretchers between legs
    const stretcherFront = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 12), woodMat);
    stretcherFront.rotation.z = Math.PI / 2;
    stretcherFront.position.set(0, 0.45, 0.62);
    chairGroup.add(stretcherFront);

    const stretcherBack = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 12), woodMat);
    stretcherBack.rotation.z = Math.PI / 2;
    stretcherBack.position.set(0, 0.45, -0.55);
    chairGroup.add(stretcherBack);
  }

  // Focus Camera on specific Section smoothly
  focusSection(sectionName) {
    if (this.cameraFocusPoints[sectionName]) {
      this.activeSection = sectionName;
      const pt = this.cameraFocusPoints[sectionName];
      this.targetCameraPos.copy(pt.pos);
      this.lookAtTarget.copy(pt.target);
      return pt;
    }
    return null;
  }

  // Cycle viewpoints using navigation arrows
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

      // Gentle mouse breathing parallax around active camera focus point
      const pt = this.cameraFocusPoints[this.activeSection] || this.cameraFocusPoints.overview;
      this.targetCameraPos.x = pt.pos.x + this.mouse.x * 0.25;
      this.targetCameraPos.y = pt.pos.y + this.mouse.y * 0.18;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      this.container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    this.onPointerDown = () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      if (intersects.length > 0) {
        this.triggerInteraction(intersects[0].object);
      }
    };

    this.onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerdown', this.onPointerDown);
  }

  triggerInteraction(object) {
    let data = object.userData;
    // Walk up parents if needed
    if (!data || !data.type) {
      if (object.parent && object.parent.userData && object.parent.userData.type) {
        data = object.parent.userData;
      }
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
