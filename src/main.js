import { CreativeDeskScene } from './scene/creative-desk.js';
import { synth } from './audio/synth.js';

const TOAST_ICONS = {
  craft: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
  sprout: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c0-6 4-7 4-13a4 4 0 0 0-8 0c0 4 2 8 4 13z"/><path d="M14 13c3 0 6 1 6 5"/></svg>`,
  folder: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  award: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  display: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  radio: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><circle cx="8" cy="14" r="3"/><line x1="15" y1="11" x2="19" y2="11"/><line x1="15" y1="14" x2="19" y2="14"/><line x1="15" y1="17" x2="19" y2="17"/><line x1="7" y1="7" x2="15" y2="2"/></svg>`,
  keyboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
  light: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  sparkle: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>`,
  pin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Fullscreen 3D Scene
  const canvasContainer = document.getElementById('canvas-container');
  let deskScene = null;

  if (canvasContainer) {
    deskScene = new CreativeDeskScene(canvasContainer);
  }

  // 2. Sound Toggle & Live Equalizer Visualizer
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');
  const eqBars = document.querySelectorAll('.eq-bar');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isMuted = synth.toggleMute();
      if (isMuted) {
        soundText.textContent = 'MUTED';
        soundToggleBtn.style.opacity = '0.55';
      } else {
        soundText.textContent = 'AUDIO';
        soundToggleBtn.style.opacity = '1';
        synth.playTactileClick(1200);
      }
    });
  }

  // Animate Equalizer on Note Play
  synth.onNote(() => {
    eqBars.forEach((bar, idx) => {
      const randomH = 6 + Math.random() * 8;
      bar.style.height = `${randomH}px`;
    });
    setTimeout(() => {
      eqBars.forEach((bar) => {
        bar.style.height = '4px';
      });
    }, 240);
  });

  // 4. Lighting Rig Presets Switcher
  const lightBtns = document.querySelectorAll('.light-preset-btn');
  lightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lightBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.light;
      if (deskScene && deskScene.setLightingMode) {
        deskScene.setLightingMode(mode);
        synth.playTactileClick(1150);
        showToast(`Studio Lighting: ${mode.toUpperCase()} preset applied`, 'light');
      }
    });
  });

  // 5. Drawer Modal Controller (Single Page navigation)
  const drawerModal = document.getElementById('drawerModal');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const closeDrawerBtn = document.getElementById('closeDrawer');
  const openDrawerBtn = document.getElementById('openDrawerBtn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const openDrawerWithTab = (tabId) => {
    if (!drawerModal || !drawerBackdrop) return;
    drawerModal.classList.add('active');
    drawerBackdrop.classList.add('active');

    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Synchronize 3D Camera focus with section
    const section = tabId.replace('tab-', '');
    if (deskScene && deskScene.focusSection) {
      const active = deskScene.focusSection(section);
      if (active && camAngleName) {
        camAngleName.textContent = `VIEW: ${active.name.toUpperCase()}`;
      }
    }

    synth.playTactileClick(1000);
  };

  const closeDrawer = () => {
    if (!drawerModal || !drawerBackdrop) return;
    drawerModal.classList.remove('active');
    drawerBackdrop.classList.remove('active');

    // Reset camera to studio overview
    if (deskScene && deskScene.focusSection) {
      deskScene.focusSection('overview');
      if (camAngleName) {
        camAngleName.textContent = 'VIEW: OVERVIEW';
      }
    }

    synth.playTactileClick(800);
  };

  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  if (openDrawerBtn) openDrawerBtn.addEventListener('click', () => openDrawerWithTab('tab-about'));

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openDrawerWithTab(btn.dataset.tab);
    });
  });

  const navButtons = document.querySelectorAll('.nav-btn');
  const navMap = {
    'home': () => closeDrawer(),
    'about': () => openDrawerWithTab('tab-about'),
    'experience': () => openDrawerWithTab('tab-experience'),
    'certifications': () => openDrawerWithTab('tab-certifications'),
    'skills': () => openDrawerWithTab('tab-skills'),
    'contact': () => openDrawerWithTab('tab-contact')
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (navMap[target]) navMap[target]();
    });
  });

  // Camera Switch Buttons
  const camAnglePrev = document.getElementById('camAnglePrev');
  const camAngleNext = document.getElementById('camAngleNext');
  const camAngleName = document.getElementById('camAngleName');

  const updateCamAngle = (dir) => {
    if (deskScene && deskScene.switchAngle) {
      const active = deskScene.switchAngle(dir);
      if (camAngleName) {
        camAngleName.textContent = `VIEW: ${active.name.toUpperCase()}`;
      }
    }
  };

  if (camAnglePrev) camAnglePrev.addEventListener('click', () => updateCamAngle(-1));
  if (camAngleNext) camAngleNext.addEventListener('click', () => updateCamAngle(1));

  // Dock Buttons
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) menuToggle.addEventListener('click', () => openDrawerWithTab('tab-about'));

  const quickSearch = document.getElementById('quickSearch');
  if (quickSearch) quickSearch.addEventListener('click', () => openDrawerWithTab('tab-skills'));

  const codeViewToggle = document.getElementById('codeViewToggle');
  if (codeViewToggle) codeViewToggle.addEventListener('click', () => openDrawerWithTab('tab-skills'));

  // 6. Engineering Manifesto Status Chip & Popover Controller
  const manifestoChipBtn = document.getElementById('manifestoChipBtn');
  const manifestoPopover = document.getElementById('manifestoPopover');
  const manifestoPopoverClose = document.getElementById('manifestoPopoverClose');
  const manifestoReadMore = document.getElementById('manifestoReadMore');

  if (manifestoChipBtn && manifestoPopover) {
    manifestoChipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = manifestoPopover.classList.contains('open');
      if (isOpen) {
        manifestoPopover.classList.remove('open');
        manifestoChipBtn.classList.remove('active');
      } else {
        manifestoPopover.classList.add('open');
        manifestoChipBtn.classList.add('active');
        synth.playTactileClick(1100);
        showToast('Software Engineering Manifesto: Craftsmanship & Maintenance', 'craft');
      }
    });

    if (manifestoPopoverClose) {
      manifestoPopoverClose.addEventListener('click', (e) => {
        e.stopPropagation();
        manifestoPopover.classList.remove('open');
        manifestoChipBtn.classList.remove('active');
      });
    }

    if (manifestoReadMore) {
      manifestoReadMore.addEventListener('click', () => {
        manifestoPopover.classList.remove('open');
        manifestoChipBtn.classList.remove('active');
        openDrawerWithTab('tab-about');
      });
    }

    document.addEventListener('click', (e) => {
      if (!manifestoPopover.contains(e.target) && !manifestoChipBtn.contains(e.target)) {
        manifestoPopover.classList.remove('open');
        manifestoChipBtn.classList.remove('active');
      }
    });
  }

  // Center Action Pill
  const centerActionBtn = document.getElementById('centerActionBtn');
  if (centerActionBtn && deskScene) {
    centerActionBtn.addEventListener('click', () => {
      const sequence = [0, 4, 8, 14, 18, 24, 38];
      sequence.forEach((keyIdx, i) => {
        setTimeout(() => {
          if (deskScene.pianoKeys && deskScene.pianoKeys.length > 0) {
            const k = deskScene.pianoKeys[keyIdx % deskScene.pianoKeys.length];
            if (k) {
              k.targetRotX = 0.16;
              synth.playMechanicalThock(k.pitch || (0.85 + (i % 5) * 0.08));
            }
          }
        }, i * 120);
      });
      showToast('Mechanical Switch Rhythm (PBT Keycaps bottoming out on brass plate)', 'keyboard');
    });
  }

  // Toast System
  const toast = document.getElementById('interactionToast');
  let toastTimer = null;

  const showToast = (message, iconType = 'sparkle') => {
    if (!toast) return;
    const iconSvg = TOAST_ICONS[iconType] || TOAST_ICONS.sparkle;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon-wrap ${iconType}">${iconSvg}</div>
        <span class="toast-text">${message}</span>
      </div>
    `;
    toast.classList.add('visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  };

  window.addEventListener('trident-open-drawer', (e) => {
    if (e.detail && e.detail.tab) {
      openDrawerWithTab(e.detail.tab);
    }
  });

  window.addEventListener('trident-interaction', (e) => {
    showToast(e.detail.message, e.detail.icon || 'pin');
  });

  // Physical Keyboard Control (Full Key typing with tactile thock)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (deskScene && deskScene.pianoKeys && deskScene.pianoKeys.length > 0) {
      let keyIdx = -1;
      if (e.code.startsWith('Key')) {
        const letter = e.code.replace('Key', '');
        keyIdx = (letter.charCodeAt(0) - 65) % deskScene.pianoKeys.length;
      } else if (e.code.startsWith('Digit')) {
        keyIdx = parseInt(e.code.replace('Digit', '')) % deskScene.pianoKeys.length;
      } else if (e.code === 'Space') {
        keyIdx = 38; // spacebar position
      } else if (e.code === 'Enter') {
        keyIdx = 34; // enter key
      }

      if (keyIdx >= 0) {
        const targetKey = deskScene.pianoKeys[keyIdx % deskScene.pianoKeys.length];
        if (targetKey) {
          targetKey.targetRotX = 0.17;
          synth.playMechanicalThock(targetKey.pitch || (0.85 + (keyIdx % 12) * 0.035));
        }
      }
    }
  });

  console.log('[TRIDENT] 3D Spatial Studio Initialized with 3dviz-pro-max Standards.');
});
